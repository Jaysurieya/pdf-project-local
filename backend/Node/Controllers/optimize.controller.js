const { createWorker } = require("tesseract.js");
const pdfPoppler = require("pdf-poppler");
const path = require("path");
const fs = require("fs");

exports.scanPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const pdfPath = req.file.path;
    const outputDir = "uploads/images";
    const tempDir = path.dirname(pdfPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Convert PDF pages to images
    const opts = {
      format: "png",
      out_dir: outputDir,
      out_prefix: "page",
      page: null,
    };

    await pdfPoppler.convert(pdfPath, opts);

    const worker = await createWorker("eng", 1, {
      logger: m => console.log(m), // Log progress
    });

    let extractedText = [];
    let fullText = "";

    const files = fs.readdirSync(outputDir)
      .filter(file => file.endsWith(".png"))
      .sort(); // Sort to maintain page order

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imagePath = path.join(outputDir, file);

      const { data } = await worker.recognize(imagePath);
      
      const pageText = {
        page: i + 1,
        fileName: file,
        text: data.text,
      };
      
      extractedText.push(pageText);
      fullText += data.text + "\n"; // Combine all text
    }

    await worker.terminate();

    // Clean up temporary image files
    try {
      fs.rmSync(outputDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn("Warning: Could not clean up temporary image files:", cleanupErr.message);
    }

    res.json({
      message: "OCR Completed 🚀",
      success: true,
      totalPages: extractedText.length,
      fullText: fullText.trim(),
      pages: extractedText,
    });

  } catch (err) {
    console.error("OCR Error:", err);
    
    // Clean up temporary image files in case of error
    try {
      const outputDir = "uploads/images";
      fs.rmSync(outputDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn("Warning: Could not clean up temporary image files:", cleanupErr.message);
    }
    
    res.status(500).json({ 
      error: "OCR failed",
      message: err.message 
    });
  }
};
