import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { TOOLS } from "../../lib/tools";
import CompareResult from "./compareResults";
import SignatureCanvasBox from "./SignaturePad";
import PdfPreview from "./PdfPreview";
import RedactPdfPreview from "./RedactPreview";

function Upload() {
  const { tool } = useParams();
  const config = TOOLS[tool];

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Tool Not Found
      </div>
    );
  }

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [activeRect, setActiveRect] = useState(null);


  // 🔥 SIGN PDF STATES
  const [signatureData, setSignatureData] = useState(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [placements, setPlacements] = useState([]);

  // Debug (keep this one only)
  useEffect(() => {
    console.log("Current placements:", placements);
  }, [placements]);

  // =========================
  // File selection
  // =========================
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setSelectedPage(0);
    setPlacements([]);
    setSignatureData(null);
  };

  // =========================
  // SIGN PDF HANDLER (FINAL)
  // =========================
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

      if (!res.ok) throw new Error("Signing failed");

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

  // =========================
  // OTHER TOOLS HANDLER
  // =========================
  const handleProcess = async () => {
    if (files.length === 0) {
      alert("Please add file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("tool", config.toolKey);

    if (password) formData.append("password", password);
    files.forEach((f) => formData.append("files", f));

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
      a.download = "result.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{config.title}</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
          {/* FILE INPUT */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select PDF File
            </label>
            <div className="relative">
              <input
                type="file"
                accept={config.accept}
                onChange={handleFileChange}
                className="w-full hidden"
                id="file-upload-temp"
              />
              <label 
                htmlFor="file-upload-temp"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {config.accept.replace(/\./g, '').toUpperCase()} files only
                  </p>
                </div>
              </label>
            </div>
          </div>
          
          {config.toolKey === "protect_pdf" && (
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password:</label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter password to protect PDF"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
              </div>
            </div>
          )}
          {config.toolKey === "unlock_pdf" && (
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password:</label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter password to unlock PDF"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
              </div>
            </div>
          )}
          
          {/* SIGN PDF UI */}
          {config.toolKey === "sign_pdf" && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Create Signature:</label>
                <SignatureCanvasBox onSave={setSignatureData} />
              </div>

              {files[0] && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview & Place Signature:</label>
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

          {config.toolKey === "redact_pdf" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Redact PDF Content:</label>
              <RedactPdfPreview
                file={files[0]}
              />
            </div>
          )}

          {/* PROCESS BUTTON */}
          <div className="mt-6 text-center">
            <button
              onClick={config.toolKey === "sign_pdf" ? handleSign : handleProcess}
              disabled={loading}
              className={`px-6 py-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center mx-auto ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Process
                </>
              )}
            </button>
          </div>

          {/* COMPARE RESULT */}
          {config.toolKey === "compare_pdf" && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comparison Result:</label>
              <CompareResult />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Upload;