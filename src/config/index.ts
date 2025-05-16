import { str, cleanEnv, port, url } from "envalid";
import dotenv from "dotenv";

dotenv.config();

const {
  PORT,
  DATABASE,
  ACCESS_SECRET,
  MODE,
  REFRESH_SECRET,
  ENCRYPTION_KEY,
  // SUPERADMINS,
} = cleanEnv(process.env, {
  PORT: port(),
  DATABASE: url(),
  ACCESS_SECRET: str(),
  MODE: str({ choices: ["testing", "production"] }),
  REFRESH_SECRET: str(),
  ENCRYPTION_KEY: str(),
  // SUPERADMINS: str(),
});

const env = {
  server: {
    port: PORT,
    database:
      MODE === "testing"
        ? `${DATABASE}/dev?retryWrites=true&w=majority&appName=main`
        : `${DATABASE}?retryWrites=true&w=majority&appName=main`,
    mode: MODE,
    encryption_key: ENCRYPTION_KEY,
    url: MODE === "testing" ? `http://127.0.0.1:${PORT}` : "",
    // superadmins: SUPERADMINS.split("|"),
  },
  jwt: {
    access: ACCESS_SECRET,
    refresh: REFRESH_SECRET,
  },
  auth: {},
};

export default env;
