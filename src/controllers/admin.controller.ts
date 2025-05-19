import sign from "../functions/jwt/sign";
import { addDays, addYears } from "date-fns";
import { NextFunction, Request, Response } from "express";
import * as a2 from "argon2";
import adminModel from "../database/models/admin.model";
import * as jwt from "jsonwebtoken";
import { Token } from "../interfaces/token";
import env from "../config";
import postModel from "../database/models/post.model";
import { Types } from "mongoose";
import * as fs from "fs/promises";
import includesAll from "../utils/includes_all";

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const userExists = await adminModel.findOne({ email });

    if (!userExists)
      return res.status(404).json({ error: "The admin does not exist!" });

    const valid = await a2.verify(userExists.password, password);

    if (!valid) return res.status(400).json({ error: "Invalid password!" });

    const { password: _, ...rest } = userExists.toObject();

    const token = sign("admin", userExists._id.toString(), false);

    userExists.isLoggedIn = true;

    await userExists.save().catch((e) => {
      return res.status(500).json({
        error: `Something went wrong! Cause: ${e}`,
      });
    });

    return res
      .cookie("accessToken", token.access!, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 15,
        expires: addDays(new Date(), 15),
        path: "/",
      })
      .cookie("refreshToken", token.refresh, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        path: "/",
        expires: addYears(new Date(), 1),
      })
      .status(200)
      .json({
        message: "Successfully logged in!",
        isLoggedIn: userExists.isLoggedIn,
      });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.cookies;

    const { _id } = jwt.verify(accessToken, env.jwt.access) as Token;

    const admin = await adminModel.findById({ _id });

    if (!admin)
      return res.status(404).json({ error: "The admin does not exist!" });

    admin.isLoggedIn = false;

    await admin.save().catch((e) => {
      return res.status(500).json({
        error: `Something went wrong! Cause: ${e}`,
      });
    });

    return res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json({
        message: "Successfully logged out!",
        isLoggedIn: admin.isLoggedIn,
      });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const uploadPost = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No images uploaded." });
    }

    const { title, content, category } = JSON.parse(req.body.data);

    const imageNames = files.map((file) => file.filename);

    const post = new postModel({
      _id: new Types.ObjectId(),
      imageNames,
      title,
      content,
      category,
    });

    await post
      .save()
      .then(() => {
        return res.status(201).json({
          message: "Successfully uploaded post!",
        });
      })
      .catch((e) => {
        return res.status(500).json({
          error: `${e}`,
        });
      });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await postModel.findById({ _id: id });

    if (!post) return res.status(404).json({ error: "Post not found!" });

    await post
      .deleteOne()
      .then(async () => {
        const images = post.imageNames;
        for (const img of images)
          await fs.unlink(`uploads/${img}`).catch(() => {});
        res.status(200).json({ message: "Post deleted successfully!" });
      })
      .catch((e) => {
        return res.status(500).json({
          error: `Post could not be deleted! Reason: ${e}`,
        });
      });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    console.log("here controller");

    const files = req.files as Express.Multer.File[];
    const { title, content, category, photosToDelete } = JSON.parse(
      req.body.data
    );
    const imageNames = files.map((file) => file.filename);
    const { id } = req.params;
    const post = await postModel.findById({ _id: id });

    if (!post) {
      for (const img of photosToDelete)
        await fs.unlink(`uploads/${img}`).catch(() => {});

      return res.status(404).json({ error: "Post not found!" });
    }

    if (files && files.length) {
      for (const img of imageNames) post.imageNames.push(img);
    }

    console.log("1: ", post.imageNames);

    if ((photosToDelete as string[])?.length && photosToDelete) {
      if (!includesAll<string>(post.imageNames, photosToDelete)) {
        for (const img of photosToDelete)
          await fs.unlink(`uploads/${img}`).catch(() => {});
        for (const img of post.imageNames)
          await fs.unlink(`uploads/${img}`).catch(() => {});
        post.imageNames = post.imageNames.filter(
          (el) => !photosToDelete.includes(el)
        );
        return res.status(400).json({
          message: "Photo to delete not in image list!",
        });
      }
      for (const img of files)
        await fs.unlink(`uploads/${img}`).catch(() => {});
      post.imageNames = post.imageNames.filter(
        (el) => !photosToDelete.includes(el)
      );
    }

    console.log("2: ", post.imageNames);

    post.title = title ? title : post.title;
    post.content = content ? content : post.content;
    post.category = category ? category : post.category;

    await post
      .save({ validateModifiedOnly: true })
      .then(() => {
        return res.status(200).json({
          message: "Successfully updated post!",
        });
      })
      .catch((e) => {
        return res.status(500).json({
          error: `${e}`,
        });
      });
  } catch (error) {
    console.log("eroare skibidi: ", error);

    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const controller = {
  login,
  logout,
  uploadPost,
  deletePost,
  updatePost,
};

export default controller;
