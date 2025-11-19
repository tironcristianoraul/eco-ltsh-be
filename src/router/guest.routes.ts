import { Router } from "express";
import controller from "../controllers/guest.controller";

import { validateParams, Params } from "../utils/validation/params";

const guestRouter = Router();

guestRouter.get("/posts", controller.getPosts);
guestRouter.get(
  "/post/:id",
  validateParams(Params.posts.id),
  controller.getPost
);

guestRouter.get("/plants", controller.getPlants);
guestRouter.get(
  "/plant/:id",
  validateParams(Params.posts.id),
  controller.getPlant
);
guestRouter.get(
  "/plant/qr/:id",
  validateParams(Params.posts.id),
  controller.generateQR
);

export default guestRouter;
