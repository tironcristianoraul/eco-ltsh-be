import Encryption from "../../library/encryption/Encryption";

export const getBody = (body: { data: string }) =>
  JSON.parse(Encryption.decrypt(body.data));

export const getRes = (res: object) => ({
  data: Encryption.encrypt(JSON.stringify(res)),
});
