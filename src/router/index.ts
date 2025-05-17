import express from "express";
import adminRouter from "./admin.routes";
import guestRouter from "./guest.routes";

const mainRouter = express.Router();

mainRouter.use("/admin", adminRouter);
mainRouter.use("/guest", guestRouter);

mainRouter.use("/uploads", express.static("uploads"));

export default mainRouter;
