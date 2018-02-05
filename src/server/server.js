const { JWE, JWK, JWS } = require("node-jose");
const fs = require("fs");
const { resolve } = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
require("express-async-await")(app);

const moment = require("moment");

const { create } = require("../jwt-utils");

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

app.get("/", async (req, res) => {
  res.json({
    lol: 1,
    query: req.query
  });
});

app.post("/login", async (req, res) => {
  const raw = {
    iss: "test",
    exp: moment()
      .add(6, "hours")
      .unix(),
    sub: {
      username: req.body.username,
      test: "This is a test"
    }
  };
  const sigKey = keystore.all({ use: "sig" })[0];
  const encKey = keystore.all({ use: "enc" })[0];
  let token = await create(raw, sigKey, encKey);
  res.json({
    token
  });
});

app.get("/restricted", async (req, res) => {
  res.json({
    some: "secret"
  });
});

app.listen(9001, async () => {
  console.log("Started server: http://localhost:9001!");
  const ks = fs.readFileSync(resolve(".cert", "keystore.json"));
  keystore = await JWK.asKeyStore(ks.toString());
});
