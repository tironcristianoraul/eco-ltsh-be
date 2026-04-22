import express from "express";
import controller from "../controllers/admin.controller";
import plantController from "../controllers/plant.controller";
import auth from "../functions/auth";
import { payload, payloadForUpdate, payloads } from "../utils/validation/body";
import multer from "multer";
import { allowedExtensions, MAX_TOTAL_SIZE } from "../utils/constants";
import { validateParams, Params } from "../utils/validation/params";

const adminAuthRouter = express.Router();

adminAuthRouter.post("/login", payload(payloads.admin.login), controller.login);
adminAuthRouter.post("/logout", auth(["admin"]), controller.logout);

const adminRouter = express.Router();

adminRouter.post(
  "/upload",
  auth(["admin"]),
  payload(payloads.admin.uploadImages),
  controller.uploadPost
);

// bug uri:
// daca modifica numa text si imagine nu pusca

adminRouter.patch(
  "/post/:id",
  auth(["admin"]),
  validateParams(Params.posts.id),
  payloadForUpdate(payloads.admin.uploadImagesForUpdate),
  controller.updatePost
);
adminRouter.delete(
  "/post/:id",
  auth(["admin"]),
  validateParams(Params.posts.id),
  controller.deletePost
);

// plants
//to do adaugare validare joi 67
adminRouter.post("/plant", plantController.uploadPlant);
adminRouter.delete(
  "/plant/:id",
  validateParams(Params.posts.id),
  plantController.deletePlant
);
adminRouter.patch(
  "/plant/:id",
  validateParams(Params.posts.id),
  plantController.updatePlant
);

adminRouter.use("/auth", adminAuthRouter);

export default adminRouter;
