


// import { useEffect, useRef, useState } from "react";
// import * as fabric from "fabric";
// import { PDFDocument } from "pdf-lib";
// import pdfjsLib from "../../lib/pdf.js"; // ✅ you already have this working

// const DEFAULT_SCALE = 1.5;

// export default function EditPdfEditor() {
//   const [file, setFile] = useState(null);
//   const [locked, setLocked] = useState(false);

//   // preview pages as images
//   const [pages, setPages] = useState([]); // [{pageNumber, dataUrl, width, height}]
//   const [activePage, setActivePage] = useState(1); // 1-based
//   const [loadingPdf, setLoadingPdf] = useState(false);

//   // tools
//   const [tool, setTool] = useState("select"); // select | draw | highlight
//   const [fontSize, setFontSize] = useState(18);
//   const [penSize, setPenSize] = useState(3);

//   // export
//   const [exporting, setExporting] = useState(false);

//   // refs
//   const pageImgRef = useRef(null);
//   const overlayWrapRef = useRef(null);

//   // fabric per page
//   const fabricRef = useRef({}); // {pageNumber: fabricCanvas}
//   const pageStatesRef = useRef({}); // {pageNumber: fabricJson}
//   const historyRef = useRef({}); // {pageNumber: {undo:[], redo:[]}}

//   const highlightColor = "rgba(255,255,0,0.35)";

//   // ---------------- FILE UPLOAD ----------------
//   const handleFileChange = (e) => {
//     const f = e.target.files?.[0];
//     if (!f) return;

//     setFile(f);
//     setPages([]);
//     setActivePage(1);

//     // clear all previous states
//     pageStatesRef.current = {};
//     historyRef.current = {};

//     // dispose old fabric canvases
//     Object.values(fabricRef.current).forEach((c) => c?.dispose?.());
//     fabricRef.current = {};
//   };

//   // ---------------- LOAD PDF INTO IMAGE PAGES ----------------
//   useEffect(() => {
//     if (!file) return;

//     const loadPdf = async () => {
//       setLoadingPdf(true);

//       try {
//         const reader = new FileReader();

//         reader.onload = async () => {
//           const pdf = await pdfjsLib
//             .getDocument({ data: new Uint8Array(reader.result) })
//             .promise;

//           const imgs = [];

//           for (let i = 1; i <= pdf.numPages; i++) {
//             const page = await pdf.getPage(i);
//             const viewport = page.getViewport({ scale: DEFAULT_SCALE });

//             const canvas = document.createElement("canvas");
//             const ctx = canvas.getContext("2d");

//             canvas.width = viewport.width;
//             canvas.height = viewport.height;

//             await page.render({ canvasContext: ctx, viewport }).promise;

//             imgs.push({
//               pageNumber: i,
//               dataUrl: canvas.toDataURL("image/png"),
//               width: viewport.width,
//               height: viewport.height,
//             });
//           }

//           setPages(imgs);
//           setLoadingPdf(false);
//         };

//         reader.readAsArrayBuffer(file);
//       } catch (err) {
//         console.error("PDF load failed:", err);
//         alert("Failed to load PDF: " + err.message);
//         setLoadingPdf(false);
//       }
//     };

//     loadPdf();
//   }, [file]);

//   // ---------------- INIT FABRIC FOR ACTIVE PAGE ----------------
//   const initFabricForPage = (pageNumber) => {
//     const pageObj = pages.find((p) => p.pageNumber === pageNumber);
//     if (!pageObj) return;

//     // ✅ ensure clean overlay always
//     if (!overlayWrapRef.current) return;
//     overlayWrapRef.current.innerHTML = "";

//     // ✅ create NEW fabric always
//     const canvasEl = document.createElement("canvas");
//     canvasEl.width = pageObj.width;
//     canvasEl.height = pageObj.height;
//     canvasEl.style.position = "absolute";
//     canvasEl.style.left = "0px";
//     canvasEl.style.top = "0px";
//     canvasEl.style.zIndex = 20;

//     overlayWrapRef.current.appendChild(canvasEl);

//     const fc = new fabric.Canvas(canvasEl, {
//       selection: true,
//       preserveObjectStacking: true,
//       selectionKey: 'ctrlKey', // Enable multi-selection with Ctrl key
//       altSelectionKey: 'shiftKey', // Alternative multi-selection with Shift key
//     });

//     fabricRef.current[pageNumber] = fc;

//     // ✅ Load JSON only if this page already has saved edits
//     if (pageStatesRef.current[pageNumber]) {
//       fc.loadFromJSON(pageStatesRef.current[pageNumber], () => {
//         fc.renderAll();
//         fc.requestRenderAll();
//       });
//     } else {
//       fc.clear(); // ✅ fresh page
//     }

//     // ✅ Attach saveState (CRITICAL)
//     const saveState = () => {
//       const json = fc.toJSON();
//       pageStatesRef.current[pageNumber] = json;
//     };

//     fc.on("object:added", () => {
//       setTimeout(saveState, 50);
//     });
//     fc.on("object:modified", () => {
//       setTimeout(saveState, 50);
//     });
//     fc.on("object:removed", () => {
//       setTimeout(saveState, 50);
//     });
//     fc.on("path:created", () => {
//       setTimeout(saveState, 50);
//     });

//     // ✅ Apply tool mode after a brief delay to ensure canvas is ready
//     setTimeout(() => {
//       applyToolMode(pageNumber, tool);
//     }, 50);
//   };



//   // ✅ Initialize fabric when pages first load
//   useEffect(() => {
//     if (pages.length > 0 && activePage === 1) {
//       // Small delay to ensure DOM is ready
//       setTimeout(() => {
//         initFabricForPage(1);
//       }, 50);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pages]);

//   // Update pen size in drawing mode immediately
//   useEffect(() => {
//     if (fabricRef.current[activePage]?.isDrawingMode) {
//       const canvas = fabricRef.current[activePage];
//       if (canvas.freeDrawingBrush) {
//         canvas.freeDrawingBrush.width = penSize;
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [penSize, activePage]);

//   // ---------------- TOOL MODE ----------------
//   const applyToolMode = (pageNumber, mode) => {
//     const canvas = fabricRef.current[pageNumber];
//     if (!canvas) return;

//     // reset modes
//     canvas.isDrawingMode = false;
//     canvas.selection = true;
//     canvas.forEachObject((obj) => (obj.selectable = true));
    
//     // Enable multi-selection
//     canvas.selectionKey = 'ctrlKey';
//     canvas.altSelectionKey = 'shiftKey';

//     // ✅ IMPORTANT: freeDrawingBrush exists only after enabling drawing mode
//     if (mode === "draw") {
//       canvas.isDrawingMode = true;

//       if (!canvas.freeDrawingBrush) {
//         canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
//       }

//       canvas.freeDrawingBrush.width = penSize;
//       canvas.freeDrawingBrush.color = "black";
//     }

//     if (mode === "highlight") {
//       canvas.isDrawingMode = true;

//       if (!canvas.freeDrawingBrush) {
//         canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
//       }

//       canvas.freeDrawingBrush.width = 18;
//       canvas.freeDrawingBrush.color = highlightColor;
//     }

//     canvas.requestRenderAll();
//   };

//   const saveCurrentPageState = () => {
//     const fc = fabricRef.current[activePage];
//     if (!fc) return;

//     pageStatesRef.current[activePage] = fc.toJSON();
//   };

//   useEffect(() => {
//     if (!pages.length) return;

//     // ✅ 1) Save old page edits
//     saveCurrentPageState();

//     // ✅ 2) Dispose old canvas completely
//     if (fabricRef.current[activePage]) {
//       fabricRef.current[activePage].dispose();
//       delete fabricRef.current[activePage];
//     }

//     // ✅ 3) Clear overlay
//     if (overlayWrapRef.current) overlayWrapRef.current.innerHTML = "";

//     // ✅ 4) init fresh fabric for new page
//     setTimeout(() => {
//       initFabricForPage(activePage);
//       // ✅ Apply tool mode immediately after initializing fabric
//       setTimeout(() => {
//         applyToolMode(activePage, tool);
//       }, 100);
//     }, 0);

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activePage]);

//   useEffect(() => {
//     if (!fabricRef.current[activePage]) return; // ✅ guard
//     applyToolMode(activePage, tool);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tool, penSize, activePage]);

//   // ---------------- ACTIONS ----------------
//   const addText = () => {
//     const canvas = fabricRef.current[activePage];
//     if (!canvas) return;

//     // Set tool to select mode first
//     setTool("select");
//     applyToolMode(activePage, "select");

//     const textbox = new fabric.Textbox("Type here", {
//       left: 80,
//       top: 120,
//       fontSize,
//       fill: "#000",
//       fontFamily: "Helvetica",
//       editable: true,
//     });

//     canvas.add(textbox);
//     canvas.setActiveObject(textbox);
//     canvas.requestRenderAll();
//   };

//   const addImage = (e) => {
//     const canvas = fabricRef.current[activePage];
//     if (!canvas) return;

//     const imgFile = e.target.files?.[0];
//     if (!imgFile) return;

//     const imgUrl = URL.createObjectURL(imgFile);

//     fabric.Image.fromURL(imgUrl, (img) => {
//       img.set({
//         left: 80,
//         top: 160,
//         scaleX: 0.5,
//         scaleY: 0.5,
//       });

//       canvas.add(img);
//       canvas.setActiveObject(img);
//       canvas.requestRenderAll();

//       URL.revokeObjectURL(imgUrl);
//       e.target.value = "";
//     });
//   };

//   const deleteSelected = () => {
//     const canvas = fabricRef.current[activePage];
//     if (!canvas) return;

//     const activeObj = canvas.getActiveObject();
//     if (!activeObj) return;

//     // ✅ Handle multi-selection (ActiveSelection type)
//     if (activeObj.type === 'activeSelection') {
//       // Remove all objects in the active selection
//       activeObj.forEachObject((obj) => {
//         canvas.remove(obj);
//       });
//       // Discard the selection
//       canvas.discardActiveObject();
//     } else {
//       // Single object
//       canvas.remove(activeObj);
//       canvas.discardActiveObject();
//     }

//     canvas.requestRenderAll();
//   };



//   const exportPdf = async () => {
//     if (!file) return alert("Upload a PDF first!");

//     setExporting(true);

//     try {
//       // ✅ Save current page edits FIRST
//       const activeCanvas = fabricRef.current[activePage];
//       if (activeCanvas) {
//         pageStatesRef.current[activePage] = activeCanvas.toJSON();
//       }

//       const pdfBytes = await file.arrayBuffer();
//       const pdfDoc = await PDFDocument.load(pdfBytes);
//       const pdfPages = pdfDoc.getPages();

//       // ✅ Process each page with edits
//       for (let i = 0; i < pdfPages.length; i++) {
//         const pageNum = i + 1;

//         // ✅ Check if this page has edits
//         const json = pageStatesRef.current[pageNum];
//         if (!json || !json.objects || json.objects.length === 0) {
//           // No edits on this page, skip
//           continue;
//         }

//         const page = pdfPages[i];
//         const { width, height } = page.getSize();

//         // ✅ Create temp fabric canvas in PDF page size
//         const tempCanvasEl = document.createElement("canvas");
//         tempCanvasEl.width = width;
//         tempCanvasEl.height = height;

//         const tempFabric = new fabric.Canvas(tempCanvasEl, {
//           width: width,
//           height: height,
//           backgroundColor: "transparent",
//         });

//         // ✅ Load the edits onto the temp canvas
//         await new Promise((resolve) => {
//           let done = false;

//           tempFabric.loadFromJSON(json, () => {
//             if (done) return;
//             done = true;
//             tempFabric.renderAll();
//             setTimeout(() => resolve(), 100); // Small delay to ensure render
//           });

//           // ✅ safety timeout so it never hangs
//           setTimeout(() => {
//             if (done) return;
//             done = true;
//             resolve();
//           }, 2000);
//         });

//         // ✅ Convert overlay to PNG with transparent background
//         const overlayPng = tempFabric.toDataURL({
//           format: "png",
//           quality: 1,
//           multiplier: 1,
//         });

//         const pngBytes = await fetch(overlayPng).then((r) => r.arrayBuffer());
//         const pngImage = await pdfDoc.embedPng(pngBytes);

//         // ✅ Stamp overlay onto real PDF page
//         page.drawImage(pngImage, {
//           x: 0,
//           y: 0,
//           width: width,
//           height: height,
//         });

//         tempFabric.dispose();
//       }

//       // ✅ download final pdf
//       const outputBytes = await pdfDoc.save();
//       const blob = new Blob([outputBytes], { type: "application/pdf" });
//       const url = URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `edited_${file.name.replace(".pdf", "")}.pdf`;
//       a.click();

//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Export failed:", err);
//       alert("Export failed: " + err.message);
//     } finally {
//       setExporting(false);
//     }
//   };

//   // ---------------- UI ----------------
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 text-slate-900 dark:text-white">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold">Edit PDF</h1>
//             <p className="text-sm text-gray-600 dark:text-gray-300">
//               Upload a PDF → edit with preview → download edited PDF
//             </p>
//           </div>

//           <div className="flex gap-3 flex-wrap">
//             <label className="px-4 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer font-semibold">
//               Upload PDF
//               <input
//                 type="file"
//                 accept=".pdf"
//                 className="hidden"
//                 onChange={handleFileChange}
//               />
//             </label>

//             <button
//               onClick={exportPdf}
//               disabled={!file || exporting}
//               className={`px-5 py-2 rounded-xl font-bold transition-all ${
//                 !file || exporting
//                   ? "bg-gray-400 cursor-not-allowed text-white"
//                   : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
//               }`}
//             >
//               {exporting ? "Exporting..." : "Download PDF"}
//             </button>
//           </div>
//         </div>

//         {/* Toolbar */}
//         <div className="mb-4 flex flex-wrap gap-2 items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow">
//           <button
//             onClick={() => {
//               setTool("select");
//               applyToolMode(activePage, "select");
//             }}
//             className={`px-4 py-2 rounded-xl font-semibold ${
//               tool === "select"
//                 ? "bg-blue-600 text-white"
//                 : "bg-gray-200 dark:bg-gray-700"
//             }`}
//           >
//             Select
//           </button>

//           <button
//             onClick={() => {
//               addText();
//             }}
//             className="px-4 py-2 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700"
//           >
//             Add Text
//           </button>

//           <button
//             onClick={() => {
//               setTool("draw");
//               applyToolMode(activePage, "draw");
//             }}
//             className={`px-4 py-2 rounded-xl font-semibold ${
//               tool === "draw"
//                 ? "bg-blue-600 text-white"
//                 : "bg-gray-200 dark:bg-gray-700"
//             }`}
//           >
//             Draw
//           </button>

//           <button
//             onClick={() => {
//               setTool("highlight");
//               applyToolMode(activePage, "highlight");
//             }}
//             className={`px-4 py-2 rounded-xl font-semibold ${
//               tool === "highlight"
//                 ? "bg-blue-600 text-white"
//                 : "bg-gray-200 dark:bg-gray-700"
//             }`}
//           >
//             Highlight
//           </button>

//           <label className="px-4 py-2 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer">
//             Add Image
//             <input
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={addImage}
//             />
//           </label>

//           <button
//             onClick={deleteSelected}
//             className="px-4 py-2 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700"
//           >
//             Delete
//           </button>



//           <div className="ml-auto flex gap-2 items-center flex-wrap">
//             <input
//               type="number"
//               value={fontSize}
//               onChange={(e) => setFontSize(Number(e.target.value))}
//               className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
//               placeholder="Font"
//             />

//             <input
//               type="number"
//               value={penSize}
//               onChange={(e) => setPenSize(Number(e.target.value))}
//               className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
//               placeholder="Pen"
//             />
//           </div>
//         </div>

//         {/* Layout */}
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
//           {/* Thumbnails */}
//           <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow border border-gray-200 dark:border-gray-700 h-[75vh] overflow-y-auto">
//             <div className="font-bold mb-3">Pages</div>

//             {loadingPdf ? (
//               <div className="text-sm text-gray-500 dark:text-gray-400">
//                 Loading pages...
//               </div>
//             ) : pages.length === 0 ? (
//               <div className="text-sm text-gray-500 dark:text-gray-400">
//                 Upload a PDF to preview.
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {pages.map((p) => (
//                   <button
//                     key={p.pageNumber}
//                     onClick={() => setActivePage(p.pageNumber)}
//                     className={`w-full p-2 rounded-xl border text-left transition-all ${
//                       activePage === p.pageNumber
//                         ? "border-blue-500 bg-blue-50 dark:bg-gray-700"
//                         : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
//                     }`}
//                   >
//                     <div className="text-xs font-semibold mb-2">
//                       Page {p.pageNumber}
//                     </div>
//                     <img src={p.dataUrl} className="w-full rounded-lg" />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Preview Editor */}
//           <div className="md:col-span-9 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow border border-gray-200 dark:border-gray-700 min-h-[75vh] overflow-auto flex justify-center">
//             {!file ? (
//               <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center">
//                 Upload a PDF to start editing
//               </div>
//             ) : pages.length === 0 ? (
//               <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center">
//                 Loading preview...
//               </div>
//             ) : (
//               <div className="relative">
//                 <img
//                   ref={pageImgRef}
//                   src={pages.find((p) => p.pageNumber === activePage)?.dataUrl}
//                   draggable={false}
//                   className="select-none"
//                 />

//                 <div
//                   ref={overlayWrapRef}
//                   className="absolute left-0 top-0"
//                   style={{ width: "100%", height: "100%" }}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

const DEFAULT_SCALE = 1.5;

export default function EditPdfEditor() {
  const [file, setFile] = useState(null);
  const [locked, setLocked] = useState(false);

  // preview pages as images
  const [pages, setPages] = useState([]); // [{pageNumber, dataUrl, width, height}]
  const [activePage, setActivePage] = useState(1); // 1-based
  const [loadingPdf, setLoadingPdf] = useState(false);

  // tools
  const [tool, setTool] = useState("select"); // select | draw | highlight | eraser
  const [fontSize, setFontSize] = useState(18);
  const [penSize, setPenSize] = useState(3);
  const [eraserSize, setEraserSize] = useState(20);

  // export
  const [exporting, setExporting] = useState(false);

  // refs
  const pageImgRef = useRef(null);
  const overlayWrapRef = useRef(null);

  // fabric per page
  const fabricRef = useRef({}); // {pageNumber: fabricCanvas}
  const pageStatesRef = useRef({}); // {pageNumber: fabricJson}
  const historyRef = useRef({}); // {pageNumber: {undo:[], redo:[]}}
  
  // eraser state
  const erasingRef = useRef(false);

  const highlightColor = "rgba(255,255,0,0.35)";

  // ---------------- FILE UPLOAD ----------------
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPages([]);
    setActivePage(1);

    // clear all previous states
    pageStatesRef.current = {};
    historyRef.current = {};

    // dispose old fabric canvases
    Object.values(fabricRef.current).forEach((c) => c?.dispose?.());
    fabricRef.current = {};
  };

  // ---------------- LOAD PDF INTO IMAGE PAGES ----------------
  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {
      setLoadingPdf(true);

      try {
        const reader = new FileReader();

        reader.onload = async () => {
          const pdf = await pdfjsLib
            .getDocument({ data: new Uint8Array(reader.result) })
            .promise;

          const imgs = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: DEFAULT_SCALE });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: ctx, viewport }).promise;

            imgs.push({
              pageNumber: i,
              dataUrl: canvas.toDataURL("image/png"),
              width: viewport.width,
              height: viewport.height,
            });
          }

          setPages(imgs);
          setLoadingPdf(false);
        };

        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error("PDF load failed:", err);
        alert("Failed to load PDF: " + err.message);
        setLoadingPdf(false);
      }
    };

    loadPdf();
  }, [file]);

  // ---------------- INIT FABRIC FOR ACTIVE PAGE ----------------
  const initFabricForPage = (pageNumber) => {
    const pageObj = pages.find((p) => p.pageNumber === pageNumber);
    if (!pageObj) return;

    // ✅ ensure clean overlay always
    if (!overlayWrapRef.current) return;
    overlayWrapRef.current.innerHTML = "";

    // ✅ create NEW fabric always
    const canvasEl = document.createElement("canvas");
    canvasEl.width = pageObj.width;
    canvasEl.height = pageObj.height;
    canvasEl.style.position = "absolute";
    canvasEl.style.left = "0px";
    canvasEl.style.top = "0px";
    canvasEl.style.zIndex = 20;

    overlayWrapRef.current.appendChild(canvasEl);

    const fc = new fabric.Canvas(canvasEl, {
      selection: true,
      preserveObjectStacking: true,
      selectionKey: 'ctrlKey',
      altSelectionKey: 'shiftKey',
    });

    fabricRef.current[pageNumber] = fc;

    // ✅ Load JSON only if this page already has saved edits
    if (pageStatesRef.current[pageNumber]) {
      fc.loadFromJSON(pageStatesRef.current[pageNumber], () => {
        fc.renderAll();
        fc.requestRenderAll();
      });
    } else {
      fc.clear();
    }

    // ✅ Attach saveState (CRITICAL)
    const saveState = () => {
      const json = fc.toJSON();
      pageStatesRef.current[pageNumber] = json;
    };

    fc.on("object:added", () => {
      setTimeout(saveState, 50);
    });
    fc.on("object:modified", () => {
      setTimeout(saveState, 50);
    });
    fc.on("object:removed", () => {
      setTimeout(saveState, 50);
    });
    fc.on("path:created", () => {
      setTimeout(saveState, 50);
    });

    // ✅ Apply tool mode after a brief delay to ensure canvas is ready
    setTimeout(() => {
      applyToolMode(pageNumber, tool);
    }, 50);
  };

  // ✅ Initialize fabric when pages first load
  useEffect(() => {
    if (pages.length > 0 && activePage === 1) {
      setTimeout(() => {
        initFabricForPage(1);
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  // Update pen size in drawing mode immediately
  useEffect(() => {
    if (fabricRef.current[activePage]?.isDrawingMode) {
      const canvas = fabricRef.current[activePage];
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = penSize;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penSize, activePage]);

  // Update eraser cursor when size changes
  useEffect(() => {
    if (tool === "eraser" && fabricRef.current[activePage]) {
      applyToolMode(activePage, "eraser");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eraserSize, activePage]);

  // ---------------- TOOL MODE ----------------
  const applyToolMode = (pageNumber, mode) => {
    const canvas = fabricRef.current[pageNumber];
    if (!canvas) return;

    // Remove any existing event listeners
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    // reset modes
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.forEachObject((obj) => (obj.selectable = true));
    
    // Enable multi-selection
    canvas.selectionKey = 'ctrlKey';
    canvas.altSelectionKey = 'shiftKey';

    // Reset cursor
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';

    if (mode === "draw") {
      canvas.isDrawingMode = true;

      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }

      canvas.freeDrawingBrush.width = penSize;
      canvas.freeDrawingBrush.color = "black";
    }

    if (mode === "highlight") {
      canvas.isDrawingMode = true;

      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }

      canvas.freeDrawingBrush.width = 18;
      canvas.freeDrawingBrush.color = highlightColor;
    }

    if (mode === "eraser") {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.forEachObject((obj) => (obj.selectable = false));

      // Create eraser cursor
      const createEraserCursor = () => {
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${eraserSize}" height="${eraserSize}" viewBox="0 0 ${eraserSize} ${eraserSize}">
            <circle cx="${eraserSize/2}" cy="${eraserSize/2}" r="${eraserSize/2 - 2}" fill="rgba(255,0,0,0.2)" stroke="red" stroke-width="2"/>
          </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svgString)}`;
      };

      const eraserCursor = createEraserCursor();
      const cursorHotspot = Math.floor(eraserSize/2);
      canvas.defaultCursor = `url("${eraserCursor}") ${cursorHotspot} ${cursorHotspot}, crosshair`;
      canvas.hoverCursor = `url("${eraserCursor}") ${cursorHotspot} ${cursorHotspot}, crosshair`;

      // Eraser logic with improved drag detection
      const erasedInThisStroke = new Set();

      const performErase = (pointer) => {
        if (!pointer) return;

        const objects = canvas.getObjects();
        const eraserRadius = eraserSize / 2;

        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          
          // Skip if already erased in this stroke
          if (erasedInThisStroke.has(obj)) continue;

          // Get object bounds
          const objBounds = obj.getBoundingRect(true);
          
          // Check if eraser overlaps with object bounds
          const overlaps = 
            pointer.x + eraserRadius >= objBounds.left &&
            pointer.x - eraserRadius <= objBounds.left + objBounds.width &&
            pointer.y + eraserRadius >= objBounds.top &&
            pointer.y - eraserRadius <= objBounds.top + objBounds.height;

          if (overlaps) {
            let shouldErase = false;

            // For paths (drawn/highlighted lines), check multiple points
            if (obj.type === 'path') {
              // Check center point
              if (obj.containsPoint && obj.containsPoint(pointer)) {
                shouldErase = true;
              } else {
                // Check points around the eraser circle
                const checkPoints = 12;
                for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / checkPoints) {
                  const checkX = pointer.x + Math.cos(angle) * (eraserRadius * 0.7);
                  const checkY = pointer.y + Math.sin(angle) * (eraserRadius * 0.7);
                  if (obj.containsPoint({ x: checkX, y: checkY })) {
                    shouldErase = true;
                    break;
                  }
                }
              }
            } else {
              // For other objects (text, images), use containsPoint
              if (obj.containsPoint && obj.containsPoint(pointer)) {
                shouldErase = true;
              }
            }

            if (shouldErase) {
              erasedInThisStroke.add(obj);
              canvas.remove(obj);
            }
          }
        }
        
        canvas.requestRenderAll();
      };

      const mouseDownHandler = (opt) => {
        erasingRef.current = true;
        erasedInThisStroke.clear();
        const pointer = canvas.getPointer(opt.e);
        performErase(pointer);
      };

      const mouseMoveHandler = (opt) => {
        if (!erasingRef.current) return;
        const pointer = canvas.getPointer(opt.e);
        performErase(pointer);
      };

      const mouseUpHandler = () => {
        if (erasingRef.current) {
          erasingRef.current = false;
          erasedInThisStroke.clear();
          // Save state after erasing
          setTimeout(() => {
            const json = canvas.toJSON();
            pageStatesRef.current[pageNumber] = json;
          }, 50);
        }
      };

      canvas.on('mouse:down', mouseDownHandler);
      canvas.on('mouse:move', mouseMoveHandler);
      canvas.on('mouse:up', mouseUpHandler);
    }

    canvas.requestRenderAll();
  };

  const saveCurrentPageState = () => {
    const fc = fabricRef.current[activePage];
    if (!fc) return;

    pageStatesRef.current[activePage] = fc.toJSON();
  };

  useEffect(() => {
    if (!pages.length) return;

    // ✅ 1) Save old page edits
    saveCurrentPageState();

    // ✅ 2) Dispose old canvas completely
    if (fabricRef.current[activePage]) {
      fabricRef.current[activePage].dispose();
      delete fabricRef.current[activePage];
    }

    // ✅ 3) Clear overlay
    if (overlayWrapRef.current) overlayWrapRef.current.innerHTML = "";

    // ✅ 4) init fresh fabric for new page
    setTimeout(() => {
      initFabricForPage(activePage);
      setTimeout(() => {
        applyToolMode(activePage, tool);
      }, 100);
    }, 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  useEffect(() => {
    if (!fabricRef.current[activePage]) return;
    applyToolMode(activePage, tool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, penSize, activePage]);

  // ---------------- ACTIONS ----------------
  const addText = () => {
    const canvas = fabricRef.current[activePage];
    if (!canvas) return;

    setTool("select");
    applyToolMode(activePage, "select");

    const textbox = new fabric.Textbox("Type here", {
      left: 80,
      top: 120,
      fontSize,
      fill: "#000",
      fontFamily: "Helvetica",
      editable: true,
    });

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.requestRenderAll();
  };

  const addImage = (e) => {
    const canvas = fabricRef.current[activePage];
    if (!canvas) return;

    const imgFile = e.target.files?.[0];
    if (!imgFile) return;

    const imgUrl = URL.createObjectURL(imgFile);

    fabric.Image.fromURL(imgUrl, (img) => {
      img.set({
        left: 80,
        top: 160,
        scaleX: 0.5,
        scaleY: 0.5,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();

      URL.revokeObjectURL(imgUrl);
      e.target.value = "";
    });
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current[activePage];
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    if (activeObj.type === 'activeSelection') {
      activeObj.forEachObject((obj) => {
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
    } else {
      canvas.remove(activeObj);
      canvas.discardActiveObject();
    }

    canvas.requestRenderAll();
  };

  const exportPdf = async () => {
    if (!file) return alert("Upload a PDF first!");

    setExporting(true);

    try {
      const activeCanvas = fabricRef.current[activePage];
      if (activeCanvas) {
        pageStatesRef.current[activePage] = activeCanvas.toJSON();
      }

      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pdfPages = pdfDoc.getPages();

      for (let i = 0; i < pdfPages.length; i++) {
        const pageNum = i + 1;

        const json = pageStatesRef.current[pageNum];
        if (!json || !json.objects || json.objects.length === 0) {
          continue;
        }

        const page = pdfPages[i];
        const { width, height } = page.getSize();

        const tempCanvasEl = document.createElement("canvas");
        tempCanvasEl.width = width;
        tempCanvasEl.height = height;

        const tempFabric = new fabric.Canvas(tempCanvasEl, {
          width: width,
          height: height,
          backgroundColor: "transparent",
        });

        await new Promise((resolve) => {
          let done = false;

          tempFabric.loadFromJSON(json, () => {
            if (done) return;
            done = true;
            tempFabric.renderAll();
            setTimeout(() => resolve(), 100);
          });

          setTimeout(() => {
            if (done) return;
            done = true;
            resolve();
          }, 2000);
        });

        const overlayPng = tempFabric.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 1,
        });

        const pngBytes = await fetch(overlayPng).then((r) => r.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngBytes);

        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });

        tempFabric.dispose();
      }

      const outputBytes = await pdfDoc.save();
      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `edited_${file.name.replace(".pdf", "")}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Edit PDF</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Upload a PDF → edit with preview → download edited PDF
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <label className="px-4 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer font-semibold">
              Upload PDF
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            <button
              onClick={exportPdf}
              disabled={!file || exporting}
              className={`px-5 py-2 rounded-xl font-bold transition-all ${
                !file || exporting
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              }`}
            >
              {exporting ? "Exporting..." : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap gap-2 items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow">
          <button
            onClick={() => {
              setTool("select");
              applyToolMode(activePage, "select");
            }}
            className={`px-4 py-2 rounded-xl font-semibold ${
              tool === "select"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Select
          </button>

          <button
            onClick={() => {
              addText();
            }}
            className="px-4 py-2 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700"
          >
            Add Text
          </button>

          <button
            onClick={() => {
              setTool("draw");
              applyToolMode(activePage, "draw");
            }}
            className={`px-4 py-2 rounded-xl font-semibold ${
              tool === "draw"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Draw
          </button>

          <button
            onClick={() => {
              setTool("highlight");
              applyToolMode(activePage, "highlight");
            }}
            className={`px-4 py-2 rounded-xl font-semibold ${
              tool === "highlight"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Highlight
          </button>

          <button
            onClick={() => {
              setTool("eraser");
              applyToolMode(activePage, "eraser");
            }}
            className={`px-4 py-2 rounded-xl font-semibold ${
              tool === "eraser"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Eraser
          </button>

          <label className="px-4 py-2 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer">
            Add Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={addImage}
            />
          </label>

          <button
            onClick={deleteSelected}
            className="px-4 py-2 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>

          <div className="ml-auto flex gap-2 items-center flex-wrap">
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              placeholder="Font"
            />

            <input
              type="number"
              value={penSize}
              onChange={(e) => setPenSize(Number(e.target.value))}
              className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              placeholder="Pen"
            />

            <input
              type="number"
              value={eraserSize}
              onChange={(e) => setEraserSize(Number(e.target.value))}
              className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              placeholder="Eraser"
            />
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Thumbnails */}
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow border border-gray-200 dark:border-gray-700 h-[75vh] overflow-y-auto">
            <div className="font-bold mb-3">Pages</div>

            {loadingPdf ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Loading pages...
              </div>
            ) : pages.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Upload a PDF to preview.
              </div>
            ) : (
              <div className="space-y-3">
                {pages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => setActivePage(p.pageNumber)}
                    className={`w-full p-2 rounded-xl border text-left transition-all ${
                      activePage === p.pageNumber
                        ? "border-blue-500 bg-blue-50 dark:bg-gray-700"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-2">
                      Page {p.pageNumber}
                    </div>
                    <img src={p.dataUrl} className="w-full rounded-lg" alt={`Page ${p.pageNumber}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview Editor */}
          <div className="md:col-span-9 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow border border-gray-200 dark:border-gray-700 min-h-[75vh] overflow-auto flex justify-center">
            {!file ? (
              <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center">
                Upload a PDF to start editing
              </div>
            ) : pages.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center">
                Loading preview...
              </div>
            ) : (
              <div className="relative">
                <img
                  ref={pageImgRef}
                  src={pages.find((p) => p.pageNumber === activePage)?.dataUrl}
                  draggable={false}
                  className="select-none"
                  alt={`Page ${activePage}`}
                />

                <div
                  ref={overlayWrapRef}
                  className="absolute left-0 top-0"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}