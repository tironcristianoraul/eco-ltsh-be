import sign from "../functions/jwt/sign";
import { addDays, addYears } from "date-fns";
import { NextFunction, Request, Response } from "express";
import * as a2 from "argon2";
import adminModel from "../database/models/admin.model";
import * as jwt from "jsonwebtoken";
import { Token } from "../interfaces/token";
import env from "../config";

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

const uploadPhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(500).json({
        error: "You either did not upload anything or there was an error!",
      });
    }

    return res.status(200).json({ message: "Successfully uploaded image!" });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong!",
    });
  }
};

const controller = {
  login,
  logout,
  uploadPhoto,
};

export default controller;
