const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sessionId = req.query.sessionId; // ✅ FIXED

    if (!sessionId) {
      return cb(new Error("sessionId missing"));
    }

    const dir = path.join("uploads", "scan-sessions", sessionId);
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    cb(null, `${Date.now()}.jpg`);
  }
});


module.exports = multer({ storage });
