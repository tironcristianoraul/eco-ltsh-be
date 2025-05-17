import Joi, { ObjectSchema } from "joi";
import { Request, Response, NextFunction } from "express";
import regex from "../regex/regex";

export const validateParams = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema
        .validateAsync(req.params)
        .then(() => next())
        .catch((e) => {
          return res.status(500).json({
            error: "Params validation failed." + e,
          });
        });
    } catch (error) {
      return res.status(500).json({
        error: "Params validation failed." + error,
      });
    }
  };
};

const { id } = regex;

export const Params = {
  posts: {
    id: Joi.object({
      id: Joi.string().pattern(id).required(),
    }),
  },
};
