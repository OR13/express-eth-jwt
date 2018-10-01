const { JWK } = require("node-jose");
const fs = require("fs");
const { resolve } = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
require("express-async-await")(app);
const moment = require("moment");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const { create, decodeEthBlockHashJwt } = require("../jwt-utils");

// intialized when app starts
let keystore;

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/token", async (req, res) => {
  // will throw for expires or invalid JWTs...
  const { recoveredAddress, claims } = await decodeEthBlockHashJwt(
    web3,
    req.body.jwt
  );
  console.log(recoveredAddress, claims);
  const raw = {
    iss: "localhost:9000",
    exp: moment()
      .add(6, "hours")
      .unix(),
    sub: {
      claims
    }
  };

  console.log(JSON.stringify(raw, null, 2));

  const sigKey = keystore.all({ use: "sig" })[0];
  const encKey = keystore.all({ use: "enc" })[0];
  let token = await create(raw, sigKey, encKey);
  res.json({
    token
  });
});

app.listen(9000, async () => {
  console.log("Started server: http://localhost:9000!");
  const ks = fs.readFileSync(resolve(".cert", "keystore.json"));
  keystore = await JWK.asKeyStore(ks.toString());
});
