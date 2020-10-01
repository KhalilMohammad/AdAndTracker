const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const { getPageAdStatistics } = require("./browserService");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res) => {
  console.log(req);
  const urls = req.body;
  console.log(urls);
  res.json(await getPageAdStatistics(urls));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
