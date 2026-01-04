  const path = require("path");
  const os = require("os");
  const fs = require("fs");
  const { exec } = require("child_process");
  const { randomUUID } = require("crypto");

  module.exports = async (pdfPath) => {
    return new Promise((resolve, reject) => {
      console.log("==== SERVICE STARTED: PDF → JPG ====");
      console.log("PDF PATH:", pdfPath);

      if (!fs.existsSync(pdfPath)) {
        console.error("❌ PDF FILE NOT FOUND");
        return reject(new Error("Input PDF file does not exist"));
      }

      const outputDir = os.tmpdir(); // Poppler itself writes here
      const prefix = path.join(outputDir, randomUUID());

      const command = `pdftoppm -jpeg -r 200 "${pdfPath}" "${prefix}"`;

      console.log("Running:", command);

      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error("❌ Poppler failed");
          console.error(stderr);
          return reject(new Error(err.message || stderr));
        }

        const files = fs.readdirSync(outputDir);
        // const jpgFiles = files.filter(f => f.startsWith(path.basename(prefix)) && f.endsWith(".jpg"));
        const uuidPrefix = path.basename(prefix);
        const jpgFiles = files.filter(f =>
          f.startsWith(uuidPrefix + "-") && f.toLowerCase().endsWith(".jpg")
        );


        if (jpgFiles.length === 1) {
          resolve({ mode: "single", file: path.join(outputDir, jpgFiles[0]) });
        } else if (jpgFiles.length > 1) {
          resolve({ mode: "zip", files: jpgFiles.map(f => path.join(outputDir, f)) });
        } else {
          reject(new Error("No JPG files created"));
        }
      });
    });
  };
