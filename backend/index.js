const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { handleQuery } = require("./controllers/queryController");

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

app.post("/query", handleQuery);

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
