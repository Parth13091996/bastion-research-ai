import crypto from "crypto";
import fs from "fs";
import path from "path";

const generateEncryptedSignature = (clientIdWithEpochTimestamp: string) => {
  try {
    const publicKeyContent = fs
      .readFileSync(
        path.resolve(__dirname, "..", "..", "secret", "public_key.pem"),
        "utf8"
      )
      .replace(/[\t\n\r]/g, "")
      .replace("-----BEGIN PUBLIC KEY-----", "")
      .replace("-----END PUBLIC KEY-----", "");

    // Encrypt using RSA-OAEP
    const buffer = Buffer.from(clientIdWithEpochTimestamp);
    const encrypted = crypto.publicEncrypt(
      {
        key: `-----BEGIN PUBLIC KEY-----\n${publicKeyContent}\n-----END PUBLIC KEY-----`,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha1",
      },
      buffer
    );

    console.log({ encrypted }, "check sig");
    return encrypted.toString("base64");
  } catch (error) {
    console.error(error);
    return "";
  }
};

export const cfSignature = generateEncryptedSignature(
  process.env.CASHFREE_VERIFICATION_CLIENT_ID! + Math.floor(Date.now() / 1000)
);
