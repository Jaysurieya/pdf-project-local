const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

// Define fixed directory paths
const INPUT_DIR = path.join(__dirname, "../../../temp_storage/input");
const OUTPUT_DIR = path.join(__dirname, "../../../temp_storage/output");

module.exports = (pdfPath) => {
  return new Promise((resolve, reject) => {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Clean ONLY the output directory
    try {
      const outputFiles = fs.readdirSync(OUTPUT_DIR);
      outputFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        // Skip directories
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Cleaned old output: ${file}`);
        }
      });
    } catch (err) {
      console.warn(`⚠️ Could not clean output directory:`, err.message);
    }

    const outputBase = path.join(
      OUTPUT_DIR,  // Use fixed output directory
      path.basename(pdfPath, ".pdf")
    );

    const outputPath = outputBase + ".docx";

    const command = `tesseract "${pdfPath}" "${outputBase}" docx`;

    console.log("🛠 Tesseract CMD:", command);
    console.log("📂 Input file exists:", fs.existsSync(pdfPath));
    console.log("📂 Output dir exists:", fs.existsSync(OUTPUT_DIR));

    exec(command, { timeout: 120000, shell: true }, (error, stdout, stderr) => {
      console.log("📝 Tesseract stdout:", stdout || "(empty)");
      
      if (stderr) {
        console.log("⚠️ Tesseract stderr:", stderr);
      }

      if (error) {
        console.error("❌ Tesseract OCR failed:", error.message);
        // Check if output file exists anyway (sometimes tesseract creates it despite errors)
        if (fs.existsSync(outputPath)) {
          console.log("⚠️ Tesseract reported error but file exists, continuing:", outputPath);
          return resolve(outputPath);
        }
        return reject(new Error(`OCR conversion failed: ${error.message}`));
      }

      if (!fs.existsSync(outputPath)) {
        console.error("❌ OCR DOCX not generated at:", outputPath);
        return reject(new Error("OCR DOCX not generated"));
      }

      console.log("✅ OCR DOCX ready:", outputPath);
      resolve(outputPath);
    });
  });
};