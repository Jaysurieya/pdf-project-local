const express = require("express");
const router = express.Router();
const multer = require("multer");

// Single file upload middleware for edit operations
const singleUpload = multer().none(); // We'll use this to process the body and handle the file

// Import upload middleware that handles the file upload
const uploadMiddleware = require("../Middleware/upload.middleware");

// Since the existing middleware handles array of files, we need to wrap it to work with single file
const singleFileUpload = (req, res, next) => {
  // Call the original upload middleware
  uploadMiddleware(req, res, (err) => {
    if (err) return next(err);
    // Set req.file to the first file in req.files
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

const { addWatermark,cropPdf,basicEditPdf,rotate } = require("../Controllers/edit.controller");

router.post("/rotate", singleFileUpload, rotate);

// ADD WATERMARK
router.post("/watermark", singleFileUpload, addWatermark);

// CROP PDF (single-page only)
router.post("/crop", singleFileUpload, cropPdf);

// BASIC EDIT (metadata / text annotation)
router.post("/basic", singleFileUpload, basicEditPdf);

module.exports = router;
