const { execSync } = require("child_process");

/**
 * Returns true if PDF is scanned (image-based)
 */
module.exports = function isScannedPdf(pdfPath) {
  try {
    const output = execSync(`pdffonts "${pdfPath}"`, {
      windowsHide: true,  // THIS IS THE FIX - Hide the terminal window
      encoding: 'utf8'
    }).toString();
    
    const hasNoFonts = output.includes("no fonts") || output.trim().split('\n').length <= 2;
    console.log(`📄 PDF font detection: ${hasNoFonts ? 'No fonts (scanned)' : 'Has fonts (text-based)'}`);
    return hasNoFonts;
  } catch (err) {
    console.warn("⚠️ pdffonts failed, assuming scanned PDF:", err.message);
    // If pdffonts fails, assume scanned to be safe
    return true;
  }
};