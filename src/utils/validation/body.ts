//
import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema } from "joi";
import regex from "../regex/regex";

export const payload =
  (body: ObjectSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await body
        .validateAsync(req.body)
        .then(() => next())
        .catch((error) => {
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
  },
};
