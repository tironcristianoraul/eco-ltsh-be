import { Document, Types } from "mongoose";

export default interface IAdmin extends Document {
  _id: Types.ObjectId;
  email: string;
  surname: string;
  name: string;
  password: string;
  role: string;
  isLoggedIn: boolean;
}
