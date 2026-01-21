import { useState, useEffect } from "react";
import { Copy, Download, Eye, FileText } from "lucide-react";

const OcrPdf = ({ file, onBack }) => {
  const [ocrData, setOcrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("full-text"); // "full-text" or "by-page"

  useEffect(() => {
    if (file) {
      handleOcrProcessing();
    }
  }, [file]);

  const handleOcrProcessing = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/optimize/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "OCR processing failed");
      }

      const data = await response.json();
      setOcrData(data);
    } catch (err) {
      console.error("OCR Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (text, filename = "extracted-text.txt") => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B1220] p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Performing OCR on your PDF...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            This may take a few moments depending on the document size.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B1220] p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
            OCR Failed
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-6">
            {error}
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (ocrData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B1220] p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tools
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => copyToClipboard(ocrData.fullText)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy All
              </button>
              <button
                onClick={() => downloadText(ocrData.fullText)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {ocrData.totalPages}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Pages Processed</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {ocrData.fullText.split(/\s+/).filter(Boolean).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Words Extracted</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {ocrData.fullText.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Characters</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab("full-text")}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "full-text"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Full Text
            </button>
            <button
              onClick={() => setActiveTab("by-page")}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "by-page"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              By Page
            </button>
          </div>

          {/* Content */}
          {activeTab === "full-text" && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Extracted Text
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(ocrData.fullText)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadText(ocrData.fullText, "extracted-text.txt")}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">
                  {ocrData.fullText || "No text extracted from the PDF."}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "by-page" && (
            <div className="space-y-6">
              {ocrData.pages.map((page, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Page {page.page}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(page.text)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </button>
                      <button
                        onClick={() => downloadText(page.text, `page-${page.page}-text.txt`)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 max-h-80 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">
                      {page.text || "No text extracted from this page."}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default OcrPdf;