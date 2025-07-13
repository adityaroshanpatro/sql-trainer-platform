const fs = require("fs");
const path = require("path");

function resetData() {
  const presetDir = path.join(__dirname, "..", "preset");
  const dataDir = path.join(__dirname, "..", "data");

  if (!fs.existsSync(presetDir)) {
    throw new Error("Preset directory not found.");
  }

  const files = fs.readdirSync(presetDir);

  for (const file of files) {
    const sourcePath = path.join(presetDir, file);
    const targetPath = path.join(dataDir, file);

    fs.copyFileSync(sourcePath, targetPath);
  }

  console.log("✅ Data reset complete from preset/");
}

module.exports = { resetData };
