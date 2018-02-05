const { JWE, JWK, JWS, util } = require("node-jose");
const fs = require("fs");
const { join } = require("path");
const jwkToPem = require("jwk-to-pem");
const jwt = require("jsonwebtoken");

const { create, verify } = require("../src/jwt-utils");

const certDir = ".cert";
const keystoreFile = join(certDir, "keystore.json");
const raw = {
  iss: "test",
  exp: new Date().getTime() + 3600,
  sub: {
    test: "This is a test"
  }
};

async function start() {
  var keystore = JWK.createKeyStore();

  if (!fs.existsSync(keystoreFile)) {
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir);
    }
    // console.log("generate keystore");
    await keystore.generate("EC", "P-256", { alg: "ES256", use: "sig" });
    await keystore.generate("oct", 256, { use: "enc" });

    fs.writeFileSync(
      keystoreFile,
      JSON.stringify(keystore.toJSON(true), null, 2)
    );
  } else {
    console.log("import keystore");
    const ks = fs.readFileSync(join(".cert", "keystore.json"));
    keystore = await JWK.asKeyStore(ks.toString());
  }

  // keys for signing and encrypting
  const sigKey = keystore.all({ use: "sig" })[0];
  const encKey = keystore.all({ use: "enc" })[0];

  let encodedEncryptedSignedToken = await create(raw, sigKey, encKey);
  // console.log(encodedEncryptedSignedToken)

  let verifiedToken = await verify(encodedEncryptedSignedToken, sigKey, encKey);
  // console.log(verifiedToken)

  process.exit();
}

start();
