import express from "express";
import adminRouter from "./admin.routes";
import process from "node:process";
import path from "node:path";

const mainRouter = express.Router();

mainRouter.use("/admin", adminRouter);
mainRouter.use("/uploads", express.static("uploads"));

export default mainRouter;
