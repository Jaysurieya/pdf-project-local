// // Function to get LibreOffice path based on OS
// const getLibreOfficePath = () => {
//   if (process.platform === "win32") {
//     const windowsPaths = [
//       "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
//       "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
//       "C:\\LibreOffice\\program\\soffice.exe"
//     ];
//     const fs = require('fs');
    
//     for (const p of windowsPaths) {
//       if (fs.existsSync(p)) return p;
//     }
//     return "soffice.exe";
//   } else {
//     return "soffice";
//   }
// };

// const { exec } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const { cleanDirectory } = require("../../utils/fileCleanup.util");

// // Define fixed directory paths
// const INPUT_DIR = path.join(__dirname, "../../../uploads/input");
// const OUTPUT_DIR = path.join(__dirname, "../../../uploads/output");

// function pdfToWord(inputPdfPath) {
//   return new Promise((resolve, reject) => {
//     // Ensure directories exist
//     if (!fs.existsSync(INPUT_DIR)) {
//       fs.mkdirSync(INPUT_DIR, { recursive: true });
//     }
//     if (!fs.existsSync(OUTPUT_DIR)) {
//       fs.mkdirSync(OUTPUT_DIR, { recursive: true });
//     }
    
//     // Clean the output directory before conversion
//     cleanDirectory(OUTPUT_DIR)
//       .then(() => {
//         const sofficePath = getLibreOfficePath();
        
//         // Extract the base name without extension to create the output file name
//         const baseName = path.basename(inputPdfPath, path.extname(inputPdfPath));
//         const outputFilePath = path.join(OUTPUT_DIR, `${baseName}.docx`);
        
//         // Using a more compatible conversion command for Windows
//         const command = `"${sofficePath}" --headless --invisible --nologo --nolockcheck --convert-to docx:"MS Word 2007 XML" "${inputPdfPath}" --outdir "${OUTPUT_DIR}"`;
        
//         console.log("🛠 LibreOffice CMD:", command);
        
//         exec(command, { timeout: 120000, windowsHide: true }, (error, stdout, stderr) => {  // Increase timeout to 2 minutes
//           if (error) {
//             console.error("❌ PDF → Word failed");
//             console.error("stderr:", stderr);
//             // Even if exec reports an error, the conversion might have succeeded, so check if the file exists
//             if (fs.existsSync(outputFilePath)) {
//               console.log("⚠️ Command reported error but file exists, continuing:", outputFilePath);
//               return resolve(outputFilePath);
//             }
//             return reject(new Error(stderr || "LibreOffice conversion failed"));
//           }
          
//           // Wait and check if file exists
          
//           // Check immediately in case the file was created very quickly
//           if (fs.existsSync(outputFilePath)) {
//             console.log("🔥 PDF → Word ready (immediate):", outputFilePath);
//             return resolve(outputFilePath);
//           }
          
//           const fileWatcher = setInterval(() => {
//             if (fs.existsSync(outputFilePath)) {
//               clearInterval(fileWatcher);
//               console.log("🔥 PDF → Word ready:", outputFilePath);
//               resolve(outputFilePath);
//             }
//           }, 1000); // Check every 1 second
          
//           // Fallback timeout after 60 seconds
//           setTimeout(() => {
//             clearInterval(fileWatcher);
//             // Also check for alternative file names that LibreOffice might create
//             if (fs.existsSync(outputFilePath)) {
//               console.log("🔥 PDF → Word ready (timeout fallback):", outputFilePath);
//               resolve(outputFilePath);
//             } else {
//               // Check if a similarly named file exists (sometimes LibreOffice adds numbers)
//               const outputDir = path.dirname(outputFilePath);
//               const outputBaseName = path.basename(outputFilePath, '.docx');
              
//               fs.readdir(outputDir, (err, files) => {
//                 if (err) {
//                   return reject(new Error("LibreOffice conversion timeout after 60 seconds - output file not found at: " + outputFilePath));
//                 }
                
//                 const matchingFile = files.find(file => 
//                   file.startsWith(outputBaseName) && file.endsWith('.docx')
//                 );
                
//                 if (matchingFile) {
//                   const matchedFilePath = path.join(outputDir, matchingFile);
//                   console.log("🔥 Found alternative output file:", matchedFilePath);
//                   resolve(matchedFilePath);
//                 } else {
//                   reject(new Error("LibreOffice conversion timeout after 60 seconds - output file not found at: " + outputFilePath));
//                 }
//               });
//             }
//           }, 60000);
//         });
//       })
//       .catch(err => {
//         console.error('Error cleaning output directory:', err);
//         reject(err);
//       });
//   });
// }

// module.exports = { pdfToWord };

const { exec, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Define fixed directory paths
const INPUT_DIR = path.join(__dirname, "../../../temp_storage/input");
const OUTPUT_DIR = path.join(__dirname, "../../../temp_storage/output");

// Function to get LibreOffice path based on OS
const getLibreOfficePath = () => {
  if (process.platform === "win32") {
    const windowsPaths = [
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
      "C:\\LibreOffice\\program\\soffice.exe"
    ];
    
    for (const p of windowsPaths) {
      if (fs.existsSync(p)) return p;
    }
    return "soffice.exe";
  } else {
    return "soffice";
  }
};

// Kill any existing LibreOffice processes (Windows only)
const killLibreOfficeProcesses = () => {
  if (process.platform === "win32") {
    try {
      execSync("taskkill /F /IM soffice.exe /T", { stdio: 'ignore' });
      execSync("taskkill /F /IM soffice.bin /T", { stdio: 'ignore' });
      console.log("🔪 Killed existing LibreOffice processes");
      // Wait a bit for processes to fully terminate
      const start = Date.now();
      while (Date.now() - start < 2000) {} // 2 second blocking wait
    } catch (err) {
      // Ignore errors if no process found
      console.log("ℹ️ No existing LibreOffice processes to kill");
    }
  }
};

function pdfToWord(inputPdfPath) {
  return new Promise((resolve, reject) => {
    // Ensure output directory exists (don't touch input!)
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Clean ONLY the output directory, NOT input
    const outputFiles = fs.readdirSync(OUTPUT_DIR);
    outputFiles.forEach(file => {
      try {
        fs.unlinkSync(path.join(OUTPUT_DIR, file));
        console.log(`🗑️ Cleaned old output: ${file}`);
      } catch (err) {
        console.warn(`⚠️ Could not delete ${file}:`, err.message);
      }
    });
    
    // Kill existing LibreOffice processes to prevent conflicts
    killLibreOfficeProcesses();
    
    const sofficePath = getLibreOfficePath();
    const baseName = path.basename(inputPdfPath, path.extname(inputPdfPath));
    const outputFilePath = path.join(OUTPUT_DIR, `${baseName}.docx`);
    
    // Simple LibreOffice command without user profile to avoid conflicts (based on known issues with -env:UserInstallation)
    const command = `"${sofficePath}" --headless --invisible --nolockcheck --nologo --norestore --convert-to docx:"MS Word 2007 XML" --outdir "${OUTPUT_DIR}" "${inputPdfPath}"`;
    
    console.log("🛠 LibreOffice CMD:", command);
    
    const execProcess = exec(command, { 
      timeout: 120000, 
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    }, (error, stdout, stderr) => {
      console.log("📝 LibreOffice stdout:", stdout || "(empty)");
      
      if (stderr) {
        console.log("⚠️ LibreOffice stderr:", stderr);
      }
      
      // Check if file exists immediately
      if (fs.existsSync(outputFilePath)) {
        console.log("✅ PDF → Word ready (immediate):", outputFilePath);
        clearTimeout(fallbackTimeout);
        return resolve(outputFilePath);
      }
      
      if (error) {
        console.error("❌ LibreOffice exec error:", error.message);
        // Don't reject immediately, wait for file watcher
      }
    });
    
    // Monitor for output file creation
    let checkCount = 0;
    const maxChecks = 120; // 120 checks = 120 seconds to match timeout
    
    const checkInterval = setInterval(() => {
      checkCount++;
      
      if (fs.existsSync(outputFilePath)) {
        clearInterval(checkInterval);
        clearTimeout(fallbackTimeout);
        console.log(`✅ PDF → Word ready (after ${checkCount}s):`, outputFilePath);
        return resolve(outputFilePath);
      }
      
      if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
      }
    }, 1000);
    
    // Fallback timeout
    const fallbackTimeout = setTimeout(() => {
      clearInterval(checkInterval);
      
      // Final check for alternative filenames
      try {
        const files = fs.readdirSync(OUTPUT_DIR);
        console.log("📁 Files in output directory:", files);
        
        // Look for files that start with the base name and end with .docx
        const matchingFiles = files.filter(file => 
          file.startsWith(baseName) && file.endsWith('.docx')
        );
        
        if (matchingFiles.length > 0) {
          // Take the first matching file
          const matchedFilePath = path.join(OUTPUT_DIR, matchingFiles[0]);
          console.log("✅ Found alternative output file:", matchedFilePath);
          return resolve(matchedFilePath);
        }
        
        // If no matching files found, check for any .docx file in the output directory
        const docxFiles = files.filter(file => file.endsWith('.docx'));
        if (docxFiles.length > 0) {
          const matchedFilePath = path.join(OUTPUT_DIR, docxFiles[0]);
          console.log("✅ Found output file with different name:", matchedFilePath);
          return resolve(matchedFilePath);
        }
      } catch (err) {
        console.error("❌ Error reading output directory:", err);
      }
      
      // Try killing the process
      try {
        execProcess.kill();
        killLibreOfficeProcesses();
      } catch (e) {}
      
      return reject(new Error(
        `LibreOffice conversion failed. Expected output: ${outputFilePath}\n` +
        `Please check:\n` +
        `1. LibreOffice is installed correctly\n` +
        `2. The PDF file is not corrupted\n` +
        `3. Try closing any open LibreOffice windows\n` +
        `4. Ensure the PDF contains text (scanned images need OCR first)`
      ));
    }, 120000); // Increased timeout to 120 seconds to match exec timeout
  });
}

module.exports = { pdfToWord };