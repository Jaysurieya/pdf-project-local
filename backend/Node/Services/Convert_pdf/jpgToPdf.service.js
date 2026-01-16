const fs = require("fs");
const path = require("path");
const os = require("os");
const { PDFDocument } = require("pdf-lib");
const { v4: uuid } = require("uuid");
const sharp = require("sharp");

module.exports = async (imagePathOrPaths) => {
  // Handle both single path (string) and multiple paths (array)
  const imagePaths = Array.isArray(imagePathOrPaths)
    ? imagePathOrPaths
    : [imagePathOrPaths];

  // Validate input
  if (!imagePaths || imagePaths.length === 0) {
    throw new Error("No image paths provided");
  }

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Process each image and add as a separate page
  for (const imagePath of imagePaths) {
    // Validate file exists
    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️ Image not found, skipping: ${imagePath}`);
      continue;
    }

    try {
      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      
      // Get image format for logging purposes
      const metadata = await sharp(imageBuffer).metadata();
      
      // Normalize image using sharp to convert any format to JPEG
      let normalizedImageBuffer;
      try {
        normalizedImageBuffer = await sharp(imageBuffer)
          .jpeg({ quality: 90 }) // Convert everything to JPEG with good quality
          .toBuffer();
      } catch (normalizeErr) {
        console.error(`❌ Failed to normalize image ${imagePath}:`, normalizeErr.message);
        continue; // Skip this image and continue with others
      }

      // Embed the normalized JPEG into PDF
      const image = await pdfDoc.embedJpg(normalizedImageBuffer);

      // Create a new page with image dimensions
      const page = pdfDoc.addPage([image.width, image.height]);

      // Draw the image to fill the entire page
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height
      });

      console.log(`✅ Added page for: ${path.basename(imagePath)} (normalized from ${metadata.format})`);
    } catch (err) {
      console.error(`❌ Failed to process ${imagePath}:`, err.message);
      // Continue processing other images even if one fails
    }
  }

  // Check if at least one page was added
  const pageCount = pdfDoc.getPageCount();
  if (pageCount === 0) {
    throw new Error("No valid images were processed");
  }

  console.log(`📄 Created PDF with ${pageCount} page(s)`);

  // Save PDF to temporary location
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(os.tmpdir(), `${uuid()}.pdf`);
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
};
