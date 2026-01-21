const express = require("express");
const cors = require("cors");
const path = require("path");
const organizeRoutes = require("./Routes/organize.routes");
const convertRoutes = require("./Routes/convert.routes");
const scanRoutes = require("./Routes/scan.routes");
const editRoutes = require("./Routes/edit.routes");
const securityRoutes = require("./Routes/security.routes");
const optimizeRoutes = require("./Routes/optimize.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/files", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/convert", convertRoutes);
app.use("/api/organize", organizeRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/edit", editRoutes);
app.use("/api/security",securityRoutes);
app.use("/api/optimize", optimizeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
