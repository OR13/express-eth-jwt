const fetch = require("node-fetch");

const Web3 = require("web3");
const { util } = require("node-jose");

const { createTransmuteAddressJwt } = require("../jwt-utils");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const TOKEN_URL = "http://localhost:9000/token";

const PROTECTED_RESOURCE_URL = "http://localhost:9001";

(async () => {
  let response;
  response = await (await fetch(PROTECTED_RESOURCE_URL, {
    method: "GET"
  })).json();

  const rejectsUnauthorized =
    response.message ==
    "No authorization header or query string parameter provided. Access denied.";
  console.log("proxy rejects unauthorized: ", rejectsUnauthorized, "\n");

  const { address, privateKey } = await web3.eth.accounts.create();

  const jwt = await createTransmuteAddressJwt(web3, address, privateKey);

  let body = {
    jwt
  };

  const { token } = await (await fetch(TOKEN_URL, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  })).json();

  console.log("auth provides tokens: ", token !== undefined, "\n");

  response = await (await fetch(PROTECTED_RESOURCE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })).json();

  console.log("proxy grants tokens access:", response.hello === "world", "\n");
})();
