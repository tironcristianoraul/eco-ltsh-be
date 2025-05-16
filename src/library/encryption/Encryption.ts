import * as encryption from "crypto-js";
import env from "../../config";

export default abstract class Encrypt {
  static encrypt = (data: any) =>
    typeof data === "string"
      ? encryption.AES.encrypt(data, env.server.encryption_key).toString()
      : encryption.AES.encrypt(
          JSON.stringify(data),
          env.server.encryption_key
        ).toString();

  static decrypt = (data: any) =>
    typeof data === "string"
      ? encryption.AES.decrypt(data, env.server.encryption_key).toString(
          encryption.enc.Utf8
        )
      : JSON.parse(
          encryption.AES.decrypt(data, env.server.encryption_key).toString(
            encryption.enc.Utf8
          )
        );
}
