const { JWE, JWK, JWS, util } = require("node-jose");
const jwkToPem = require("jwk-to-pem");
const jwt = require("jsonwebtoken");
const moment = require("moment");

module.exports.create = async (rawClaimsJson, sigKey, encKey) => {
  // Make JWT
  const payload = JSON.stringify(rawClaimsJson);
  const opt = { compact: true, jwk: sigKey, fields: { typ: "jwt" } };
  const token = await JWS.createSign(opt, sigKey)
    .update(payload)
    .final();

  // Encrypt JWT
  const encryptedToken = await JWE.createEncrypt(encKey)
    .update(token)
    .final();

  return util.base64url.encode(JSON.stringify(encryptedToken), "utf8");
};

module.exports.verify = async (encodedEncryptedToken, sigKey, encKey) => {
  // Decode
  const decodedEncryptedToken = JSON.parse(
    util.base64url.decode(encodedEncryptedToken, "utf8")
  );

  // Decrypt JWT
  const decryptedToken = await JWE.createDecrypt(encKey).decrypt(
    decodedEncryptedToken
  );

  const plaintextToken = decryptedToken.plaintext.toString();

  // Verify Token
  const v = await JWS.createVerify(sigKey).verify(plaintextToken);
  // console.log("Verify Token");
  // console.log(v.header);
  // console.log(v.payload.toString());

  // Verify Token with jsonwebtoken
  const publicKey = jwkToPem(sigKey.toJSON());
  // const privateKey = jwkToPem(sigKey.toJSON(true), { private: true });

  // console.log("public", publicKey);
  // console.log("private", privateKey);

  const decoded = jwt.verify(plaintextToken, publicKey);
  // console.log("decoded...", decoded);

  return decoded;
};

module.exports.decodeEthBlockHashJwt = async (web3, jwt) => {
  const [header, payload, signatureObject] = jwt.split(".").map(v => {
    return util.base64url.decode(v, "utf8").toString();
  });
  const recoveredAddress = await web3.eth.accounts.recover(
    JSON.parse(signatureObject)
  );
  const claims = JSON.parse(payload);
  if (claims.address !== recoveredAddress) {
    throw new Error("jwt signature does not match payload address.");
  }
  const now = moment().unix();
  if (claims.exp < now) {
    throw new Error("jwt expired.");
  }
  if (recoveredAddress !== claims.address) {
    throw new Error("recovered address does not match claims.");
  }
  const block = await web3.eth.getBlock("latest");
  if (block.hash !== claims.blockHash) {
    throw new Error("claims.blockHash is not latest...");
  }
  return {
    recoveredAddress,
    claims
  };
};

module.exports.createTransmuteAddressJwt = async (
  web3,
  address,
  privateKey
) => {
  const createEthBlockHashJwt = (
    headerString,
    payloadString,
    payloadSigString
  ) => {
    return (
      util.base64url.encode(headerString, "utf8") +
      "." +
      util.base64url.encode(payloadString, "utf8") +
      "." +
      util.base64url.encode(payloadSigString, "utf8")
    );
  };
  const block = await web3.eth.getBlock("latest");
  const raw = {
    exp: moment()
      .add(6, "hours")
      .unix(),
    blockHash: block.hash,
    address: address
  };
  const headerString = JSON.stringify({
    typ: "jwt",
    alg: "TransmuteSignedBlockHash"
  });
  const payloadString = JSON.stringify(raw);
  const payloadSigString = JSON.stringify(
    await web3.eth.accounts.sign(payloadString, privateKey)
  );
  const jwt = createEthBlockHashJwt(
    headerString,
    payloadString,
    payloadSigString
  );
  return jwt;
};
