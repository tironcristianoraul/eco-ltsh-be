//
import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema } from "joi";
import regex from "../regex/regex";
import fs from "fs/promises";

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
  },
};
