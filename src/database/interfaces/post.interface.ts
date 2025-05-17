import { Document, Types } from "mongoose";

export default interface IPost extends Document {
  _id: Types.ObjectId;
  imageNames: string[];
  title: string;
  content: string;
  category: string;
}
