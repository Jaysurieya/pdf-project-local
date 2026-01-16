const fs = require("fs");
const path = require("path");
const os = require("os");
const archiver = require("archiver");
const { v4: randomUUID } = require("uuid");

const jpgToPdf = require("../Services/Convert_pdf/jpgToPdf.service");
const officeToPdf = require("../Services/Convert_pdf/officeToPdf.service");
const htmlToPdf = require("../Services/Convert_pdf/htmlToPdf.service");

const pdfToJpg = require("../Services/Convert_from_pdf/pdfToJpg.service");
const pdfToWord = require("../Services/Convert_from_pdf/pdfToWord.service");


exports.convertToPdf = async (req, res) => {
  console.log("==== CONVERT API HIT ====");
  console.log("QUERY:", req.query);
  console.log("FILES COUNT:", req.files?.length || 0);

  const type = req.query.type; // jpg | word | excel | ppt | html
  const files = req.files;

  if (!type) {
    return res.status(400).json({ error: "Conversion type missing" });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("INPUT FILES:", files.map(f => f.originalname).join(", "));

  let outputPath;
  const uploadedPaths = files.map(f => f.path);

  try {
    switch (type) {
      case "jpg":
        // Pass all image paths for multi-page PDF
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
      if (err) {
        console.error("❌ Download error:", err);
      }

      // Safe cleanup - delete all uploaded files
      try {
        uploadedPaths.forEach(p => fs.unlinkSync(p));
        fs.unlinkSync(outputPath);
      } catch (cleanupErr) {
        console.warn("⚠️ Cleanup warning:", cleanupErr.message);
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


// exports.convertFromPdf = async (req, res) => {
//   console.log("==== PDF CONVERT API HIT ====");
//   console.log("ROUTE PARAM TYPE:", req.params.type);
//   console.log("FILES:", req.files);

//   const type = req.params.type;
//   const file = req.files?.[0];

//   // Validate request
//   if (!type) {
//     console.warn("⚠️ Missing conversion type");
//     return res.status(400).json({ error: "Conversion type missing" });
//   }
//   if (!file) {
//     console.warn("⚠️ No file received");
//     return res.status(400).json({ error: "No PDF uploaded" });
//   }

//   console.log("INPUT FILE NAME:", file.originalname);
//   console.log("INPUT FILE PATH:", file.path);

//   try {
//     if (type === "jpg") {
//   console.log("➡️ Calling PDF → JPG service...");
//   const result = await pdfToJpg(file.path);
//   console.log("🧠 Service returned:", result);

//   if (result.mode === "single") {
//     return res.download(result.path, (err) => {
//       if (err) console.error("❌ Download failed:", err);
//       try {
//         fs.unlinkSync(file.path);
//         fs.unlinkSync(result.path);
//         console.log("🧹 Cleanup done for single JPG");
//       } catch (e) {
//         console.warn("⚠️ Cleanup warning:", e.message);
//       }
//     });
//   }

//   if (result.mode === "multiple") {
//     const zipPath = path.join(os.tmpdir(), `pdf-images-${randomUUID()}.zip`);
//     console.log("📦 Zipping images to:", zipPath);

//     const archive = archiver("zip");
//     const stream = fs.createWriteStream(zipPath);
//     archive.pipe(stream);

//     result.files.forEach(img => {
//       archive.file(img, { name: path.basename(img) });
//     });

//     await archive.finalize();

//     stream.on("close", () => {
//       res.download(zipPath, (err) => {
//         if (err) console.error("❌ ZIP download error:", err);
//         try {
//           fs.unlinkSync(file.path);
//           fs.unlinkSync(zipPath);
//           result.files.forEach(f => fs.unlinkSync(f));
//           console.log("🧹 Cleanup done for ZIP + images");
//         } catch (e) {
//           console.warn("⚠️ Cleanup warning:", e.message);
//         }
//       });
//     });
//   }
// }


//     else if (type === "word") {
//       console.log("➡️ Calling Word conversion service...");
//       const wordPath = await pdfToWord(file.path);
//       console.log("✅ Word file created at:", wordPath);

//       res.download(wordPath, err => {
//         if (err) console.error("❌ Download failed:", err);

//         // Cleanup
//         try {
//           fs.unlinkSync(file.path);
//           fs.unlinkSync(wordPath);
//           console.log("🧹 Cleanup done");
//         } catch (e) {
//           console.warn("⚠️ Cleanup issue:", e.message);
//         }
//       });
//     }

//     else {
//       console.warn("⚠️ Unsupported type:", type);
//       return res.status(400).json({ error: "Invalid conversion type" });
//     }

//   } catch (err) {
//     console.error("🔥 SERVICE ERROR:", err);
//     console.error("📌 ERROR MSG:", err.message);
//     res.status(500).json({
//       error: "Conversion service failed",
//       message: err.message,
//       stack: err.stack // for deep debugging
//     });
//   }
// };

exports.convertFromPdf = async (req, res) => { 
  console.log("==== PDF CONVERT API HIT ====");
  console.log("ROUTE PARAM TYPE:", req.params.type);
  console.log("FILES:", req.files);

  const type = req.params.type;
  const file = req.files?.[0];

  if (!type) return res.status(400).json({ error: "Conversion type missing" });
  if (!file) return res.status(400).json({ error: "No PDF uploaded" });

  console.log("INPUT FILE NAME:", file.originalname);
  console.log("INPUT FILE PATH:", file.path);

  try {
    if (type === "jpg") {
      console.log("➡️ Calling PDF → JPG service...");
      const result = await pdfToJpg(file.path);

      // Single JPG download - though our updated service always returns multiple mode now
      if (result.mode === "single") {
        return res.download(result.path, (err) => {
          if (err) console.error("❌ Download failed:", err);
          try {
            fs.unlinkSync(file.path);
            fs.unlinkSync(result.path);
          } catch (e) {}
        });
      }

      // Multiple pages ZIP download
      if (result.mode === "multiple") {
        // Set proper headers for ZIP download
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${result.zipFileName}"`);
        
        // Stream the ZIP file
        const fileStream = fs.createReadStream(result.zip);
        fileStream.pipe(res);
        
        // Clean up after the download completes
        fileStream.on("end", () => {
          try {
            fs.unlinkSync(file.path);
            // Our service already cleans up individual JPG files
            fs.unlinkSync(result.zip);
            console.log("🧹 Cleanup done for ZIP + input file");
          } catch (e) {
            console.warn("⚠️ Cleanup warning:", e.message);
          }
        });
        
        fileStream.on("error", (err) => {
          console.error("❌ File stream error:", err);
          try {
            fs.unlinkSync(file.path);
            if (fs.existsSync(result.zip)) {
              fs.unlinkSync(result.zip);
            }
          } catch (e) {
            console.warn("⚠️ Cleanup warning:", e.message);
          }
          res.status(500).json({ error: "Error streaming file" });
        });
      }
    }

    // PDF → Word download
    else if (type === "word") {
      console.log("➡️ Calling Word conversion service...");
      const wordPath = await pdfToWord(file.path);
      console.log("✅ Word ready:", wordPath);

      return res.download(wordPath, (err) => {
        if (err) console.error("❌ Download failed:", err);
        try {
          fs.unlinkSync(file.path);
          fs.unlinkSync(wordPath);
        } catch (e) {}
      });
    }

    else {
      return res.status(400).json({ error: "Invalid conversion type" });
    }

  } catch (err) {
    console.error("🔥 SERVICE ERROR:", err);
    res.status(500).json({ error: "Conversion service failed", message: err.message, stack: err.stack });
  }
};