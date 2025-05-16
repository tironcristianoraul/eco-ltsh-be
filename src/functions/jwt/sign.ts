import * as jwt from "jsonwebtoken";
import env from "../../config";

export default function sign(
  role: string,
  _id: string,
  accessOnly: boolean = false
) {
  const access = jwt.sign({ role, _id }, env.jwt.access, {
    algorithm: "HS384",
    expiresIn: "15d",
  });

  const refresh = jwt.sign({ role, _id }, env.jwt.refresh, {
    algorithm: "HS384",
    expiresIn: "365d",
  });

  return accessOnly ? { access } : { access, refresh };
}
