import express from "express";
import adminRouter from "./admin.routes";

const mainRouter = express.Router();

mainRouter.use("/admin", adminRouter);

export default mainRouter;
