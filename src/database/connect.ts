import mongoose from "mongoose";
import chalk from "chalk";

const connectToDatabase = async (uri: string): Promise<void> => {
  await mongoose
    .connect(uri)
    .then((db) => {
      console.log(chalk.green(`Connected to MongoDB. [${db.connection.name}]`));
    })
    .catch((err) => {
      console.log(`${err}`);
    });
};

export default connectToDatabase;
