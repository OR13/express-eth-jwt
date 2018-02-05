const { JWE, JWK, JWS, util } = require("node-jose");
const jwkToPem = require("jwk-to-pem");
const jwt = require("jsonwebtoken");

module.exports.create = async (rawClaimsJson, sigKey, encKey) => {
  // Make JWT
  const payload = JSON.stringify(rawClaimsJson);
  const opt = { compact: true, jwk: sigKey, fields: { typ: "jwt" } };
  const token = await JWS.createSign(opt, sigKey)
    .update(payload)
    .final();
  //   console.log("JWT");
  //   console.log(token);

  // Encrypt JWT
  let encryptedToken = await JWE.createEncrypt(encKey)
    .update(token)
    .final();

  return util.base64url.encode(JSON.stringify(encryptedToken), "utf8");
};

module.exports.verify = async (encodedEncryptedToken, sigKey, encKey) => {
  // Decode
  let decodedEncryptedToken = JSON.parse(
    util.base64url.decode(encodedEncryptedToken, "utf8")
  );

  // console.log("decodedEncryptedToken: ", decodedEncryptedToken);

  // Decrypt JWT
  let decryptedToken = await JWE.createDecrypt(encKey).decrypt(
    decodedEncryptedToken
  );

  let plaintextToken = decryptedToken.plaintext.toString();

  // Verify Token
  const v = await JWS.createVerify(sigKey).verify(plaintextToken);
  // console.log("Verify Token");
  console.log(v.header);
  console.log(v.payload.toString());

  // Verify Token with jsonwebtoken
  const publicKey = jwkToPem(sigKey.toJSON());
  const privateKey = jwkToPem(sigKey.toJSON(true), { private: true });

  // console.log("public", publicKey);
  // console.log("private", privateKey);

  const decoded = jwt.verify(plaintextToken, publicKey);
  // console.log("decoded...", decoded);

  return decoded;
};
