const express = required("express");
const { createServer } = require("http");
const path = require("path");

const app = express();
const httpServer = createServer(app);

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));

app.use(require("./routes"));

app.use(express.static(path.join(__dirname, "public")));

httpServer.listen(app.get("port"), () => {
  console.log(`Server running on port ${app.get("port")}`);
});
