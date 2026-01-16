const path = require("path");
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");
const archiver = require("archiver");
const { randomUUID } = require("crypto");

module.exports = async (pdfPath) => {
  return new Promise(async (resolve, reject) => {
    console.log("==== SERVICE STARTED: PDF → JPG ====");
    console.log("PDF PATH:", pdfPath);

    if (!fs.existsSync(pdfPath)) {
      console.error("❌ PDF FILE NOT FOUND");
      return reject(new Error("Input PDF file does not exist"));
    }

    // Check if PDF is password protected by trying to get page count
    const pageCountCheckCmd = `pdfinfo "${pdfPath}"`;
    try {
      const { execSync } = require("child_process");
      const pdfInfo = execSync(pageCountCheckCmd, { encoding: "utf-8" });
      
      // Check if it's password protected
      if (pdfInfo.includes("Encrypted:") && pdfInfo.includes("yes")) {
        return reject(new Error("PDF is password protected")); 
      }
      
      // Check page count to handle large PDFs
      const pageCountMatch = pdfInfo.match(/Pages:\s+(\d+)/);
      const pageCount = pageCountMatch ? parseInt(pageCountMatch[1]) : 0;
      
      if (pageCount > 100) {
        return reject(new Error(`PDF has ${pageCount} pages which exceeds the 100 page limit`));
      }
    } catch (infoErr) {
      // If pdfinfo fails, check if it's a corrupted file by trying to read header
      try {
        const fd = fs.openSync(pdfPath, 'r');
        const buffer = Buffer.alloc(1024);
        fs.readSync(fd, buffer, 0, 1024, 0);
        fs.closeSync(fd);
        
        const header = buffer.toString('utf-8', 0, 8);
        if (!header.startsWith('%PDF-')) {
          return reject(new Error("File is not a valid PDF"));
        }
      } catch (corruptionCheckErr) {
        return reject(new Error("Corrupt PDF file")); 
      }
    }

    // Create a dedicated temporary directory for this conversion
    const tempDir = path.join(os.tmpdir(), `pdf_to_jpg_${Date.now()}_${randomUUID()}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Use a fixed prefix and extract pages with 300 DPI
    const baseName = path.join(tempDir, "page");
    const command = `pdftoppm -jpeg -r 300 "${pdfPath}" "${baseName}"`;
    console.log("Running:", command);

    exec(command, async (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Poppler failed");
        console.error(stderr);
        
        // More specific error handling
        if (stderr.toLowerCase().includes("password") || stderr.toLowerCase().includes("encrypted")) {
          return reject(new Error("PDF is password protected")); 
        } else if (stderr.toLowerCase().includes("syntax error") || stderr.toLowerCase().includes("corrupt")) {
          return reject(new Error("Corrupt PDF file")); 
        } else {
          return reject(new Error(err.message || stderr));
        }
      }

      // Look for generated JPG files with the expected pattern (page-1.jpg, page-2.jpg, etc.)
      let files;
      try {
        files = fs.readdirSync(tempDir);
      } catch (readDirErr) {
        return reject(new Error("Failed to read temporary directory")); 
      }
      
      const jpgFiles = files
        .filter(f => f.toLowerCase().endsWith(".jpg"))
        .sort((a, b) => {
          // Extract page numbers and sort numerically
          const numA = parseInt(a.replace(/[^0-9]/g, '')); 
          const numB = parseInt(b.replace(/[^0-9]/g, '')); 
          return numA - numB;
        });

      if (jpgFiles.length === 0) {
        console.error("❌ MATCHING JPG FILES NOT FOUND");
        console.error("⚠️ Debug: No images generated");
        return reject(new Error("No JPG files created from PDF"));
      }

      // Create a timestamped ZIP file
      const timestamp = Date.now();
      const zipFileName = `converted_${timestamp}.zip`;
      const zipPath = path.join(os.tmpdir(), zipFileName);
      
      console.log("📦 Creating ZIP:", zipPath);
      console.log("📄 JPG files to zip:", jpgFiles);

      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", {
        zlib: { level: 9 } // Maximum compression
      });
      
      archive.pipe(output);

      jpgFiles.forEach((file, index) => {
        // Rename files to page_X.jpg format
        const renamedFile = `page_${index + 1}.jpg`;
        const filePath = path.join(tempDir, file);
        archive.file(filePath, { name: renamedFile });
      });

      try {
        await archive.finalize();
      } catch (archiveErr) {
        console.error("❌ Archive creation failed:", archiveErr);
        return reject(new Error("Failed to create ZIP archive"));
      }

      output.on("close", () => {
        console.log("🔥 ZIP Ready:", zipPath);
        
        // Clean up temporary image files
        try {
          jpgFiles.forEach(file => {
            const filePath = path.join(tempDir, file);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });
          
          // Remove the temporary directory
          fs.rmdirSync(tempDir, { recursive: true });
        } catch (cleanupErr) {
          console.warn("⚠️ Warning during cleanup:", cleanupErr.message);
        }
        
        resolve({
          mode: "multiple",
          zip: zipPath,
          files: jpgFiles.map(f => path.join(tempDir, f)), // These will be cleaned up, but keeping for interface compatibility
          zipFileName: zipFileName
        });
      });
      
      output.on("error", (err) => {
        console.error("❌ Output stream error:", err);
        reject(new Error("Failed to create ZIP file"));
      });
    });
  });
};