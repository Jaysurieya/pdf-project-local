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

      const gs = spawn("gswin64c", [
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        `-dPDFSETTINGS=${quality}`,
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        "-sOutputFile=-", // stdout
        "-",              // stdin
      ]);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=compressed.pdf"
      );

      gs.stdout.pipe(res);

      gs.stderr.on("data", (data) => {
        console.error("GS error:", data.toString());
      });

      gs.on("error", () => {
        res.status(500).send("Compression failed");
      });

      // send pdf buffer to ghostscript
      gs.stdin.write(pdfBuffer);
      gs.stdin.end();

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "PDF compression failed" });
    }
  };
