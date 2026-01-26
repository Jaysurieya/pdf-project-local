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
    const fontFamily = req.body.fontFamily || "Helvetica-Bold"; // Font family option
    const diagonal = req.body.diagonal === true || req.body.diagonal === 'true'; // Diagonal option
    const repeat = req.body.repeat === true || req.body.repeat === 'true'; // Repeat option
    const repeatCount = parseInt(req.body.repeatCount) || 5; // Number of times to repeat (default 5)
    
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(fontFamily);

    let textColor;
    switch (color) {
      case "red": textColor = rgb(1, 0, 0); break;
      case "blue": textColor = rgb(0, 0, 1); break;
      case "green": textColor = rgb(0, 0.5, 0); break;
      case "black": textColor = rgb(0, 0, 0); break;
      case "white": textColor = rgb(1, 1, 1); break;
      case "yellow": textColor = rgb(1, 1, 0); break;
      case "purple": textColor = rgb(0.5, 0, 0.5); break;
      case "orange": textColor = rgb(1, 0.65, 0); break;
      default: textColor = rgb(0.5, 0.5, 0.5);
    }

    const pages = pdfDoc.getPages();

    pages.forEach(page => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      
      // Calculate diagonal text dimensions if needed
      let diagonalTextWidth = textWidth;
      let diagonalTextHeight = fontSize;
      if (diagonal) {
        // Approximate diagonal dimensions for rotated text
        diagonalTextWidth = Math.sqrt(textWidth * textWidth + fontSize * fontSize);
        diagonalTextHeight = diagonalTextWidth;
      }

      // Handle different position and repetition scenarios
      if (repeat) {
        // Calculate appropriate spacing based on repeatCount
        const rows = Math.ceil(Math.sqrt(repeatCount));
        const cols = Math.ceil(repeatCount / rows);
        
        const spacingX = width / cols;
        const spacingY = height / rows;
        
        let drawnCount = 0;
        for (let row = 0; row < rows && drawnCount < repeatCount; row++) {
          for (let col = 0; col < cols && drawnCount < repeatCount; col++) {
            if (drawnCount >= repeatCount) break;
            
            const x_pos = col * spacingX + spacingX / 4; // Add some offset from edges
            const y_pos = height - (row * spacingY + spacingY / 2); // Adjust for PDF coordinate system
            
            let options = {
              x: x_pos,
              y: y_pos,
              size: fontSize,
              font,
              color: textColor,
              opacity,
            };
            
            if (diagonal) {
              options.rotate = degrees(-45);
            }
            
            page.drawText(watermarkText, options);
            drawnCount++;
          }
        }
      } else if (diagonal) {
        // Draw single diagonal watermark
        page.drawText(watermarkText, {
          x: width / 2 - diagonalTextWidth / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: textColor,
          opacity,
          rotate: degrees(-45),
        });
      } else {
        // Standard position handling
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
      }
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
// const cropPdf = async (req, res) => {
//   try {
//     // Validate that only one file was uploaded
//     if (!req.file) {
//       return res.status(400).json({
//         message: "No file uploaded",
//       });
//     }
    
//     const filePath = req.file.path;

//     const left = parseFloat(req.body.cropLeft) || parseFloat(req.body.left) || 0;
//     const right = parseFloat(req.body.cropRight) || parseFloat(req.body.right) || 0;
//     const top = parseFloat(req.body.cropTop) || parseFloat(req.body.top) || 0;
//     const bottom = parseFloat(req.body.cropBottom) || parseFloat(req.body.bottom) || 0;

//     const pdfBytes = fs.readFileSync(filePath);
//     const pdfDoc = await PDFDocument.load(pdfBytes);

//     const pages = pdfDoc.getPages();
//     if (pages.length !== 1) {
//       return res.status(400).json({
//         message: "Crop supports only single-page PDFs",
//       });
//     }

//     const page = pages[0];
//     const { width, height } = page.getSize();

//     const newWidth = width * (1 - (left + right) / 100);
//     const newHeight = height * (1 - (top + bottom) / 100);

//     const embedded = await pdfDoc.embedPage(page, {
//       left: (left / 100) * width,
//       right: width - (right / 100) * width,
//       top: height - (top / 100) * height,
//       bottom: (bottom / 100) * height,
//     });

//     pdfDoc.removePage(0);
//     const newPage = pdfDoc.addPage([newWidth, newHeight]);

//     newPage.drawPage(embedded, {
//       x: 0,
//       y: 0,
//       width: newWidth,
//       height: newHeight,
//     });

//     const croppedPdf = await pdfDoc.save();
//     fs.unlinkSync(filePath);

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", "attachment; filename=cropped.pdf");
//     res.send(Buffer.from(croppedPdf));
//   } catch (err) {
//     console.error("Crop PDF Error:", err);
//     // Clean up the uploaded file in case of error
//     if (filePath && fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//     res.status(500).json({ message: "Crop PDF failed", error: err.message });
//   }
// };

/* ---------------------------------- CROP PDF (MULTI PAGE SUPPORT) --------------------------------- */
const cropPdf = async (req, res) => {
  let filePath; // ✅ define here so catch can access

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    filePath = req.file.path;

    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    if (!pages || pages.length === 0) {
      return res.status(400).json({ message: "PDF has no pages" });
    }

    // ✅ Mode selector: "all" | "page"
    // default = all
    const cropMode = (req.body.cropMode || "all").toLowerCase();

    // ✅ Option A: SAME crop for all pages
    const globalCrop = {
      left: parseFloat(req.body.cropLeft) || parseFloat(req.body.left) || 0,
      right: parseFloat(req.body.cropRight) || parseFloat(req.body.right) || 0,
      top: parseFloat(req.body.cropTop) || parseFloat(req.body.top) || 0,
      bottom: parseFloat(req.body.cropBottom) || parseFloat(req.body.bottom) || 0,
    };

    // ✅ Option B: Page-by-page crop configs
    // expects JSON string:
    // [
    //   {"page":1,"left":10,"right":10,"top":5,"bottom":5},
    //   {"page":2,"left":0,"right":0,"top":10,"bottom":0}
    // ]
    let perPageCrop = [];
    if (req.body.perPageCrop) {
      try {
        perPageCrop = JSON.parse(req.body.perPageCrop);
      } catch (err) {
        return res.status(400).json({
          message: "Invalid perPageCrop JSON format",
        });
      }
    }

    // ✅ helper function to pick crop for each page
    const getCropForPage = (pageIndex) => {
      if (cropMode === "page") {
        const pageNumber = pageIndex + 1; // 1-based for frontend
        const cfg = perPageCrop.find((p) => p.page === pageNumber);

        if (cfg) {
          return {
            left: parseFloat(cfg.left || 0),
            right: parseFloat(cfg.right || 0),
            top: parseFloat(cfg.top || 0),
            bottom: parseFloat(cfg.bottom || 0),
          };
        }
        // if no config given for this page -> no crop
        return { left: 0, right: 0, top: 0, bottom: 0 };
      }

      // default mode = apply same crop to all pages
      return globalCrop;
    };

    // ✅ create a new PDF
    const newPdfDoc = await PDFDocument.create();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      const crop = getCropForPage(i);

      const leftPx = (crop.left / 100) * width;
      const rightPx = (crop.right / 100) * width;
      const topPx = (crop.top / 100) * height;
      const bottomPx = (crop.bottom / 100) * height;

      const newWidth = width - leftPx - rightPx;
      const newHeight = height - topPx - bottomPx;

      if (newWidth <= 0 || newHeight <= 0) {
        return res.status(400).json({
          message: `Invalid crop values for page ${i + 1}: results in negative/zero size`,
        });
      }

      // ✅ embed the old page with clipping
      const embeddedPage = await newPdfDoc.embedPage(page, {
        left: leftPx,
        right: width - rightPx,
        top: height - topPx,
        bottom: bottomPx,
      });

      const newPage = newPdfDoc.addPage([newWidth, newHeight]);

      newPage.drawPage(embeddedPage, {
        x: 0,
        y: 0,
        width: newWidth,
        height: newHeight,
      });
    }

    const croppedPdf = await newPdfDoc.save();

    // delete uploaded file
    fs.unlinkSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=cropped.pdf");
    res.send(Buffer.from(croppedPdf));
  } catch (err) {
    console.error("Crop PDF Error:", err);

    // ✅ cleanup
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
