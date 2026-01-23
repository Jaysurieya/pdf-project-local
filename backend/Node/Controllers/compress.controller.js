const { spawn } = require("child_process");

exports.compressPdfController = (req, res) => {
  try {
    const level = req.body.level; // low | medium | high
    const pdfBuffer = req.file.buffer;

    const qualityMap = {
      low: "/screen",
      medium: "/ebook",
      high: "/printer",
    };

    const quality = qualityMap[level] || "/ebook";

    // ✅ Detect OS-safe Ghostscript binary
    const gsCommand = process.platform === "win32" ? "gswin64c" : "gs";
    console.log("Using Ghostscript command:", gsCommand);
    const gs = spawn(gsCommand, [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      `-dPDFSETTINGS=${quality}`,
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      "-sOutputFile=-", // output to stdout
      "-",              // input from stdin
    ]);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=compressed.pdf"
    );

    // pipe compressed PDF to response
    gs.stdout.pipe(res);

    gs.stderr.on("data", (data) => {
      console.error("Ghostscript error:", data.toString());
    });

    gs.on("error", (err) => {
      console.error("GS spawn failed:", err);
      res.status(500).send("Compression failed");
    });

    // send PDF buffer to Ghostscript
    gs.stdin.write(pdfBuffer);
    gs.stdin.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF compression failed" });
  }
};
