const path = require("path");
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");

// Function to get LibreOffice path based on OS
const getLibreOfficePath = () => {
  if (process.platform === "win32") {
    // Windows: Check common installation paths
    const windowsPaths = [
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
      "C:\\LibreOffice\\program\\soffice.exe"
    ];
    
    for (const p of windowsPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    
    // If not found in common paths, try PATH
    return "soffice.exe";
  } else {
    // Unix-like systems
    return "soffice";
  }
};

module.exports = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const outputDir = os.tmpdir();
    const baseName = path.basename(pdfPath, path.extname(pdfPath));
    const outputPath = path.join(outputDir, `${baseName}.docx`);

    const sofficePath = getLibreOfficePath();
    const command = `"${sofficePath}" --headless --convert-to docx "${pdfPath}" --outdir "${outputDir}"`;

    console.log("🛠 LibreOffice CMD:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ PDF → Word failed");
        console.error("stderr:", stderr);
        return reject(new Error(`PDF to Word conversion failed: ${error.message || stderr}`));
      }

      const checkFile = setInterval(() => {
        if (fs.existsSync(outputPath)) {
          clearInterval(checkFile);
          console.log("✅ PDF → Word ready:", outputPath);
          resolve(outputPath);
        }
      }, 300);

      setTimeout(() => {
        clearInterval(checkFile);
        reject(new Error("LibreOffice conversion timeout"));
      }, 10000);
    });
  });
};
