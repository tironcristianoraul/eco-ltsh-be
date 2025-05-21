//
import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema } from "joi";
import regex from "../regex/regex";
import fs from "fs/promises";
import { MAX_TOTAL_SIZE } from "../constants";
import postModel from "../../database/models/post.model";

export const payload =
  (body: ObjectSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await body
        .validateAsync(req.body.data ? JSON.parse(req.body.data) : req.body)
        .then(() => {
          next();
        })
        .catch((error) => {
          if (req.body.data) {
            // We're in the case where we upload something right now.
            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
              return res.status(400).json({ error: "No images uploaded." });
            }

            const imagePaths = files.map((file) => file.path);

            for (const path of imagePaths) fs.unlink(path);
          }
          return res.status(500).json({
            error: `${error}`,
          });
        });
    } catch (error) {
      return res.status(500).json({
        error: `${error}`,
      });
    }
  };

export const payloadForUpdate =
  (body: ObjectSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await body
        .validateAsync(req.body.data ? JSON.parse(req.body.data) : req.body)
        .then(async () => {
          const files = req.files as Express.Multer.File[];
          console.log(files);
          const imagePaths = files.map((file) => file.path);

          const { id } = req.params;
          const post = await postModel.findById({ _id: id });
          if (!post) {
            for (const path of imagePaths) fs.unlink(path);

            return res.status(404).json({ error: "Post not found!" });
          }

          const photoNr = post.imageNames.length;

          const { photosToDelete } = JSON.parse(req.body.data);

          const newFilesLength = files.length;
          if (!photosToDelete || !photosToDelete.length) return next();
          const deleteLength = (photosToDelete as string[]).length;
          if (!files || files.length === 0) {
            if (deleteLength > photoNr) {
              const imagePaths = files.map((file) => file.path);

              for (const path of imagePaths) fs.unlink(path);
              return res
                .status(400)
                .json({ error: "You cannot delete more than you have!" });
            }
          }

          // if (files && files.length && !photoNr)
          //   return res
          //     .status(400)
          //     .json({ error: "You did not specify number of photos!" });

          if (-deleteLength + newFilesLength > 0) {
            const imagePaths = files.map((file) => file.path);

            for (const path of imagePaths) fs.unlink(path);
            return res.status(400).json({
              error: "You cannot upload more than 10 files!",
            });
          }
          next();
        })
        .catch((error) => {
          if (req.body.data) {
            // We're in the case where we upload something right now.
            const files = req.files as Express.Multer.File[];
            if (files && files.length) {
              const imagePaths = files.map((file) => file.path);
              for (const path of imagePaths) fs.unlink(path);
            }
          }
          return res.status(500).json({
            error: `${error}`,
          });
        });
    } catch (error) {
      return res.status(500).json({
        error: `${error}`,
      });
    }
  };

const { password } = regex;

export const payloads = {
  admin: {
    login: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email address.",
        "string.empty": "Email is required.",
      }),
      password: Joi.string().pattern(password).required().messages({
        "string.pattern.base":
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
        "string.empty": "Password is required.",
      }),
    }),
    //
    uploadImages: Joi.object({
      // images: Joi.array()
      //   .items(Joi.string().required())
      //   .min(1)
      //   .max(10)
      //   .required(),
      title: Joi.string().required().max(64),
      content: Joi.string().required(),
      category: Joi.string().required().max(32),
    }),
    uploadImagesForUpdate: Joi.object({
      photosToDelete: Joi.array().items(Joi.string().required()).min(1).max(10),
      title: Joi.string().max(64),
      content: Joi.string(),
      category: Joi.string().max(32),
    }),
  },
};
