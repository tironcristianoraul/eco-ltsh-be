import { model, Schema, Types } from "mongoose";
import IPost from "../interfaces/post.interface";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const postSchema: Schema = new Schema(
  {
    _id: Types.ObjectId,
    imageNames: { type: [String], required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

postSchema.pre<IPost>("save", async function (next) {
  const window = new JSDOM("").window;
  const purify = DOMPurify(window);

  const cleanHTML = purify.sanitize(this.content);
  this.content = cleanHTML;

  next();
});

export default model<IPost>("Post", postSchema);
