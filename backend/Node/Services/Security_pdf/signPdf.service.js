const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { randomUUID } = require("crypto");

module.exports = async (inputPath, signatureBase64, placements) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Read PDF
      const pdfBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Embed signature
      const signatureImage = await pdfDoc.embedPng(
        Buffer.from(signatureBase64.replace(/^data:image\/png;base64,/, ""), "base64")
      );

      const pages = pdfDoc.getPages();

      placements.forEach((p) => {
        const page = pages[p.page];
        if (!page) return;

        const { width, height } = page.getSize();

        const sigWidth = p.widthPercent * width;
        const sigHeight = p.heightPercent * height;

        const x = p.xPercent * width;
        const y = height - (p.yPercent * height) - sigHeight;

        page.drawImage(signatureImage, {
          x,
          y,
          width: sigWidth,
          height: sigHeight
        });
      });

      const signedPdf = await pdfDoc.save();
      
      // Create temporary file path for the signed PDF
      const outputPath = path.join(os.tmpdir(), `${randomUUID()}_signed.pdf`);
      
      // Write the signed PDF to the temporary file
      fs.writeFileSync(outputPath, signedPdf);
      
      resolve(outputPath);
    } catch (error) {
      console.error("SIGN PDF SERVICE ERROR:", error);
      reject(error);
    }
  });
};