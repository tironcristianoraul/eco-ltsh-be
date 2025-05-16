import { model, Schema, Types } from "mongoose";
import * as a2 from "argon2";
import IAdmin from "../interfaces/admin.interface";

const adminSchema: Schema = new Schema(
  {
    _id: { type: Types.ObjectId },
    surname: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      required: true,
      default: "admin",
      enum: ["admin"],
    },
    isLoggedIn: { type: Boolean },
  },
  {
    versionKey: false,
  }
);

adminSchema.pre<IAdmin>("save", async function (next) {
  try {
    if (!this.isModified()) return next();

    if (this.isModified("email")) {
      this.email = this.email.toLowerCase().trim();
    }

    if (this.isModified("password")) {
      await a2.hash(this.password).then((p) => {
        this.password = p;
        return next();
      });
    }
  } catch (error) {
    next(new Error("Error while saving user!"));
  }
});

export default model<IAdmin>("Admin", adminSchema);
