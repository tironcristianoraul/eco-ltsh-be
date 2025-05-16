import express from "express";
import controller from "../controllers/admin.controller";
import auth from "../functions/auth";
import { payload, payloads } from "../utils/validation/body";

const adminAuthRouter = express.Router();

adminAuthRouter.post("/login", payload(payloads.admin.login), controller.login);
adminAuthRouter.post("/logout", auth(["admin"]), controller.logout);

const adminRouter = express.Router();

adminRouter.use("/auth", adminAuthRouter);

export default adminRouter;
