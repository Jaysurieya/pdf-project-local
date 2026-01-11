// const fs = require("fs");
// const path = require("path");
// const { v4: uuidv4 } = require("uuid");

// const { createPdfFromImages } = require("../utils/scanToPdf.util");

// /* CREATE SESSION */
// exports.createScanSession = (req, res) => {
//   const sessionId = uuidv4();

//   const dir = path.join("uploads", "scan-sessions", sessionId);
//   fs.mkdirSync(dir, { recursive: true });

//   res.json({
//     sessionId,
//     mobileUrl: `http://10.231.82.87:5173/mobile-scan?sessionId=${sessionId}`
//   });
// };

// /* IMAGE RECEIVED */
// exports.receiveScanImage = (req, res) => {
//   res.json({ success: true });
// };

// /* FINALIZE PDF */
// exports.finalizeScanPdf = async (req, res) => {
//   const { sessionId } = req.body;
//   if (!sessionId) {
//     return res.status(400).json({ error: "sessionId missing" });
//   }

//   const sessionDir = path.join("uploads", "scan-sessions", sessionId);

//   try {
//     const pdfPath = await createPdfFromImages(sessionDir);
//     res.download(pdfPath, "scan.pdf");
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "PDF generation failed" });
//   }
// };

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { createPdfFromImages } = require("../utils/scanToPdf.util");

// Simple in-memory session tracking to prevent multiple finalize operations
const activeSessions = new Set();

/* CREATE SESSION */
exports.createScanSession = (req, res) => {
  const sessionId = uuidv4();

  const dir = path.join("uploads", "scan-sessions", sessionId);
  fs.mkdirSync(dir, { recursive: true });

  res.json({
    sessionId,
    mobileUrl: `http://10.231.82.87:5173/mobile-scan?sessionId=${sessionId}`,
    desktopUrl: `http://10.231.82.87:5173/scan-desktop?sessionId=${sessionId}`
  });
};

/* IMAGE RECEIVED */
exports.receiveScanImage = (req, res) => {
  res.json({ success: true });
};

/* CHECK SESSION STATUS */
exports.getSessionStatus = (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId missing" });
  }

  const sessionDir = path.join("uploads", "scan-sessions", sessionId);

  // Check if session directory exists
  if (!fs.existsSync(sessionDir)) {
    return res.json({
      images: [],
      pdfReady: false,
      pdfUrl: null
    });
  }

  // Read all image files from the session directory
  const files = fs.readdirSync(sessionDir);
  const imageFiles = files.filter(file => 
    file.toLowerCase().endsWith('.jpg') || 
    file.toLowerCase().endsWith('.jpeg') || 
    file.toLowerCase().endsWith('.png')
  ).sort();

  // Create URLs for the images
  const imageUrls = imageFiles.map(file => 
    `/files/scan-sessions/${sessionId}/${file}`
  );

  // Check if final.pdf exists
  const pdfExists = files.includes('final.pdf');
  const pdfUrl = pdfExists ? `/api/scan/download?sessionId=${sessionId}` : null;

  res.json({
    images: imageUrls,
    pdfReady: pdfExists,
    pdfUrl: pdfUrl
  });
};

/* DOWNLOAD PDF */
exports.downloadPdf = (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId missing" });
  }

  const pdfPath = path.join("uploads", "scan-sessions", sessionId, "final.pdf");
  
  if (!fs.existsSync(pdfPath)) {
    return res.status(400).json({ error: "PDF not found. Has the conversion been completed?" });
  }
  
  res.download(pdfPath, "scan.pdf");
};

/* FINALIZE PDF */
exports.finalizeScanPdf = async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId missing" });
  }

  const sessionDir = path.join("uploads", "scan-sessions", sessionId);

  // Check if session directory exists
  if (!fs.existsSync(sessionDir)) {
    return res.status(400).json({ error: "Session directory does not exist" });
  }

  // Prevent multiple finalize operations for the same session
  if (activeSessions.has(sessionId)) {
    return res.status(400).json({ error: "Session is already being processed" });
  }

  try {
    activeSessions.add(sessionId);
    const pdfPath = await createPdfFromImages(sessionDir);
    
    // Send success response to the mobile client
    res.json({ success: true, message: "PDF generated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF generation failed: " + err.message });
  } finally {
    activeSessions.delete(sessionId);
  }
};