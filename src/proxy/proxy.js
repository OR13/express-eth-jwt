const { JWE, JWK, JWS } = require("node-jose");
const fs = require("fs");
const http = require("http");
const { resolve } = require("path");
const httpProxy = require("http-proxy");
const querystring = require("querystring");

const { verify } = require("../jwt-utils");

// intialized when app starts
let keystore;

var proxy = httpProxy.createProxyServer();

const getAuthTokenFromHeaderOrQueryString = req => {
  if (req.headers["authorization"]) {
    return req.headers["authorization"].split("Bearer ")[1].trim();
  }
  if (req.url.indexOf("?") !== -1) {
    let query = querystring.parse(req.url.split("?")[1]);
    if (query.authorization) {
      return query.authorization;
    }
  }
  return null;
};

http
  .createServer(async (req, res) => {
    const token = await getAuthTokenFromHeaderOrQueryString(req);

    if (token === null){
      res.writeHead(401);
      res.write(
        JSON.stringify({
          error: true,
          message: 'No authorization header or query string parameter provided. Access denied.'
        })
      );
      return res.end();
    }

    const sigKey = keystore.all({ use: "sig" })[0];
    const encKey = keystore.all({ use: "enc" })[0];

    // console.log(sigKey, encKey)

    let decoded;

    // must catch bad encoding..
    // will fail for expired tokens...
    try {
      decoded = await verify(token, sigKey, encKey);
    } catch (e) {
      res.writeHead(401);
      res.write(
        JSON.stringify({
          error: true,
          message: e.message
        })
      );
      return res.end();
    }
    // console.log("proxy decoded token...", decoded);
    // could add claims checks here...
    if (!decoded) {
      res.writeHead(200);
      res.write(
        JSON.stringify({
          error: true,
          message: "You need a GOLDEN_TICKET."
        })
      );
      return res.end();
    }
    proxy.web(req, res, {
      target: "http://localhost:9001"
    });
  })

  .listen(9002, async () => {
    console.log("Started proxy: http://localhost:9002");
    const ks = fs.readFileSync(resolve(".cert", "keystore.json"));
    keystore = await JWK.asKeyStore(ks.toString());
  });
