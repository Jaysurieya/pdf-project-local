  const express = require("express");
  const router = express.Router();
  const uploadFiles = require("../Middleware/upload.middleware");
  const { convertToPdf } = require("../Controllers/convert.controller");
  const { convertFromPdf } = require("../Controllers/convert.controller");

  // Existing routes
  router.post("/to-pdf", uploadFiles, convertToPdf);
  router.post("/from-pdf/:type", uploadFiles, convertFromPdf);

  // New specific route for PDF to JPG conversion
  router.post("/pdf-to-jpg", uploadFiles, async (req, res) => {
    // Override the type parameter to be 'jpg' for this specific endpoint
    req.params.type = 'jpg';
    // Call the existing convertFromPdf function
    await convertFromPdf(req, res);
  });

  module.exports = router;