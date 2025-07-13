const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { handleQuery } = require("./controllers/queryController");
const { resetData } = require("./utils/resetData");

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());
resetData();

app.post("/query", handleQuery);

app.post("/reset", (req, res) => {
  try {
    resetData();
    res.status(200).json({ message: "Data reset successfully." });
  } catch (err) {
    res.status(500).json({ error: "Reset failed", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
