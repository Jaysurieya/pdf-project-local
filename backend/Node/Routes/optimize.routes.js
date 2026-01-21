const express = require("express");
const multer = require("multer");
const path = require("path");
const { scanPDF } = require("../Controllers/optimize.controller");

const router = express.Router();

// storage for uploaded pdf
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Route
router.post("/ocr", upload.single("file"), scanPDF);

module.exports = router;
