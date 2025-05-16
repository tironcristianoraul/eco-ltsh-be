import express from "express";
import controller from "../controllers/admin.controller";
import auth from "../functions/auth";
import { payload, payloads } from "../utils/validation/body";
import multer from "multer";
import { allowedExtensions } from "../utils/constants";

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
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({ error: err.message });
      } else if (err) {
        // An unknown error occurred when uploading
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  controller.uploadPhoto
);

adminRouter.use("/auth", adminAuthRouter);

export default adminRouter;
