import { NextFunction, Response, Request } from "express";
import Admin from "../../database/models/admin.model";
import { Model } from "mongoose";
import IAdmin from "../../database/interfaces/admin.interface";
import { ExtendedReq, Token } from "../../interfaces/token";
import env from "../../config";
import { addDays, addMinutes, addYears } from "date-fns";
import sign from "../jwt/sign";
import * as jwt from "jsonwebtoken";
import { getRes } from "../body";

export interface ModelRegistry {
  // User: Model<IUser>;
  Admin: Model<IAdmin>;
}

const modelRegistry: ModelRegistry = {
  // User,
  Admin,
};

function getModel(name: ModelName) {
  return modelRegistry[name];
}

export type ModelName = keyof ModelRegistry;

const auth =
  (roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken } = req.cookies;

      if (!accessToken && !refreshToken)
        return res.status(401).json({
          error: "Authorization missing!",
        });

      const redirecturl = `${env.server.url}${req.originalUrl}`;

      if (!accessToken) {
        const { _id, role } = jwt.verify(
          refreshToken,
          env.jwt.refresh
        ) as Token;

        if (!roles.includes(role))
          return res.status(403).json({
            error: "Invalid role!",
          });

        let userFound: any | null = null;

        for (const _role of roles) {
          const modelName = _role.charAt(0).toUpperCase() + _role.slice(1);

          const roleUser =
            modelName in modelRegistry &&
            //@ts-ignore
            (await getModel(modelName as ModelName).findById({ _id }));

          if (roleUser) userFound = roleUser;
        }
        if (!userFound)
          return res.status(404).json({
            error: "Access denied! User not found in database!",
          });

        const userRole = userFound.role;

        const decryptedRefreshToken: jwt.JwtPayload = jwt.verify(
          refreshToken,
          env.jwt.refresh
        ) as jwt.JwtPayload;

        const now = new Date();

        const { access, refresh } = sign(
          userRole,
          _id,
          decryptedRefreshToken.exp! * 1000 - now.getTime() >
            new Date(addMinutes(now, 1)).getTime()
        );

        return res
          .cookie("accessToken", access, {
            maxAge: 1000 * 60 * 60 * 24, // 1d
            sameSite: env.server.mode === "testing" ? "none" : "lax",
            secure: env.server.mode === "testing",
            path: "/",
            expires: addDays(new Date(), 15),
            httpOnly: true,
          })
          .cookie("refreshToken", refresh, {
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1yr
            sameSite: env.server.mode === "testing" ? "none" : "lax",
            secure: env.server.mode === "testing",
            path: "/",
            httpOnly: true,
            expires: addYears(new Date(), 1),
          })
          .redirect(307, redirecturl);
      }

      // --- ACCESS TOKEN VALIDATION --- //

      const decoded = jwt.verify(accessToken, env.jwt.access) as Token;

      const { _id, role } = decoded as unknown as (string | jwt.JwtPayload) & {
        _id: string;
        role: string;
      };

      if (!roles.includes(role))
        return res.status(403).json({
          error: "Invalid role!",
        });

      let userFound: any | null = null;

      for (const _role of roles) {
        const modelName = _role.charAt(0).toUpperCase() + _role.slice(1);
        const roleUser =
          modelName in modelRegistry &&
          //@ts-ignore
          (await getModel(modelName as ModelName).findById({ _id }));
        if (roleUser) userFound = roleUser;
      }

      if (!userFound)
        return res.status(404).json({
          error: "Access denied! User not found in database!",
        });

      if (userFound._id.toString() !== _id.toString())
        return res.status(403).json({
          error: "Invalid user!",
        });

      const modelName = role.charAt(0).toUpperCase() + role.slice(1);
      (req as ExtendedReq).authData = {
        decoded,
        Model: getModel(modelName as ModelName),
      };

      return next();
    } catch (error) {
      return res.status(500).json({
        error: `${error}`,
      });
    }
  };

export default auth;
