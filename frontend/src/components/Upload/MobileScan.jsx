import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

function MobileScan() {
  const [stream, setStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadFinished, setUploadFinished] = useState(false);


  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  /* ---------------- CAMERA SETUP ---------------- */
  useEffect(() => {
    if (!sessionId) {
      alert("Session ID is required. Please scan the QR code again.");
      return;
    }

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" } // STRICT BACK CAMERA
          }
        });

        streamRef.current = mediaStream;
        setStream(mediaStream); // ✅ THIS WAS MISSING

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Back camera access failed:", error);
        alert(
          "Back camera not available or permission denied.\n" +
          "Please allow camera access."
        );
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [sessionId]);

  /* ---------------- CAPTURE IMAGE ---------------- */
  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File(
        [blob],
        `scan_${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      setCapturedImages(prev => [
        ...prev,
        {
          id: Date.now(),
          file,
          preview: URL.createObjectURL(blob)
        }
      ]);
    }, "image/jpeg");
  };

  /* ---------------- UPLOAD ---------------- */
  const uploadAllImages = async () => {
    if (capturedImages.length === 0) {
      alert("Please capture at least one image.");
      return;
    }

    setUploading(true);
    setUploadStatus("Uploading images...");
    stopCamera();

    try {
      // 1️⃣ Upload images
      for (let img of capturedImages) {
        const formData = new FormData();
        formData.append("image", img.file);
        formData.append("sessionId", sessionId);

        await fetch(
          `http://10.231.82.87:5000/api/scan/upload-image?sessionId=${sessionId}`,
          {
            method: "POST",
            body: formData
          }
        );
      }

      // 2️⃣ Tell backend to convert to PDF
      const finalizeResponse = await fetch("http://10.231.82.87:5000/api/scan/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      
      const finalizeResult = await finalizeResponse.json();
      
      if (finalizeResponse.ok) {
        setUploadStatus("✅ Images uploaded & PDF created!");
      } else {
        setUploadStatus(`❌ PDF creation failed: ${finalizeResult.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadFinished(true);
    }
  };



  /* ---------------- REMOVE IMAGE ---------------- */
  const removeImage = (id) => {
    setCapturedImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  /* ---------------- STOP CAMERA ---------------- */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  };


  // Handle redirect after upload is finished
  useEffect(() => {
    if (uploadFinished && uploadStatus.includes("PDF created")) {
      // Redirect to desktop view after a brief delay to allow PDF generation
      const timer = setTimeout(() => {
        window.location.href = `/scan-desktop?sessionId=${sessionId}`;
      }, 3000); // Increased delay to ensure PDF generation is complete
      
      return () => clearTimeout(timer);
    }
  }, [uploadFinished, uploadStatus, sessionId]);
  
  /* ---------------- UI ---------------- */
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid session.</p>
      </div>
    );
  }

  if (uploadFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg text-center max-w-sm w-full">
          <h2 className="text-2xl font-bold mb-4">Scan Status</h2>

          <p className="text-lg font-medium mb-6">
            {uploadStatus}
          </p>

          <p className="text-sm text-slate-500">
            {(uploadStatus.includes("PDF created")) ? "Redirecting to desktop view..." : "You can safely close this page."}
          </p>
        </div>
      </div>
    );
  }


  return (
    
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 text-slate-900 dark:text-white">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Mobile Scan</h1>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg">

          {/* CAMERA */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover rounded-xl border"
          />

          {/* CAPTURE */}
          <button
            onClick={captureImage}
            disabled={!stream}
            className={`w-full mt-4 py-3 rounded-xl font-bold ${
              !stream
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0061ff] text-white hover:bg-blue-700"
            }`}
          >
            Capture Image
          </button>

          {/* PREVIEW */}
          {capturedImages.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-3">
                Captured Images ({capturedImages.length})
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {capturedImages.map(img => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.preview}
                      className="h-20 w-full object-cover rounded"
                    />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* SEND */}
              <button
                onClick={uploadAllImages}
                disabled={uploading}
                className={`w-full mt-4 py-3 rounded-xl font-bold ${
                  uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}
              >
                {uploading ? "Uploading..." : "Send Images"}
              </button>

              {uploadStatus && (
                <p className="text-center mt-3 text-sm">{uploadStatus}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileScan;
