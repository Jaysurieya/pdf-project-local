import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { TOOLS } from "../../lib/tools";
import SignatureCanvasBox from "./SignaturePad";
import PdfPreview from "./PdfPreview";

function Upload() {
  const { tool } = useParams();
  const config = TOOLS[tool];

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B1220] text-slate-900 dark:text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Tool Not Found</h1>
          <p>The requested tool does not exist.</p>
        </div>
      </div>
    );
  }

  /* -------------------- STATES -------------------- */
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Password for protect/unlock
  const [password, setPassword] = useState("");

  // Sign PDF
  const [signatureData, setSignatureData] = useState(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [placements, setPlacements] = useState([]);

  const [pagesInput, setPagesInput] = useState("");
  const [orderInput, setOrderInput] = useState("");

  // Rotation
  const [rotationAngle, setRotationAngle] = useState(90);

  const [selectedOption, setSelectedOption] = useState(
    config.options?.[0]?.value || ""
  );

  // Watermark
  const [watermarkText, setWatermarkText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [opacity, setOpacity] = useState(0.5);
  const [color, setColor] = useState("gray");
  const [position, setPosition] = useState("center");

  // Crop
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);

  // Edit
  const [editType, setEditType] = useState("metadata");
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [textYPosition, setTextYPosition] = useState(100);

  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
  });

  /* -------------------- TOOL FLAGS -------------------- */
  const needsPages = tool === "remove-pages" || tool === "split-pdf";
  const needsOrder = tool === "organize-pdf";
  const needsRotate = tool === "rotate-pdf";
  const needsWatermark = tool === "add-watermark";
  const needsCrop = tool === "crop-pdf";
  const needsEdit = tool === "edit-pdf";
  const hasOptions = config.hasOptions;

  // Debug placements
  useEffect(() => {
    console.log("Current placements:", placements);
  }, [placements]);

  /* -------------------- FILE HANDLING -------------------- */
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);

    if (config.multiple) {
      setFiles((prev) => {
        const map = new Map(prev.map(f => [`${f.name}-${f.size}`, f]));
        selected.forEach(f => map.set(`${f.name}-${f.size}`, f));
        return Array.from(map.values());
      });
    } else {
      setFiles(selected.slice(0, 1));
    }

    // Reset signature-related states when new file is uploaded
    if (config.toolKey === "sign_pdf") {
      setSelectedPage(0);
      setPlacements([]);
      setSignatureData(null);
    }

    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* -------------------- SIGN PDF HANDLER -------------------- */
  const handleSign = async () => {
    // ✅ FILTER VALID PLACEMENTS
    const validPlacements = placements.filter(
      (p) =>
        typeof p.page === "number" &&
        typeof p.xPercent === "number" &&
        typeof p.yPercent === "number" &&
        !isNaN(p.xPercent) &&
        !isNaN(p.yPercent)
    );

    console.log("PLACEMENTS SENT TO BACKEND:", validPlacements);

    if (!files[0] || !signatureData || validPlacements.length === 0) {
      alert("Please upload PDF and place the signature on at least one page");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", files[0]);
      formData.append("signatureBase64", signatureData);
      formData.append("placements", JSON.stringify(validPlacements));

      const res = await fetch("http://localhost:5000/api/security/sign", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(await res.text() || "Signing failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "signed.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to sign PDF");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- PROCESS -------------------- */
  const handleProcess = async () => {
    if (!files.length) return alert("Please add a file");

    if (needsPages && !pagesInput.trim())
      return alert("Please enter page numbers");

    if (needsOrder && !orderInput.trim())
      return alert("Please enter page order");

    if (needsWatermark && !watermarkText.trim())
      return alert("Please enter watermark text");

    if (needsCrop && files.length > 1)
      return alert("Crop supports only single-page PDFs");

    setLoading(true);

    const formData = new FormData();
    formData.append("tool", config.toolKey);
    files.forEach(f => formData.append("files", f));

    if (needsPages) formData.append("pages", pagesInput);
    if (needsOrder) formData.append("order", orderInput);
    if (needsRotate) formData.append("rotation", rotationAngle);
    if (hasOptions) formData.append("option", selectedOption);

    if (needsWatermark) {
      formData.append("watermarkText", watermarkText);
      formData.append("fontSize", fontSize);
      formData.append("opacity", opacity);
      formData.append("color", color);
      formData.append("position", position);
    }

    if (needsCrop) {
      formData.append("cropLeft", cropLeft);
      formData.append("cropRight", cropRight);
      formData.append("cropTop", cropTop);
      formData.append("cropBottom", cropBottom);
    }

    if (needsEdit) {
      formData.append("editType", editType);
      if (editType === "metadata") {
        formData.append("metadata", JSON.stringify(metadata));
      } else {
        formData.append("searchText", searchText);
        formData.append("replaceText", replaceText);
        formData.append("textY", textYPosition);
      }
    }

    // Handle password for protect/unlock PDF
    if (config.toolKey === "protect_pdf" || config.toolKey === "unlock_pdf") {
      if (!password.trim()) {
        alert("Please enter a password");
        setLoading(false);
        return;
      }
      formData.append("password", password);
    }

    try {
      const res = await fetch(
        `http://localhost:5000${config.backendRoute}`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Processing failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = config.downloadName || "result.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1220] p-6 text-slate-900 dark:text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">{config.title}</h1>

        <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 shadow-lg">
          <input
            type="file"
            accept={config.accept}
            multiple={config.multiple}
            onChange={handleFileChange}
            className="w-full p-4 rounded-2xl border mb-6"
          />

          {config.toolKey === "protect_pdf" && (
            <div className="mb-6">
              <label htmlFor="password" className="block mb-2">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-2xl border"
                placeholder="Enter password to protect PDF"
              />
            </div>
          )}
          {config.toolKey === "unlock_pdf" && (
            <div className="mb-6">
              <label htmlFor="password" className="block mb-2">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-2xl border"
                placeholder="Enter password to unlock PDF"
              />
            </div>
          )}

          {/* SIGN PDF UI */}
          {config.toolKey === "sign_pdf" && (
            <>
              <div className="mb-6">
                <SignatureCanvasBox onSave={setSignatureData} />
              </div>

              {files[0] && (
                <div className="mb-6">
                  <PdfPreview
                    file={files[0]}
                    selectedPage={selectedPage}
                    setSelectedPage={setSelectedPage}
                    signatureData={signatureData}
                    placements={placements}
                    onPlacement={(p) => {
                      setPlacements((prev) => {
                        // ✅ ensure one placement per page
                        const rest = prev.filter((x) => x.page !== p.page);
                        return [...rest, p];
                      });
                    }}
                  />
                </div>
              )}
            </>
          )}

          {hasOptions && (
            <select
              value={selectedOption}
              onChange={e => setSelectedOption(e.target.value)}
              className="w-full p-4 rounded-2xl border mb-6"
            >
              {config.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {needsPages && (
            <input
              placeholder="1,3,5 or 1-4"
              value={pagesInput}
              onChange={e => setPagesInput(e.target.value)}
              className="w-full p-4 rounded-2xl border mb-6"
            />
          )}

          {needsOrder && (
            <input
              placeholder="3,1,4,2"
              value={orderInput}
              onChange={e => setOrderInput(e.target.value)}
              className="w-full p-4 rounded-2xl border mb-6"
            />
          )}

          {needsRotate && (
            <div className="mb-6">
              <label className="block mb-2">Rotation Angle:</label>
              <select
                value={rotationAngle}
                onChange={e => setRotationAngle(Number(e.target.value))}
                className="w-full p-4 rounded-2xl border"
              >
                <option value={90}>90° Clockwise</option>
                <option value={180}>180°</option>
                <option value={270}>90° Counterclockwise</option>
                <option value={0}>Reset Rotation</option>
              </select>
            </div>
          )}

          {needsWatermark && (
            <div className="mb-6">
              <input
                placeholder="Watermark text"
                value={watermarkText}
                onChange={e => setWatermarkText(e.target.value)}
                className="w-full p-4 rounded-2xl border mb-4"
              />
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Font Size:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full p-4 rounded-2xl border"
                  />
                </div>
                <div>
                  <label className="block mb-2">Opacity:</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={e => setOpacity(Number(e.target.value))}
                    className="w-full p-4 rounded-2xl border"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Color:</label>
                  <select
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-full p-4 rounded-2xl border"
                  >
                    <option value="black">Black</option>
                    <option value="white">White</option>
                    <option value="gray">Gray</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Position:</label>
                  <select
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full p-4 rounded-2xl border"
                  >
                    <option value="center">Center</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="repeat">Repeat</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {needsCrop && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block mb-2">Crop Left (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cropLeft}
                  onChange={e => setCropLeft(Number(e.target.value))}
                  className="w-full p-4 rounded-2xl border"
                  placeholder="Left margin"
                />
              </div>
              <div>
                <label className="block mb-2">Crop Right (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cropRight}
                  onChange={e => setCropRight(Number(e.target.value))}
                  className="w-full p-4 rounded-2xl border"
                  placeholder="Right margin"
                />
              </div>
              <div>
                <label className="block mb-2">Crop Top (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cropTop}
                  onChange={e => setCropTop(Number(e.target.value))}
                  className="w-full p-4 rounded-2xl border"
                  placeholder="Top margin"
                />
              </div>
              <div>
                <label className="block mb-2">Crop Bottom (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cropBottom}
                  onChange={e => setCropBottom(Number(e.target.value))}
                  className="w-full p-4 rounded-2xl border"
                  placeholder="Bottom margin"
                />
              </div>
            </div>
          )}

          {needsEdit && (
            <div className="mb-6">
              <label className="block mb-2">Edit Type:</label>
              <select
                value={editType}
                onChange={e => setEditType(e.target.value)}
                className="w-full p-4 rounded-2xl border mb-4"
              >
                <option value="metadata">Edit Metadata</option>
                <option value="text-replace">Replace Text</option>
              </select>
              
              {editType === "metadata" ? (
                <div className="space-y-4">
                  <input
                    placeholder="Title"
                    value={metadata.title}
                    onChange={e => setMetadata({...metadata, title: e.target.value})}
                    className="w-full p-4 rounded-2xl border"
                  />
                  <input
                    placeholder="Author"
                    value={metadata.author}
                    onChange={e => setMetadata({...metadata, author: e.target.value})}
                    className="w-full p-4 rounded-2xl border"
                  />
                  <input
                    placeholder="Subject"
                    value={metadata.subject}
                    onChange={e => setMetadata({...metadata, subject: e.target.value})}
                    className="w-full p-4 rounded-2xl border"
                  />
                  <input
                    placeholder="Keywords"
                    value={metadata.keywords}
                    onChange={e => setMetadata({...metadata, keywords: e.target.value})}
                    className="w-full p-4 rounded-2xl border"
                  />
                  <input
                    placeholder="Creator"
                    value={metadata.creator}
                    onChange={e => setMetadata({...metadata, creator: e.target.value})}
                    className="w-full p-4 rounded-2xl border"
                  />
                  <input
                    placeholder="Producer"
                    value={metadata.producer}
                    onChange={e => setMetadata({...metadata, producer: e.target.value})}
                    className="w-full p-4 rounded-2xl border"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    placeholder="Search Text"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="w-full p-4 rounded-2xl border"
                  />
                  <input
                    placeholder="Replace Text"
                    value={replaceText}
                    onChange={e => setReplaceText(e.target.value)}
                    className="w-full p-4 rounded-2xl border"
                  />
                  <div>
                    <label className="block mb-2">Y Position:</label>
                    <input
                      type="number"
                      value={textYPosition}
                      onChange={e => setTextYPosition(Number(e.target.value))}
                      className="w-full p-4 rounded-2xl border"
                      placeholder="Y coordinate for new text"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {files.map((f, i) => (
            <div key={i} className="flex justify-between mb-2 text-sm">
              <span>{f.name}</span>
              <button onClick={() => removeFile(i)} className="text-red-500">
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={config.toolKey === "sign_pdf" ? handleSign : handleProcess}
            disabled={loading}
            className="w-full mt-6 py-4 bg-[#0061ff] text-white font-bold rounded-2xl"
          >
            {loading ? "Processing..." : "Process"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Upload;

