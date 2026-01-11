import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const ScanToPdf = () => {
  const [sessionInfo, setSessionInfo] = useState<{
    sessionId?: string;
    mobileUrl?: string;
    desktopUrl?: string;
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfReady, setPdfReady] = useState<boolean>(false);
  
  // STEP 1: Create session when page loads
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch('http://10.231.82.87:5000/api/scan/create-session', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to create session');
        }
        
        const data = await response.json();
        setSessionInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    createSession();
  }, []);
  
  // STEP 2: Poll for PDF status
  useEffect(() => {
    if (!sessionInfo.sessionId) return;
    
    const pollStatus = async () => {
      try {
        const response = await fetch(`http://10.231.82.87:5000/api/scan/session-status?sessionId=${sessionInfo.sessionId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.pdfReady) {
            setPdfReady(true);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };
    
    const interval = setInterval(pollStatus, 2000); // Poll every 2 seconds
    
    return () => clearInterval(interval);
  }, [sessionInfo.sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Creating scan session...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionInfo.sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">Error</h2>
          <p className="mb-4">{error || 'Failed to create scan session'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show PDF ready state when PDF is generated
  if (pdfReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6">
        <h1 className="text-3xl font-bold mb-4">Scan to PDF</h1>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4">PDF Ready!</h2>
          
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Your scanned document has been converted to PDF.
          </p>
          
          <button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = `http://10.231.82.87:5000/api/scan/download?sessionId=${sessionInfo.sessionId}`;
              link.download = 'scan.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors mb-6"
          >
            Download PDF
          </button>
          
          {/* Show desktop QR code after PDF is ready */}
          <div className="mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Or scan this QR code on your desktop:</p>
            <div className="bg-white p-4 rounded-xl shadow-inner inline-block">
              <QRCodeCanvas value={sessionInfo.desktopUrl || ''} size={180} />
            </div>
            <p className="text-center mt-3 font-medium text-green-600">Desktop View</p>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visit desktop view to see image previews.
          </p>
        </div>
      </div>
    );
  }

  // Show QR codes while waiting for PDF generation
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      
      <h1 className="text-3xl font-bold mb-4">Scan to PDF</h1>

      <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">
        Scan this QR code using your phone to start scanning documents
      </p>

      {/* STEP 3: QR CODE for MOBILE - ONLY MOBILE QR SHOWN INITIALLY */}
      <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
        <QRCodeCanvas value={sessionInfo.mobileUrl || ''} size={260} />
        <p className="text-center mt-4 font-medium text-blue-600">Mobile Scanning</p>
        <p className="text-center text-sm text-slate-500 mt-1">Scan with your phone camera</p>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 max-w-md mb-6">
        <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">How to use:</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>Scan QR code with your phone's camera</li>
          <li>Capture and upload your documents</li>
          <li>Return here to download your PDF</li>
        </ol>
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center italic">
        Keep this page open while scanning.
      </p>
    </div>
  );
};

export default ScanToPdf;
