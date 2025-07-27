const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Hello from Kubernetes! - v6"));
app.listen(3000);
