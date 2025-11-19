import { model, Schema, Types } from "mongoose";
import IPlant from "../interfaces/plant.interface";

const plantSchema: Schema = new Schema(
  {
    _id: Types.ObjectId,
    name: { type: String, required: true },
    link: { type: String, required: true, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// plantSchema.pre<IPost>("save", async function (next) {
//   const window = new JSDOM("").window;
//   const purify = DOMPurify(window);

//   const cleanHTML = purify.sanitize(this.content);
//   this.content = cleanHTML;

//   next();
// });

export default model<IPlant>("Plant", plantSchema);
