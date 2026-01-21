const asposepdf = require("asposepdfnodejs");
const path = require("path");

exports.convertToPdfA = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(
      "uploads",
      "PDF_A_" + Date.now() + ".pdf"
    );

    // Convert to PDF/A-1b (most common standard)
    const options = {
      format: "PdfA_1B"
    };

    await asposepdf.convertToPDFA(inputPath, outputPath, options);

    res.json({
      message: "Converted to PDF/A successfully 🚀",
      downloadUrl: `/files/${path.basename(outputPath)}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF/A conversion failed" });
  }
};
