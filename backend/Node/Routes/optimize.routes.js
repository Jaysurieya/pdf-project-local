const express = require("express");
const multer = require("multer");
const { scanPDF } = require("../Controllers/optimize.controller");
const { compressPdfController } = require("../Controllers/compress.controller");

const router = express.Router();

/* ---------------- OCR (disk storage – existing) ---------------- */

const diskStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadDisk = multer({ storage: diskStorage });

router.post("/ocr", uploadDisk.single("file"), scanPDF);

/* ---------------- PDF Compression (NO storage) ---------------- */

// memory storage → no pdf saved
const uploadMemory = multer({ storage: multer.memoryStorage() });

router.post(
  "/compress",
  uploadMemory.single("file"),
  compressPdfController
);

module.exports = router;
