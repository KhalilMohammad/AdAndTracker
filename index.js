const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const { getPageAdStatistics } = require("./browserService");

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  const urls = req.body;

  setTimeout(async () => {
    for await (const pageAdStatistics of getPageAdStatistics(urls)) {
      io.emit("onDataRecieve", pageAdStatistics);
    }
  }, 0);
  res.sendStatus(200);
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

http.listen(3000, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
