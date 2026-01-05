import { useParams } from "react-router-dom";
import { useState } from "react";
import { TOOLS } from "../../lib/tools";

function Upload() {
  const { tool } = useParams();
  const config = TOOLS[tool];

  if (!config) {
    return (
      <div className="tool-page min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Tool Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400">The requested tool "{tool}" does not exist.</p>
        </div>
      </div>
    );
  }

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Organize PDF states
  const [pagesInput, setPagesInput] = useState("");
  const [orderInput, setOrderInput] = useState("");

  // Tool behavior detection
  const needsPages =
    tool === "remove-pages" ||
    tool === "split-pdf";

  const needsOrder = tool === "organize-pdf";

  // ADD / APPEND FILES LOGIC
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (config.multiple) {
      // append files, avoid duplicates (name + size)
      setFiles((prev) => {
        const existing = new Map(
          prev.map((f) => [`${f.name}-${f.size}`, f])
        );

        selectedFiles.forEach((f) => {
          existing.set(`${f.name}-${f.size}`, f);
        });

        return Array.from(existing.values());
      });
    } else {
      setFiles(selectedFiles.slice(0, 1));
    }

    // reset input so same file can be re-added if needed
    e.target.value = "";
  };

  // REMOVE SINGLE FILE
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // MAIN PROCESS
  const handleProcess = async () => {
    if (files.length === 0) {
      alert("Please add file");
      return;
    }

    if (needsPages && !pagesInput.trim()) {
      alert("Please enter page numbers or range");
      return;
    }

    if (needsOrder && !orderInput.trim()) {
      alert("Please enter page order");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("tool", config.toolKey);

    // 👇 SAME VARIABLE, MULTIPLE FILES
    files.forEach((file) => {
      formData.append("files", file);
    });

    if (needsPages) {
      formData.append("pages", pagesInput);
    }

    if (needsOrder) {
      formData.append("order", orderInput);
    }

    try {
      const res = await fetch(
        `http://localhost:5000${config.backendRoute}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(`Processing failed with status ${res.status}`);
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      let filename = "result.pdf";
      switch (config.toolKey) {
        case "word_to_pdf":
        case "excel_to_pdf":
        case "powerpoint_to_pdf":
        case "jpg_to_pdf":
        case "html_to_pdf":
          filename = "converted.pdf";
          break;
        case "pdf_to_word":
          filename = "converted.docx";
          break;
        case "pdf_to_excel":
          filename = "converted.xlsx";
          break;
        case "pdf_to_jpg":
          filename = "converted.jpg";
          break;
        default:
          filename = "result.pdf";
      }

      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Processing error:", err);
      alert(`Processing failed: ${err.message || "Unknown error"}`);
    }

    setLoading(false);
  };

  return (
    <div className="tool-page min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 transition-colors">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-white">
          {config.title}
        </h1>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-lg transition-all">
          {/* FILE INPUT */}
          <div className="mb-8">
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-4">
              Select File(s)
            </label>

            <div className="flex gap-3 items-center">
              <input
                type="file"
                accept={config.accept}
                multiple={config.multiple}
                onChange={handleFileChange}
                className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              />

              {/* PLUS BUTTON */}
              {config.multiple && (
                <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  + Add more
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              Accepted formats:{" "}
              {config.accept.replace(/\./g, "").replace(/,/g, ", ")}
            </p>
          </div>

          {/* PAGE INPUT */}
          {needsPages && (
            <div className="mb-8">
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-4">
                Enter pages or range
              </label>
              <input
                type="text"
                placeholder="e.g. 1,3,5 or 1-4"
                value={pagesInput}
                onChange={(e) => setPagesInput(e.target.value)}
                className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              />
            </div>
          )}

          {/* ORDER INPUT */}
          {needsOrder && (
            <div className="mb-8">
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-4">
                Enter new page order
              </label>
              <input
                type="text"
                placeholder="e.g. 3,1,4,2"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              />
            </div>
          )}

          {/* FILE LIST */}
          {files.length > 0 && (
            <div className="mb-8">
              <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-4">Selected Files:</h3>
              <ul className="space-y-3">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700"
                  >
                    <span>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PROCESS BUTTON */}
          <div className="flex justify-center">
            <button
              onClick={handleProcess}
              disabled={loading || files.length === 0}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                loading || files.length === 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500"
                  : "bg-[#0061ff] text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Processing..." : "Process"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;