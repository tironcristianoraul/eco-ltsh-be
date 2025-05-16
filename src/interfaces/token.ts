import { Request } from "express";
import { Session, SessionData } from "express-session";
import { JwtPayload } from "jsonwebtoken";

export type ExtendedReq = Request & {
  authData: { decoded: Token; Model: any };
};

export type SessionReq = Session &
  Partial<SessionData> & { code: string; email: string };

export type Token = (string | JwtPayload) & { _id: string; role: string };
