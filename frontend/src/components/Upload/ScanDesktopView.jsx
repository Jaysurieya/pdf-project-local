import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function ScanDesktopView() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  
  const [sessionData, setSessionData] = useState({
    images: [],
    pdfReady: false,
    pdfUrl: null
  });
  const [statusMessage, setStatusMessage] = useState("Waiting for scan...");
  const [isLoading, setIsLoading] = useState(true);

  // Poll for session status updates
  useEffect(() => {
    if (!sessionId) {
      setStatusMessage("No session ID provided. Please access via QR code.");
      setIsLoading(false);
      return;
    }

    const fetchSessionStatus = async () => {
      try {
        const response = await fetch(
          `http://10.231.82.87:5000/api/scan/session-status?sessionId=${sessionId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSessionData(data);
          
          if (data.images.length === 0) {
            setStatusMessage("Waiting for images to be uploaded...");
          } else if (data.pdfReady) {
            setStatusMessage("PDF is ready for download!");
          } else {
            setStatusMessage(`Processing... ${data.images.length} image(s) uploaded`);
          }
        } else {
          const error = await response.json();
          setStatusMessage(`Error: ${error.error || "Failed to fetch status"}`);
        }
      } catch (error) {
        setStatusMessage(`Connection error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchSessionStatus();

    // Set up polling interval (every 2 seconds)
    const interval = setInterval(fetchSessionStatus, 2000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleDownloadPdf = () => {
    if (sessionData.pdfUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = `http://10.231.82.87:5000${sessionData.pdfUrl}`;
      link.download = 'scan.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Session Error</h1>
          <p className="text-slate-600 dark:text-slate-400">No session ID provided. Please access via QR code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 text-slate-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Scan Session Dashboard</h1>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Session: {sessionId.substring(0, 8)}...</h2>
            <span className={`px-3 py-1 rounded-full text-sm ${
              isLoading ? 'bg-yellow-100 text-yellow-800' : 
              sessionData.pdfReady ? 'bg-green-100 text-green-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {isLoading ? 'Loading...' : sessionData.pdfReady ? 'Complete' : 'Active'}
            </span>
          </div>
          
          <div className="text-center py-4">
            <p className="text-lg">{statusMessage}</p>
          </div>
        </div>

        {/* Image Previews */}
        {sessionData.images.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="text-xl font-bold mb-4">
              Uploaded Images ({sessionData.images.length})
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sessionData.images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Scanned ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Download Section */}
        {sessionData.pdfReady && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">PDF Ready!</h3>
            <div className="flex justify-center">
              <button
                onClick={handleDownloadPdf}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}

        {!sessionData.pdfReady && sessionData.images.length === 0 && !isLoading && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Waiting for images to be uploaded from the mobile device...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanDesktopView;