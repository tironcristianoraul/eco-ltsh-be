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

export default guestRouter;
