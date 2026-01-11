const express = require("express");
const router = express.Router();

const {
  createScanSession,
  receiveScanImage,
  getSessionStatus,
  finalizeScanPdf,
  downloadPdf
} = require("../Controllers/scan.controller");

const scanUpload = require("../Middleware/scanUpload.middleware");

/* STEP 1 */
router.post("/create-session", createScanSession);

/* STEP 2 */
router.post(
  "/upload-image",
  scanUpload.single("image"),
  receiveScanImage
);

/* STEP 3 - Check session status */
router.get("/session-status", getSessionStatus);

/* STEP 4 */
router.post("/finalize", finalizeScanPdf);

/* DOWNLOAD PDF */
router.get("/download", downloadPdf);

module.exports = router;
