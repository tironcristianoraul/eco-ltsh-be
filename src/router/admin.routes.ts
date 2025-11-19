import express from "express";
import controller from "../controllers/admin.controller";
import plantController from "../controllers/plant.controller";
import auth from "../functions/auth";
import { payload, payloadForUpdate, payloads } from "../utils/validation/body";
import multer from "multer";
import { allowedExtensions, MAX_TOTAL_SIZE } from "../utils/constants";
import { validateParams, Params } from "../utils/validation/params";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const image = file;

    if (image.originalname.includes("/"))
      return cb(new Error("Your filename cannot contain a '/'."));

    const imageParts = image.originalname.split(".");
    const imagePartsLength = imageParts.length;
    const imageExtension = imageParts[imagePartsLength - 1];

    if (!allowedExtensions.includes(imageExtension))
      return cb(
        new Error(
          `Invalid image extension. Allowed formats: ${allowedExtensions.join(
            ", "
          )}`
        )
      );

    return cb(null, true);
  },
});

const adminAuthRouter = express.Router();

adminAuthRouter.post("/login", payload(payloads.admin.login), controller.login);
adminAuthRouter.post("/logout", auth(["admin"]), controller.logout);

const adminRouter = express.Router();

adminRouter.post(
  "/upload",
  auth(["admin"]),
  (req, res, next) => {
    upload.array("files", 10)(req, res, (err) => {
      if (Array.isArray(req.files) && req.files.length) {
        let totalSize = 0;
        for (const file of req.files) totalSize += file.size;
        if (totalSize > MAX_TOTAL_SIZE)
          return res
            .status(413)
            .json({ message: "Total file size exceeds 100MB" });
      }
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  payload(payloads.admin.uploadImages),
  controller.uploadPost
);

// bug uri:
// daca modifica numa text si imagine nu pusca

adminRouter.patch(
  "/post/:id",
  auth(["admin"]),
  validateParams(Params.posts.id),
  (req, res, next) => {
    upload.array("files", MAX_TOTAL_SIZE)(req, res, (err: any) => {
      if (Array.isArray(req.files) && req.files.length) {
        let totalSize = 0;
        for (const file of req.files as Express.Multer.File[])
          totalSize += file.size;
        if (totalSize > MAX_TOTAL_SIZE * 1024 * 1024)
          // 100MB total
          return res
            .status(413)
            .json({ error: "Total file size exceeds 100MB" });
      }
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
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
