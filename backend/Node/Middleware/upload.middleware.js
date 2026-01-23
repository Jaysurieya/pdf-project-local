// const multer = require("multer");
// const os = require("os");
// const path = require("path");
// const fs = require("fs");

// // Define fixed input directory
// const INPUT_DIR = path.join(__dirname, "../../uploads/input");

// // Ensure the input directory exists
// if (!fs.existsSync(INPUT_DIR)) {
//   fs.mkdirSync(INPUT_DIR, { recursive: true });
// }

// // Allowed file types (basic safety)
// const ALLOWED_EXTENSIONS = [
//   ".pdf",
//   ".doc",
//   ".docx",
//   ".xls",
//   ".xlsx",
//   ".ppt",
//   ".pptx",
//   ".jpg",
//   ".jpeg",
//   ".png",
//   ".html",
//   ".htm"
// ];

// // Clean the input directory function (sync to work with multer)
// const cleanInputDirectory = () => {
//   if (!fs.existsSync(INPUT_DIR)) {
//     return;
//   }
  
//   const files = fs.readdirSync(INPUT_DIR);
//   for (const file of files) {
//     const filePath = path.join(INPUT_DIR, file);
//     try {
//       fs.unlinkSync(filePath);
//       console.log(`🗑️ Deleted: ${filePath}`);
//     } catch (err) {
//       console.error(`Error deleting file ${filePath}:`, err);
//     }
//   }
// };

// // Storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Clean the input directory before each upload
//     try {
//       cleanInputDirectory();
//       console.log("📁 Upload destination:", INPUT_DIR);
//       cb(null, INPUT_DIR);
//     } catch (err) {
//       console.error("Error cleaning input directory:", err);
//       cb(err, os.tmpdir()); // fallback to temp dir
//     }
//   },

//   filename: (req, file, cb) => {
//     const safeName = file.originalname.replace(/\s+/g, "_");
//     const finalName = `${Date.now()}-${safeName}`;
//     console.log("📄 Saving file as:", finalName);
//     cb(null, finalName);
//   },
// });

// // File validation
// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname).toLowerCase();

//   if (!ALLOWED_EXTENSIONS.includes(ext)) {
//     console.error("❌ Blocked file type:", file.originalname);
//     return cb(
//       new Error(`Unsupported file type: ${ext}`),
//       false
//     );
//   }

//   console.log("✅ Accepted file:", file.originalname);
//   cb(null, true);
// };

// // Multer instance
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB per file
//   },
// });

// // Debug wrapper middleware
// const uploadFiles = (req, res, next) => {
//   const uploader = upload.array("files");

//   uploader(req, res, (err) => {
//     if (err) {
//       console.error("❌ Multer error:", err.message);
//       return res.status(400).json({
//         success: false,
//         error: err.message,
//       });
//     }

//     console.log("📦 Files received:", req.files?.length || 0);
//     console.log("🧾 Body fields:", req.body);

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "No files uploaded",
//       });
//     }

//     next();
//   });
// };

// module.exports = uploadFiles;


const multer = require("multer");
const os = require("os");
const path = require("path");
const fs = require("fs");

// Define fixed input directory
const INPUT_DIR = path.join(__dirname, "../../temp_storage/input");

// Ensure the input directory exists
if (!fs.existsSync(INPUT_DIR)) {
  fs.mkdirSync(INPUT_DIR, { recursive: true });
}

// Allowed file types (basic safety)
const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".jpg",
  ".jpeg",
  ".png",
  ".html",
  ".htm"
];

// Clean the input directory function (sync to work with multer)
// CRITICAL FIX: This function now only cleans OLD files, not all files
const cleanInputDirectory = () => {
  if (!fs.existsSync(INPUT_DIR)) {
    return;
  }
  
  const files = fs.readdirSync(INPUT_DIR);
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    try {
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;
      
      // Only delete files older than 5 minutes (leftover from failed conversions)
      if (fileAge > FIVE_MINUTES) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted old file: ${file} (${Math.round(fileAge/1000)}s old)`);
      }
    } catch (err) {
      console.error(`Error processing file ${filePath}:`, err);
    }
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Clean only OLD files from the input directory before upload
    try {
      cleanInputDirectory();
      console.log("📁 Upload destination:", INPUT_DIR);
      cb(null, INPUT_DIR);
    } catch (err) {
      console.error("Error cleaning input directory:", err);
      cb(err, os.tmpdir()); // fallback to temp dir
    }
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    const finalName = `${Date.now()}-${safeName}`;
    console.log("📄 Saving file as:", finalName);
    cb(null, finalName);
  },
});

// File validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    console.error("❌ Blocked file type:", file.originalname);
    return cb(
      new Error(`Unsupported file type: ${ext}`),
      false
    );
  }

  console.log("✅ Accepted file:", file.originalname);
  cb(null, true);
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
  },
});

// Debug wrapper middleware
const uploadFiles = (req, res, next) => {
  const uploader = upload.array("files");

  uploader(req, res, (err) => {
    if (err) {
      console.error("❌ Multer error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    console.log("📦 Files received:", req.files?.length || 0);
    console.log("🧾 Body fields:", req.body);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded",
      });
    }

    next();
  });
};

module.exports = uploadFiles;