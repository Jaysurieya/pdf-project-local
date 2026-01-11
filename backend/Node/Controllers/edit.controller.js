const fs = require("fs");
const { PDFDocument, rgb, degrees } = require("pdf-lib");

/* -------------------------------- ROTATE PDF -------------------------------- */
const rotate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }
    
    const filePath = req.file.path;
    const angle = parseInt(req.body.rotation || req.body.option || 90); // 90, 180, 270

    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      page.setRotation(degrees(angle));
    });

    const rotatedPdf = await pdfDoc.save();
    fs.unlinkSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=rotated.pdf");
    res.send(Buffer.from(rotatedPdf));
  } catch (err) {
    console.error("Rotate PDF Error:", err);
    // Clean up the uploaded file in case of error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: "Rotate PDF failed", error: err.message });
  }
};

/* ------------------------------- ADD WATERMARK ------------------------------- */
const addWatermark = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }
    
    const filePath = req.file.path;

    const watermarkText = req.body.watermarkText || "WATERMARK";
    const fontSize = parseInt(req.body.fontSize) || 30;
    const opacity = parseFloat(req.body.opacity) || 0.5;
    const color = req.body.color || "gray";
    const position = req.body.position || "center";

    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont("Helvetica-Bold");

    let textColor;
    switch (color) {
      case "red": textColor = rgb(1, 0, 0); break;
      case "blue": textColor = rgb(0, 0, 1); break;
      case "green": textColor = rgb(0, 0.5, 0); break;
      case "black": textColor = rgb(0, 0, 0); break;
      default: textColor = rgb(0.5, 0.5, 0.5);
    }

    const pages = pdfDoc.getPages();

    pages.forEach(page => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

      let x, y;

      switch (position) {
        case "top-left":
          x = 50; y = height - 100; break;
        case "top-right":
          x = width - textWidth - 50; y = height - 100; break;
        case "bottom-left":
          x = 50; y = 100; break;
        case "bottom-right":
          x = width - textWidth - 50; y = 100; break;
        case "repeat":
          // Draw watermarks in multiple positions
          const positions = [
            { x: width / 2 - textWidth / 2, y: height / 2 },
            { x: 50, y: height - 100 },
            { x: width - textWidth - 50, y: height - 100 },
            { x: 50, y: 100 },
            { x: width - textWidth - 50, y: 100 }
          ];
          positions.forEach(pos => {
            page.drawText(watermarkText, {
              x: pos.x,
              y: pos.y,
              size: fontSize,
              font,
              color: textColor,
              opacity,
            });
          });
          return;
        case "diagonal":
          page.drawText(watermarkText, {
            x: width / 2 - textWidth / 2,
            y: height / 2,
            size: fontSize,
            font,
            color: textColor,
            opacity,
            rotate: degrees(-45),
          });
          return;
        case "center":
        default:
          x = (width - textWidth) / 2;
          y = height / 2;
      }

      page.drawText(watermarkText, {
        x,
        y,
        size: fontSize,
        font,
        color: textColor,
        opacity,
      });
    });

    const output = await pdfDoc.save();
    fs.unlinkSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=watermarked.pdf");
    res.send(Buffer.from(output));
  } catch (err) {
    console.error("Watermark Error:", err);
    // Clean up the uploaded file in case of error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: "Add watermark failed", error: err.message });
  }
};

/* ---------------------------------- CROP PDF --------------------------------- */
const cropPdf = async (req, res) => {
  try {
    // Validate that only one file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }
    
    const filePath = req.file.path;

    const left = parseFloat(req.body.cropLeft) || parseFloat(req.body.left) || 0;
    const right = parseFloat(req.body.cropRight) || parseFloat(req.body.right) || 0;
    const top = parseFloat(req.body.cropTop) || parseFloat(req.body.top) || 0;
    const bottom = parseFloat(req.body.cropBottom) || parseFloat(req.body.bottom) || 0;

    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    if (pages.length !== 1) {
      return res.status(400).json({
        message: "Crop supports only single-page PDFs",
      });
    }

    const page = pages[0];
    const { width, height } = page.getSize();

    const newWidth = width * (1 - (left + right) / 100);
    const newHeight = height * (1 - (top + bottom) / 100);

    const embedded = await pdfDoc.embedPage(page, {
      left: (left / 100) * width,
      right: width - (right / 100) * width,
      top: height - (top / 100) * height,
      bottom: (bottom / 100) * height,
    });

    pdfDoc.removePage(0);
    const newPage = pdfDoc.addPage([newWidth, newHeight]);

    newPage.drawPage(embedded, {
      x: 0,
      y: 0,
      width: newWidth,
      height: newHeight,
    });

    const croppedPdf = await pdfDoc.save();
    fs.unlinkSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=cropped.pdf");
    res.send(Buffer.from(croppedPdf));
  } catch (err) {
    console.error("Crop PDF Error:", err);
    // Clean up the uploaded file in case of error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: "Crop PDF failed", error: err.message });
  }
};

/* ------------------------------ BASIC EDIT PDF -------------------------------- */
const basicEditPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }
    
    const filePath = req.file.path;

    const editType = req.body.editType || "metadata";
    const searchText = req.body.searchText || "";
    const replaceText = req.body.replaceText || "";
    const textYPosition = parseInt(req.body.textY) || 100;
    const metadata = JSON.parse(req.body.metadata || "{}");

    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    if (editType === "text-replace" && searchText) {
      const font = await pdfDoc.embedFont("Helvetica-Bold");
      pdfDoc.getPages().forEach(page => {
        // NOTE: This only adds new text at the specified position
        // True text replacement in existing PDF content is not reliably supported by pdf-lib
        // The original text will remain in the PDF, and new text will be added
        page.drawText(replaceText, {
          x: 100, // Default x position
          y: textYPosition,
          size: 14,
          font,
          color: rgb(0, 0, 0),
        });
      });
    }

    if (metadata && typeof metadata === 'object') {
      if (metadata.title) pdfDoc.setTitle(metadata.title);
      if (metadata.author) pdfDoc.setAuthor(metadata.author);
      if (metadata.subject) pdfDoc.setSubject(metadata.subject);
      if (metadata.keywords) {
        // Ensure keywords are in array format
        const keywordsArray = Array.isArray(metadata.keywords) 
          ? metadata.keywords 
          : metadata.keywords.split(',').map(k => k.trim());
        pdfDoc.setKeywords(keywordsArray);
      }
      if (metadata.creator) pdfDoc.setCreator(metadata.creator);
      if (metadata.producer) pdfDoc.setProducer(metadata.producer);
    }

    const editedPdf = await pdfDoc.save();
    fs.unlinkSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=edited.pdf");
    res.send(Buffer.from(editedPdf));
  } catch (err) {
    console.error("Basic Edit Error:", err);
    // Clean up the uploaded file in case of error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: "Basic edit failed", error: err.message });
  }
};

/* -------------------------------- EXPORTS -------------------------------- */
module.exports = {
  rotate,
  addWatermark,
  cropPdf,
  basicEditPdf,
};
