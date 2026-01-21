const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadFiles = require("../Middleware/upload.middleware");
const uploadSingleFile = require("../Middleware/uploadSingle.middleware");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });
const { PDFDocument } = require("pdf-lib");
const uploadRedact = multer({ storage: multer.memoryStorage() });

const comparePdf = require("../Services/Security_pdf/pdfCompare.service");
const unlockPdf = require("../Services/Security_pdf/pdfUnlock.service");
const pdfProtect = require("../Services/Security_pdf/pdfProtect.service");
const signPdf = require("../Services/Security_pdf/signPdf.service");

router.post("/protect", uploadFiles, async (req, res) => {
  try {
    const file = req.files?.[0];
    const { password } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const outputPath = await pdfProtect(file.path, password);

    res.download(outputPath, "protected.pdf", () => {
      try {
        require("fs").unlinkSync(file.path);
        require("fs").unlinkSync(outputPath);
      } catch (cleanupErr) {
        console.error("Cleanup error:", cleanupErr);
      }
    });

  } catch (err) {
    console.error("PDF Protect Error:", err);
    // Clean up the original file if an error occurs
    if (req.files?.[0]?.path) {
      try {
        require("fs").unlinkSync(req.files[0].path);
      } catch (cleanupErr) {
        console.error("Original file cleanup error:", cleanupErr);
      }
    }
    res.status(500).json({ error: "Failed to protect PDF" });
  }
});
router.post("/unlock", uploadFiles, async (req, res) => {
  try {
    const { password } = req.body;
    const file = req.files?.[0]; // ✅ FIX

    if (!file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    const unlockedPath = await unlockPdf(file.path, password);

    res.download(unlockedPath, "unlocked.pdf", () => {
      try {
        const fs = require("fs");
        fs.unlinkSync(file.path);
        fs.unlinkSync(unlockedPath);
      } catch (cleanupErr) {
        console.error("Cleanup error:", cleanupErr);
      }
    });

  } catch (err) {
    console.error("❌ Unlock error:", err.message);

    if (err.message === "WRONG_PASSWORD") {
      // Clean up the original file if password is wrong
      if (req.files?.[0]?.path) {
        try {
          require("fs").unlinkSync(req.files[0].path);
        } catch (cleanupErr) {
          console.error("Original file cleanup error:", cleanupErr);
        }
      }
      return res.status(400).json({ message: "Incorrect PDF password" });
    }

    console.error("Unlock error:", err);
    // Clean up the original file if an error occurs
    if (req.files?.[0]?.path) {
      try {
        require("fs").unlinkSync(req.files[0].path);
      } catch (cleanupErr) {
        console.error("Original file cleanup error:", cleanupErr);
      }
    }
    res.status(500).json({ message: "Failed to unlock PDF" });
  }
});

router.post("/compare", uploadFiles, async (req, res) => {
  try {
    if (!req.files || req.files.length !== 2) {
      return res.status(400).json({ message: "Upload exactly 2 PDF files" });
    }

    const [file1, file2] = req.files;

    const result = await comparePdf(file1.path, file2.path);

    fs.unlinkSync(file1.path);
    fs.unlinkSync(file2.path);

    res.json(result); // 🔥 IMPORTANT
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF comparison failed" });
  }
});
router.post("/sign", uploadSingleFile('pdf'), async (req, res) => {
  try {
    const file = req.files?.[0];
    const { signatureBase64, placements } = req.body;

    if (!file || !signatureBase64 || !placements) {
      return res.status(400).json({ message: "Missing data" });
    }

    const placementArr = JSON.parse(placements);

    // Use the service to sign the PDF
    const signedPdfPath = await signPdf(file.path, signatureBase64, placementArr);

    // Send the signed PDF for download
    res.download(signedPdfPath, "signed.pdf", () => {
      try {
        // Clean up both original and signed files after download
        fs.unlinkSync(file.path);
        fs.unlinkSync(signedPdfPath);
      } catch (cleanupErr) {
        console.error("Cleanup error:", cleanupErr);
      }
    });

  } catch (err) {
    console.error("SIGN PDF ERROR:", err);
    // Clean up the original file if an error occurs
    if (req.files?.[0]?.path) {
      try {
        fs.unlinkSync(req.files[0].path);
      } catch (cleanupErr) {
        console.error("Original file cleanup error:", cleanupErr);
      }
    }
    res.status(500).json({ message: "Failed to sign PDF" });
  }
});

router.post("/redact", uploadRedact.array("pages"), async (req, res) => {
  try {
    const { PDFDocument } = require("pdf-lib");

    const pdfDoc = await PDFDocument.create();

    for (let file of req.files) {
      const imgBytes = file.buffer;

      const page = pdfDoc.addPage();
      const pngImage = await pdfDoc.embedPng(imgBytes);

      const { width, height } = pngImage.scale(1);

      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width,
        height
      });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=redacted.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate redacted PDF" });
  }
});


router.post("/redact", uploadRedact.array("pages"), async (req, res) => {
  try {
    const { PDFDocument } = require("pdf-lib");

    const pdfDoc = await PDFDocument.create();

    for (let file of req.files) {
      const imgBytes = file.buffer;

      const page = pdfDoc.addPage();
      const pngImage = await pdfDoc.embedPng(imgBytes);

      const { width, height } = pngImage.scale(1);

      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width,
        height
      });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=redacted.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate redacted PDF" });
  }
});

module.exports = router;