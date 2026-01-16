const path = require("path");
const os = require("os");
const fs = require("fs");
const { exec, execSync } = require("child_process");
const archiver = require("archiver");
const { randomUUID } = require("crypto");

module.exports = async (pdfPath) => {
  return new Promise(async (resolve, reject) => {
    console.log("==== SERVICE STARTED: PDF → JPG ====");
    console.log("PDF PATH:", pdfPath);

    // -------- BASIC VALIDATION --------
    if (!fs.existsSync(pdfPath)) {
      return reject(new Error("Input PDF file does not exist"));
    }

    // -------- PAGE COUNT CHECK (SAFE VERSION) --------
    try {
      const pdfInfo = execSync(`pdfinfo "${pdfPath}"`, { encoding: "utf-8" });

      const pageCountMatch = pdfInfo.match(/Pages:\s+(\d+)/);
      const pageCount = pageCountMatch ? parseInt(pageCountMatch[1]) : 0;

      if (pageCount > 100) {
        return reject(
          new Error(`PDF has ${pageCount} pages which exceeds the 100 page limit`)
        );
      }
    } catch (err) {
      console.warn("⚠️ pdfinfo failed — continuing anyway...");
    }

    // -------- CREATE TEMP FOLDER --------
    const tempDir = path.join(
      os.tmpdir(),
      `pdf_to_jpg_${Date.now()}_${randomUUID()}`
    );

    fs.mkdirSync(tempDir, { recursive: true });

    const baseName = path.join(tempDir, "page");

    // -------- CONVERT PDF → JPG USING POPPLER --------
    const command = `pdftoppm -jpeg -r 300 "${pdfPath}" "${baseName}"`;

    console.log("Running:", command);

    exec(command, async (err, stdout, stderr) => {
      if (err) {
        const msg = stderr.toLowerCase();

        if (msg.includes("password") || msg.includes("encrypted")) {
          return reject(new Error("PDF is password protected"));
        }

        if (msg.includes("syntax") || msg.includes("corrupt")) {
          return reject(new Error("Corrupt PDF file"));
        }

        return reject(new Error(stderr || err.message));
      }

      // -------- READ GENERATED IMAGES --------
      let files;
      try {
        files = fs.readdirSync(tempDir);
      } catch (e) {
        return reject(new Error("Failed to read temp directory"));
      }

      const jpgFiles = files
        .filter((f) => f.toLowerCase().endsWith(".jpg"))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/[^0-9]/g, ""));
          const numB = parseInt(b.replace(/[^0-9]/g, ""));
          return numA - numB;
        });

      if (jpgFiles.length === 0) {
        return reject(new Error("No JPG files were generated from PDF"));
      }

      // -------- CREATE ZIP FILE --------
      const timestamp = Date.now();
      const zipFileName = `converted_${timestamp}.zip`;
      const zipPath = path.join(os.tmpdir(), zipFileName);

      console.log("📦 Creating ZIP:", zipPath);

      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.pipe(output);

      jpgFiles.forEach((file, index) => {
        const renamedFile = `page_${index + 1}.jpg`;
        const filePath = path.join(tempDir, file);
        archive.file(filePath, { name: renamedFile });
      });

      try {
        await archive.finalize();
      } catch (zipErr) {
        return reject(new Error("Failed to create ZIP archive"));
      }

      output.on("close", () => {
        console.log("🔥 ZIP Ready:", zipPath);

        // -------- CLEANUP TEMP FILES --------
        try {
          jpgFiles.forEach((file) => {
            const filePath = path.join(tempDir, file);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });

          fs.rmdirSync(tempDir, { recursive: true });
        } catch (cleanupErr) {
          console.warn("⚠️ Cleanup warning:", cleanupErr.message);
        }

        resolve({
          mode: "multiple",
          zip: zipPath,
          zipFileName: zipFileName,
          totalPages: jpgFiles.length,
        });
      });

      output.on("error", (err) => {
        reject(new Error("Failed to write ZIP file"));
      });
    });
  });
};
