  // const fs = require("fs");
  // const path = require("path");
  // const os = require("os");
  // const archiver = require("archiver");
  // const { v4: randomUUID } = require("uuid");

  // const jpgToPdf = require("../Services/Convert_pdf/jpgToPdf.service");
  // const officeToPdf = require("../Services/Convert_pdf/officeToPdf.service");
  // const htmlToPdf = require("../Services/Convert_pdf/htmlToPdf.service");

  // const pdfToJpg = require("../Services/Convert_from_pdf/pdfToJpg.service");
  // // const pdfToWord = require("../Services/Convert_from_pdf/pdfToWord.service");


  // const isScannedPdf = require("../Services/Convert_from_pdf/pdfTypeDetect.util");
  // const { pdfToWord } = require("../Services/Convert_from_pdf/pdfToWord.service");
  // const ocrPdfToWord = require("../Services/Convert_from_pdf/ocrPdfToWord.service");


  // exports.convertToPdf = async (req, res) => {
  //   console.log("==== CONVERT API HIT ====");
  //   console.log("QUERY:", req.query);
  //   console.log("FILES COUNT:", req.files?.length || 0);

  //   const type = req.query.type; // jpg | word | excel | ppt | html
  //   const files = req.files;

  //   if (!type) {
  //     return res.status(400).json({ error: "Conversion type missing" });
  //   }

  //   if (!files || files.length === 0) {
  //     return res.status(400).json({ error: "No file uploaded" });
  //   }

  //   console.log("INPUT FILES:", files.map(f => f.originalname).join(", "));

  //   let outputPath;
  //   const uploadedPaths = files.map(f => f.path);

  //   try {
  //     switch (type) {
  //       case "jpg":
  //         // Pass all image paths for multi-page PDF
  //         outputPath = await jpgToPdf(uploadedPaths);
  //         break;

  //       case "word":
  //       case "excel":
  //       case "ppt":
  //         outputPath = await officeToPdf(files[0].path);
  //         break;

  //       case "html":
  //         outputPath = await htmlToPdf(files[0].path);
  //         break;

  //       default:
  //         return res.status(400).json({ error: "Invalid conversion type" });
  //     }

  //     console.log("OUTPUT FILE:", outputPath);

  //     res.download(outputPath, (err) => {
  //       if (err) {
  //         console.error("❌ Download error:", err);
  //       }

  //       // Safe cleanup - delete all uploaded files
  //       try {
  //         uploadedPaths.forEach(p => fs.unlinkSync(p));
  //         fs.unlinkSync(outputPath);
  //       } catch (cleanupErr) {
  //         console.warn("⚠️ Cleanup warning:", cleanupErr.message);
  //       }
  //     });

  //   } catch (err) {
  //     console.error("🔥 CONVERSION ERROR:", err);

  //     res.status(500).json({
  //       error: "Conversion failed",
  //       message: err.message,
  //     });
  //   }
  // };


  // // exports.convertFromPdf = async (req, res) => {
  // //   console.log("==== PDF CONVERT API HIT ====");
  // //   console.log("ROUTE PARAM TYPE:", req.params.type);
  // //   console.log("FILES:", req.files);

  // //   const type = req.params.type;
  // //   const file = req.files?.[0];

  // //   // Validate request
  // //   if (!type) {
  // //     console.warn("⚠️ Missing conversion type");
  // //     return res.status(400).json({ error: "Conversion type missing" });
  // //   }
  // //   if (!file) {
  // //     console.warn("⚠️ No file received");
  // //     return res.status(400).json({ error: "No PDF uploaded" });
  // //   }

  // //   console.log("INPUT FILE NAME:", file.originalname);
  // //   console.log("INPUT FILE PATH:", file.path);

  // //   try {
  // //     if (type === "jpg") {
  // //   console.log("➡️ Calling PDF → JPG service...");
  // //   const result = await pdfToJpg(file.path);
  // //   console.log("🧠 Service returned:", result);

  // //   if (result.mode === "single") {
  // //     return res.download(result.path, (err) => {
  // //       if (err) console.error("❌ Download failed:", err);
  // //       try {
  // //         fs.unlinkSync(file.path);
  // //         fs.unlinkSync(result.path);
  // //         console.log("🧹 Cleanup done for single JPG");
  // //       } catch (e) {
  // //         console.warn("⚠️ Cleanup warning:", e.message);
  // //       }
  // //     });
  // //   }

  // //   if (result.mode === "multiple") {
  // //     const zipPath = path.join(os.tmpdir(), `pdf-images-${randomUUID()}.zip`);
  // //     console.log("📦 Zipping images to:", zipPath);

  // //     const archive = archiver("zip");
  // //     const stream = fs.createWriteStream(zipPath);
  // //     archive.pipe(stream);

  // //     result.files.forEach(img => {
  // //       archive.file(img, { name: path.basename(img) });
  // //     });

  // //     await archive.finalize();

  // //     stream.on("close", () => {
  // //       res.download(zipPath, (err) => {
  // //         if (err) console.error("❌ ZIP download error:", err);
  // //         try {
  // //           fs.unlinkSync(file.path);
  // //           fs.unlinkSync(zipPath);
  // //           result.files.forEach(f => fs.unlinkSync(f));
  // //           console.log("🧹 Cleanup done for ZIP + images");
  // //         } catch (e) {
  // //           console.warn("⚠️ Cleanup warning:", e.message);
  // //         }
  // //       });
  // //     });
  // //   }
  // // }


  // //     else if (type === "word") {
  // //       console.log("➡️ Calling Word conversion service...");
  // //       const wordPath = await pdfToWord(file.path);
  // //       console.log("✅ Word file created at:", wordPath);

  // //       res.download(wordPath, err => {
  // //         if (err) console.error("❌ Download failed:", err);

  // //         // Cleanup
  // //         try {
  // //           fs.unlinkSync(file.path);
  // //           fs.unlinkSync(wordPath);
  // //           console.log("🧹 Cleanup done");
  // //         } catch (e) {
  // //           console.warn("⚠️ Cleanup issue:", e.message);
  // //         }
  // //       });
  // //     }

  // //     else {
  // //       console.warn("⚠️ Unsupported type:", type);
  // //       return res.status(400).json({ error: "Invalid conversion type" });
  // //     }

  // //   } catch (err) {
  // //     console.error("🔥 SERVICE ERROR:", err);
  // //     console.error("📌 ERROR MSG:", err.message);
  // //     res.status(500).json({
  // //       error: "Conversion service failed",
  // //       message: err.message,
  // //       stack: err.stack // for deep debugging
  // //     });
  // //   }
  // // };

  // exports.convertFromPdf = async (req, res) => { 
  //   console.log("==== PDF CONVERT API HIT ====");
  //   console.log("ROUTE PARAM TYPE:",  req.params.type);
  //   console.log("FILES:", req.files);

  //   const type = req.params.type;
  //   const file = req.files?.[0];

  //   if (!type) return res.status(400).json({ error: "Conversion type missing" });
  //   if (!file) return res.status(400).json({ error: "No PDF uploaded" });

  //   console.log("INPUT FILE NAME:", file.originalname);
  //   console.log("INPUT FILE PATH:", file.path);

  //   try {
  //     if (type === "jpg") {
  //       console.log("➡️ Calling PDF → JPG service...");
  //       const result = await pdfToJpg(file.path);

  //       // Single JPG download - though our updated service always returns multiple mode now
  //       if (result.mode === "single") {
  //         return res.download(result.path, (err) => {
  //           if (err) console.error("❌ Download failed:", err);
  //           try {
  //             fs.unlinkSync(file.path);
  //             fs.unlinkSync(result.path);
  //           } catch (e) {}
  //         });
  //       }

  //       // Multiple pages ZIP download
  //       if (result.mode === "multiple") {
  //         // Set proper headers for ZIP download
  //         res.setHeader("Content-Type", "application/zip");
  //         res.setHeader("Content-Disposition", `attachment; filename="${result.zipFileName}"`);
          
  //         // Stream the ZIP file
  //         const fileStream = fs.createReadStream(result.zip);
  //         fileStream.pipe(res);
          
  //         // Clean up after the download completes
  //         fileStream.on("end", () => {
  //           try {
  //             fs.unlinkSync(file.path);
  //             // Our service already cleans up individual JPG files
  //             fs.unlinkSync(result.zip);
  //             console.log("🧹 Cleanup done for ZIP + input file");
  //           } catch (e) {
  //             console.warn("⚠️ Cleanup warning:", e.message);
  //           }
  //         });
          
  //         fileStream.on("error", (err) => {
  //           console.error("❌ File stream error:", err);
  //           try {
  //             fs.unlinkSync(file.path);
  //             if (fs.existsSync(result.zip)) {
  //               fs.unlinkSync(result.zip);
  //             }
  //           } catch (e) {
  //             console.warn("⚠️ Cleanup warning:", e.message);
  //           }
  //           res.status(500).json({ error: "Error streaming file" });
  //         });
  //       }
  //     }

  //     // PDF → Word download
  //     else if (type === "word") {
  //       console.log("➡️ PDF → Word requested");

  //       let wordPath;

  //       // The file is already in the correct input directory from the upload middleware
  //       const inputFilePath = file.path;
        
  //       if (isScannedPdf(inputFilePath)) {
  //         console.log("📄 Detected scanned PDF → OCR");
  //         wordPath = await ocrPdfToWord(inputFilePath);
  //       } else {
  //         console.log("📄 Detected text PDF → unoconv");
  //         wordPath = await pdfToWord(inputFilePath);
  //       }

  //       res.setHeader(
  //         "Content-Type",
  //         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  //       );
  //       const fileName = path.basename(wordPath);
  //       res.setHeader(
  //         "Content-Disposition",
  //         `attachment; filename="${fileName}"`
  //       );

  //       return res.download(wordPath, (err) => {
  //         if (err) console.error("❌ Download error:", err);
  //         try {
  //           // Only delete the output file, input file is managed by the directory cleanup utility
  //           fs.unlinkSync(wordPath);
  //         } catch {}
  //       });
  //     }


  //     else {
  //       return res.status(400).json({ error: "Invalid conversion type" });
  //     }

  //   } catch (err) {
  //     console.error("🔥 SERVICE ERROR:", err);
  //     res.status(500).json({ error: "Conversion service failed", message: err.message, stack: err.stack });
  //   }
  // };


// #####################################

// const fs = require("fs");
// const path = require("path");
// const os = require("os");
// const archiver = require("archiver");
// const { v4: randomUUID } = require("uuid");

// const jpgToPdf = require("../Services/Convert_pdf/jpgToPdf.service");
// const officeToPdf = require("../Services/Convert_pdf/officeToPdf.service");
// const htmlToPdf = require("../Services/Convert_pdf/htmlToPdf.service");
// const pdfToJpg = require("../Services/Convert_from_pdf/pdfToJpg.service");
// const isScannedPdf = require("../Services/Convert_from_pdf/pdfTypeDetect.util");
// const { pdfToWord } = require("../Services/Convert_from_pdf/pdfToWord.service");
// const ocrPdfToWord = require("../Services/Convert_from_pdf/ocrPdfToWord.service");
// const { deleteFile } = require("../utils/fileCleanup.util");

// const INPUT_DIR = path.join(__dirname, "../../temp_storage/input");

// exports.convertToPdf = async (req, res) => {
//   console.log("==== CONVERT TO PDF API HIT ====");
//   console.log("QUERY:", req.query);
//   console.log("FILES COUNT:", req.files?.length || 0);

//   const type = req.query.type;
//   const files = req.files;

//   if (!type) {
//     return res.status(400).json({ error: "Conversion type missing" });
//   }

//   if (!files || files.length === 0) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   console.log("INPUT FILES:", files.map(f => f.originalname).join(", "));

//   let outputPath;
//   const uploadedPaths = files.map(f => f.path);

//   try {
//     switch (type) {
//       case "jpg":
//         outputPath = await jpgToPdf(uploadedPaths);
//         break;
//       case "word":
//       case "excel":
//       case "ppt":
//         outputPath = await officeToPdf(files[0].path);
//         break;
//       case "html":
//         outputPath = await htmlToPdf(files[0].path);
//         break;
//       default:
//         return res.status(400).json({ error: "Invalid conversion type" });
//     }

//     console.log("OUTPUT FILE:", outputPath);

//     res.download(outputPath, (err) => {
//       if (err) {
//         console.error("❌ Download error:", err);
//       }

//       // Cleanup
//       try {
//         uploadedPaths.forEach(p => deleteFile(p));
//         deleteFile(outputPath);
//       } catch (cleanupErr) {
//         console.warn("⚠️ Cleanup warning:", cleanupErr.message);
//       }
//     });

//   } catch (err) {
//     console.error("🔥 CONVERSION ERROR:", err);
//     res.status(500).json({
//       error: "Conversion failed",
//       message: err.message,
//     });
//   }
// };

// exports.convertFromPdf = async (req, res) => { 
//   console.log("==== PDF CONVERT API HIT ====");
//   console.log("ROUTE PARAM TYPE:", req.params.type);
//   console.log("FILES:", req.files);

//   const type = req.params.type;
//   const file = req.files?.[0];

//   if (!type) return res.status(400).json({ error: "Conversion type missing" });
//   if (!file) return res.status(400).json({ error: "No PDF uploaded" });

//   console.log("INPUT FILE NAME:", file.originalname);
//   console.log("INPUT FILE PATH:", file.path);

//   try {
//     // PDF → JPG
//     if (type === "jpg") {
//       console.log("➡️ Calling PDF → JPG service...");
//       const result = await pdfToJpg(file.path);

//       if (result.mode === "single") {
//         return res.download(result.path, (err) => {
//           if (err) console.error("❌ Download failed:", err);
//           try {
//             deleteFile(file.path);
//             deleteFile(result.path);
//           } catch (e) {}
//         });
//       }

//       if (result.mode === "multiple") {
//         res.setHeader("Content-Type", "application/zip");
//         res.setHeader("Content-Disposition", `attachment; filename="${result.zipFileName}"`);
        
//         const fileStream = fs.createReadStream(result.zip);
//         fileStream.pipe(res);
        
//         fileStream.on("end", () => {
//           try {
//             deleteFile(file.path);
//             deleteFile(result.zip);
//             console.log("🧹 Cleanup done for ZIP + input file");
//           } catch (e) {
//             console.warn("⚠️ Cleanup warning:", e.message);
//           }
//         });
        
//         fileStream.on("error", (err) => {
//           console.error("❌ File stream error:", err);
//           try {
//             deleteFile(file.path);
//             deleteFile(result.zip);
//           } catch (e) {}
//           if (!res.headersSent) {
//             res.status(500).json({ error: "Error streaming file" });
//           }
//         });
//       }
//     }

//     // PDF → Word
//     else if (type === "word") {
//       console.log("➡️ PDF → Word requested");

//       const inputFilePath = file.path;
//       let wordPath;
      
//       // Detect if scanned or text-based PDF
//       const isScanned = isScannedPdf(inputFilePath);
      
//       if (isScanned) {
//         console.log("📄 Detected scanned PDF → Using OCR (Tesseract)");
//         wordPath = await ocrPdfToWord(inputFilePath);
//       } else {
//         console.log("📄 Detected text-based PDF → Using LibreOffice");
//         wordPath = await pdfToWord(inputFilePath);
//       }

//       console.log("✅ Word file ready:", wordPath);

//       // Set response headers
//       res.setHeader(
//         "Content-Type",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//       );
//       const fileName = path.basename(wordPath);
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename="${fileName}"`
//       );

//       // Send file and cleanup
//       return res.download(wordPath, (err) => {
//         if (err) console.error("❌ Download error:", err);
        
//         try {
//           // Delete input file from input directory
//           deleteFile(inputFilePath);
//           // Delete output file from output directory
//           deleteFile(wordPath);
//           console.log("🧹 Cleanup complete: input and output files deleted");
//         } catch (e) {
//           console.warn("⚠️ Cleanup warning:", e.message);
//         }
//       });
//     }

//     else {
//       return res.status(400).json({ error: "Invalid conversion type" });
//     }

//   } catch (err) {
//     console.error("🔥 SERVICE ERROR:", err);
    
//     // Cleanup on error
//     try {
//       deleteFile(file.path);
//     } catch (e) {}
    
//     res.status(500).json({ 
//       error: "Conversion service failed", 
//       message: err.message
//     });
//   }
// };

const fs = require("fs");
const path = require("path");

const jpgToPdf = require("../Services/Convert_pdf/jpgToPdf.service");
const officeToPdf = require("../Services/Convert_pdf/officeToPdf.service");
const htmlToPdf = require("../Services/Convert_pdf/htmlToPdf.service");

const pdfToJpg = require("../Services/Convert_from_pdf/pdfToJpg.service");
const isScannedPdf = require("../Services/Convert_from_pdf/pdfTypeDetect.util");
const { pdfToWord } = require("../Services/Convert_from_pdf/pdfToWord.service");
const ocrPdfToWord = require("../Services/Convert_from_pdf/ocrPdfToWord.service");

const { deleteFile } = require("../utils/fileCleanup.util");

/* ===============================
   CONVERT TO PDF
================================ */
exports.convertToPdf = async (req, res) => {
  console.log("==== CONVERT TO PDF API HIT ====");
  console.log("QUERY:", req.query);
  console.log("FILES COUNT:", req.files?.length || 0);

  const type = req.query.type;
  const files = req.files;

  if (!type) return res.status(400).json({ error: "Conversion type missing" });
  if (!files || files.length === 0)
    return res.status(400).json({ error: "No file uploaded" });

  const uploadedPaths = files.map((f) => f.path);
  let outputPath;

  try {
    switch (type) {
      case "jpg":
        outputPath = await jpgToPdf(uploadedPaths);
        break;

      case "word":
      case "excel":
      case "ppt":
        outputPath = await officeToPdf(files[0].path);
        break;

      case "html":
        outputPath = await htmlToPdf(files[0].path);
        break;

      default:
        return res.status(400).json({ error: "Invalid conversion type" });
    }

    console.log("OUTPUT FILE:", outputPath);

    res.download(outputPath, (err) => {
      if (err) console.error("❌ Download error:", err);

      try {
        uploadedPaths.forEach(deleteFile);
        deleteFile(outputPath);
      } catch (e) {
        console.warn("⚠️ Cleanup warning:", e.message);
      }
    });
  } catch (err) {
    console.error("🔥 CONVERSION ERROR:", err);
    res.status(500).json({
      error: "Conversion failed",
      message: err.message,
    });
  }
};

/* ===============================
   CONVERT FROM PDF
================================ */
exports.convertFromPdf = async (req, res) => {
  console.log("==== PDF CONVERT API HIT ====");
  console.log("ROUTE PARAM TYPE:", req.params.type);
  console.log("FILES:", req.files);

  const type = req.params.type;
  const file = req.files?.[0];

  if (!type) return res.status(400).json({ error: "Conversion type missing" });
  if (!file) return res.status(400).json({ error: "No PDF uploaded" });

  console.log("INPUT FILE:", file.originalname);

  try {
    /* -------- PDF → JPG (BULLETPROOF) -------- */
    // if (type === "jpg") {
    //   console.log("➡️ Calling PDF → JPG service...");
    //   const result = await pdfToJpg(file.path);

    //   if (result.mode === "multiple") {
    //     console.log("📦 ZIP PATH:", result.zip);
    //     console.log("📦 FILENAME:", result.zipFileName);
        
    //     // ✅ Verify file exists + get stats
    //     if (!fs.existsSync(result.zip)) {
    //       console.error("❌ ZIP FILE MISSING:", result.zip);
    //       return res.status(500).json({ error: "ZIP file missing" });
    //     }
        
    //     const stats = fs.statSync(result.zip);
    //     console.log("📦 SIZE:", stats.size, "bytes");

    //     // ✅ PERFECT HEADERS + sendFile (MOST RELIABLE)
    //     res.set({
    //       'Content-Type': 'application/zip',
    //       'Content-Disposition': `attachment; filename="${result.zipFileName}"`,
    //       'Content-Length': stats.size.toString()
    //     });

    //     res.sendFile(path.resolve(result.zip), (err) => {
    //       if (err) {
    //         console.error("❌ SendFile error:", err);
    //         if (!res.headersSent) {
    //           res.status(500).json({ error: "Download failed" });
    //         }
    //         return;
    //       }
          
    //       console.log("✅ ZIP DOWNLOAD SENT SUCCESSFULLY");

    //       // ✅ 5s DELAYED CLEANUP - BROWSER GETS FILE FIRST
    //       setTimeout(() => {
    //         try {
    //           if (fs.existsSync(file.path)) {
    //             fs.unlinkSync(file.path);
    //             console.log("🗑️ Deleted input PDF");
    //           }
    //           if (fs.existsSync(result.zip)) {
    //             fs.unlinkSync(result.zip);
    //             console.log("🗑️ Deleted ZIP:", result.zipFileName);
    //           }
    //         } catch (e) {
    //           console.warn("⚠️ Cleanup error:", e.message);
    //         }
    //       }, 5000);
    //     });
    //     return; // ✅ CRITICAL: EXIT EARLY
    //   }
    // }
    // TOP OF FILE - ADD THIS
    const http = require('http');

    // INSIDE JPG SECTION
    if (type === "jpg") {
      const result = await pdfToJpg(file.path);
      
      const zipData = fs.readFileSync(result.zip);
      
      const responseHeaders = {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${result.zipFileName}"`,
        'Content-Length': Buffer.byteLength(zipData).toString()
      };
      
      res.writeHead(200, responseHeaders);
      res.end(zipData);
      
      // Cleanup
      setTimeout(() => {
        fs.unlinkSync(file.path);
        fs.unlinkSync(result.zip);
      }, 1000);
      
      return;
    }


    /* -------- PDF → WORD -------- */
    else if (type === "word") {
      console.log("➡️ PDF → Word requested");

      const inputPath = file.path;
      let wordPath;

      if (isScannedPdf(inputPath)) {
        console.log("📄 Scanned PDF → OCR");
        wordPath = await ocrPdfToWord(inputPath);
      } else {
        console.log("📄 Text PDF → LibreOffice");
        wordPath = await pdfToWord(inputPath);
      }

      const fileName = path.basename(wordPath);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      res.download(wordPath, (err) => {
        if (err) console.error("❌ Download error:", err);

        try {
          deleteFile(inputPath);
          deleteFile(wordPath);
          console.log("🧹 Cleanup done (Word + input)");
        } catch (e) {
          console.warn("⚠️ Cleanup warning:", e.message);
        }
      });
    }

    else {
      return res.status(400).json({ error: "Invalid conversion type" });
    }
  } catch (err) {
    console.error("🔥 SERVICE ERROR:", err);

    try {
      deleteFile(file.path);
    } catch {}

    res.status(500).json({
      error: "Conversion service failed",
      message: err.message,
    });
  }
};
