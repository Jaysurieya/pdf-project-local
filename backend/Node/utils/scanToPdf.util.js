// const fs = require("fs");
// const path = require("path");
// const PDFDocument = require("pdfkit");

// exports.createPdfFromImages = (sessionDir) => {
//   return new Promise((resolve, reject) => {
//     const images = fs
//       .readdirSync(sessionDir)
//       .filter(f => f.endsWith(".jpg"))
//       .sort();

//     if (images.length === 0) {
//       return reject("No images found");
//     }

//     const pdfPath = path.join(sessionDir, "final.pdf");
//     const doc = new PDFDocument({ autoFirstPage: false });

//     doc.pipe(fs.createWriteStream(pdfPath));

//     images.forEach(img => {
//       const imgPath = path.join(sessionDir, img);
//       const image = doc.openImage(imgPath);

//       doc.addPage({ size: [image.width, image.height] });
//       doc.image(imgPath, 0, 0);
//     });

//     doc.end();

//     doc.on("finish", () => resolve(pdfPath));
//     doc.on("error", reject);
//   });
// };


const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

exports.createPdfFromImages = (sessionDir) => {
  return new Promise((resolve, reject) => {
    // Check if directory exists
    if (!fs.existsSync(sessionDir)) {
      return reject("Session directory does not exist");
    }
    
    const images = fs
      .readdirSync(sessionDir)
      .filter(f => f.toLowerCase().endsWith(".jpg") || f.toLowerCase().endsWith(".jpeg") || f.toLowerCase().endsWith(".png"))
      .sort();

    if (images.length === 0) {
      return reject("No images found in session directory");
    }

    const pdfPath = path.join(sessionDir, "final.pdf");
    const doc = new PDFDocument({ autoFirstPage: false });

    doc.pipe(fs.createWriteStream(pdfPath));

    images.forEach(img => {
      const imgPath = path.join(sessionDir, img);
      const image = doc.openImage(imgPath);

      doc.addPage({ size: [image.width, image.height] });
      doc.image(imgPath, 0, 0);
    });

    doc.end();

    doc.on("finish", () => resolve(pdfPath));
    doc.on("error", reject);
  });
};