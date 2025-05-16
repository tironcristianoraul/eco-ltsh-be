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

const { email, password } = regex;

export const payloads = {
  admin: {
    login: Joi.object({
      email: Joi.string().pattern(email).required(),
      password: Joi.string().pattern(password).required(),
    }),
  },
};
