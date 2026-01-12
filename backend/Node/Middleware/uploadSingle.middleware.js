const multer = require("multer");
const os = require("os");
const path = require("path");

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

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = os.tmpdir();
    console.log("📁 Upload destination:", tempDir);
    cb(null, tempDir);
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

// Multer instance for single file
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
  },
});

// Debug wrapper middleware for single file
const uploadSingleFile = (fieldName = "file") => {
  return (req, res, next) => {
    const uploader = upload.single(fieldName);

    uploader(req, res, (err) => {
      if (err) {
        console.error("❌ Multer error:", err.message);
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }

      console.log("📦 File received:", req.file ? req.file.originalname : "None");
      console.log("🧾 Body fields:", req.body);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      // Convert single file to files array to maintain consistency with other routes
      req.files = [req.file];

      next();
    });
  };
};

module.exports = uploadSingleFile;