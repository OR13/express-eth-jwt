const express = require("express");
const bodyParser = require("body-parser");
const app = express();
require("express-async-await")(app);

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
    hello: "world"
  });
});

app.listen(9002, async () => {
  console.log("Started server: http://localhost:9002!");
});
