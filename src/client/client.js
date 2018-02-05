const fetch = require("node-fetch");
const loginServerUrl = "http://localhost:9001/login";
const restrictedUrl = "http://localhost:9002/restricted";

(async () => {
  let response;
  response = await (await fetch(restrictedUrl, {
    method: "GET"
  })).json();

  const rejectsUnauthorized =
    response.message ==
    "No authorization header or query string parameter provided. Access denied.";
  console.log("rejectsUnauthorized: ", rejectsUnauthorized, "\n");

  let body = {
    username: "bob@example.com",
    password: "123"
  };

  const { token } = await (await fetch(loginServerUrl, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  })).json();

  console.log("providesToken: ", token !== undefined, "\n");

  const { some } = await (await fetch(restrictedUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })).json();

  console.log("proxyAcceptsJWT: ", some === "secret", "\n");

})();
