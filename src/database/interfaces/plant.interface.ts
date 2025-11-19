import { Document, Types } from "mongoose";

export default interface IPlant extends Document {
  _id: Types.ObjectId;
  name: string;
  link: string;
}
