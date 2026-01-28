// import { useEffect, useRef, useState } from "react";
// import * as fabric from "fabric";
// import { PDFDocument } from "pdf-lib";
// import * as pdfjsLib from "pdfjs-dist";

// const DEFAULT_SCALE = 1.5;

// export default function EditPdfEditor() {
//   const [file, setFile] = useState(null);
//   const [locked, setLocked] = useState(false);

//   // preview pages as images
//   const [pages, setPages] = useState([]); // [{pageNumber, dataUrl, width, height}]
//   const [activePage, setActivePage] = useState(1); // 1-based
//   const [loadingPdf, setLoadingPdf] = useState(false);

//   // tools
//   const [tool, setTool] = useState("select"); // select | draw | highlight | eraser
//   const [fontSize, setFontSize] = useState(18);
//   const [penSize, setPenSize] = useState(3);
//   const [eraserSize, setEraserSize] = useState(20);

//   // export
//   const [exporting, setExporting] = useState(false);

//   // refs
//   const pageImgRef = useRef(null);
//   const overlayWrapRef = useRef(null);

//   // fabric per page
//   const fabricRef = useRef({}); // {pageNumber: fabricCanvas}
//   const pageStatesRef = useRef({}); // {pageNumber: fabricJson}
//   const historyRef = useRef({}); // {pageNumber: {undo:[], redo:[]}}

//   // eraser state
//   const erasingRef = useRef(false);

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
//       selectionKey: "ctrlKey",
//       altSelectionKey: "shiftKey",
//     });

//     fabricRef.current[pageNumber] = fc;

//     // ✅ Load JSON only if this page already has saved edits
//     if (pageStatesRef.current[pageNumber]) {
//       fc.loadFromJSON(pageStatesRef.current[pageNumber], () => {
//         fc.renderAll();
//         fc.requestRenderAll();
//       });
//     } else {
//       fc.clear();
//     }

//     // ✅ Attach saveState (CRITICAL)
//     const saveState = () => {
//       const json = fc.toJSON();
//       pageStatesRef.current[pageNumber] = json;
//     };

//     fc.on("object:added", () => setTimeout(saveState, 50));
//     fc.on("object:modified", () => setTimeout(saveState, 50));
//     fc.on("object:removed", () => setTimeout(saveState, 50));
//     fc.on("path:created", () => setTimeout(saveState, 50));

//     // ✅ Apply tool mode after a brief delay to ensure canvas is ready
//     setTimeout(() => {
//       applyToolMode(pageNumber, tool);
//     }, 50);
//   };

//   // ✅ Initialize fabric when pages first load
//   useEffect(() => {
//     if (pages.length > 0 && activePage === 1) {
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

//   // Update eraser cursor when size changes
//   useEffect(() => {
//     if (tool === "eraser" && fabricRef.current[activePage]) {
//       applyToolMode(activePage, "eraser");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [eraserSize, activePage]);

//   // ---------------- TOOL MODE ----------------
//   const applyToolMode = (pageNumber, mode) => {
//     const canvas = fabricRef.current[pageNumber];
//     if (!canvas) return;

//     // ✅ CRITICAL: Remove ALL existing event listeners first
//     canvas.off("mouse:down");
//     canvas.off("mouse:move");
//     canvas.off("mouse:up");

//     // reset modes
//     canvas.isDrawingMode = false;
//     canvas.selection = true;
//     canvas.forEachObject((obj) => {
//       obj.selectable = true;
//       obj.evented = true;
//     });

//     // Enable multi-selection
//     canvas.selectionKey = "ctrlKey";
//     canvas.altSelectionKey = "shiftKey";

//     // Reset cursor
//     canvas.defaultCursor = "default";
//     canvas.hoverCursor = "move";

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

//     if (mode === "eraser") {
//       // ✅ Disable selection and interaction
//       canvas.isDrawingMode = false;
//       canvas.selection = false;
//       canvas.forEachObject((obj) => {
//         obj.selectable = false;
//         obj.evented = false;
//       });

//       // ✅ Create eraser cursor
//       const svgCursor = `data:image/svg+xml;base64,${btoa(`
//         <svg xmlns="http://www.w3.org/2000/svg" width="${eraserSize}" height="${eraserSize}">
//           <circle cx="${eraserSize / 2}" cy="${eraserSize / 2}" r="${eraserSize / 2 - 2}" 
//                   fill="rgba(255,0,0,0.15)" stroke="#ff0000" stroke-width="2"/>
//           <line x1="${eraserSize / 2}" y1="0" x2="${eraserSize / 2}" y2="${eraserSize}" 
//                 stroke="#ff0000" stroke-width="1" opacity="0.5"/>
//           <line x1="0" y1="${eraserSize / 2}" x2="${eraserSize}" y2="${eraserSize / 2}" 
//                 stroke="#ff0000" stroke-width="1" opacity="0.5"/>
//         </svg>
//       `)}`;

//       const hotspot = Math.floor(eraserSize / 2);
//       canvas.defaultCursor = `url("${svgCursor}") ${hotspot} ${hotspot}, crosshair`;
//       canvas.hoverCursor = `url("${svgCursor}") ${hotspot} ${hotspot}, crosshair`;

//       // ✅ Eraser state tracking
//       const erasedObjects = new Set();

//       // ✅ Improved erase detection function
//       const eraseAtPoint = (pointer) => {
//         const objects = canvas.getObjects();
//         const eraserRadius = eraserSize / 2;
//         let erasedSomething = false;

//         for (let i = objects.length - 1; i >= 0; i--) {
//           const obj = objects[i];

//           // Skip already erased objects in this stroke
//           if (erasedObjects.has(obj)) continue;

//           // Get object bounding box
//           const bounds = obj.getBoundingRect(true);

//           // Quick bounding box check first
//           const inBounds =
//             pointer.x + eraserRadius >= bounds.left &&
//             pointer.x - eraserRadius <= bounds.left + bounds.width &&
//             pointer.y + eraserRadius >= bounds.top &&
//             pointer.y - eraserRadius <= bounds.top + bounds.height;

//           if (!inBounds) continue;

//           // ✅ Detailed intersection check
//           let shouldErase = false;

//           if (obj.type === "path") {
//             // For paths (drawings/highlights), check multiple points around eraser
//             const checkPoints = [
//               { x: pointer.x, y: pointer.y }, // center
//               { x: pointer.x - eraserRadius * 0.5, y: pointer.y },
//               { x: pointer.x + eraserRadius * 0.5, y: pointer.y },
//               { x: pointer.x, y: pointer.y - eraserRadius * 0.5 },
//               { x: pointer.x, y: pointer.y + eraserRadius * 0.5 },
//             ];

//             for (const point of checkPoints) {
//               if (obj.containsPoint(point)) {
//                 shouldErase = true;
//                 break;
//               }
//             }
//           } else if (
//             obj.type === "textbox" ||
//             obj.type === "i-text" ||
//             obj.type === "text"
//           ) {
//             if (obj.containsPoint(pointer)) {
//               shouldErase = true;
//             }
//           } else if (obj.type === "image") {
//             if (obj.containsPoint(pointer)) {
//               shouldErase = true;
//             }
//           } else {
//             if (obj.containsPoint && obj.containsPoint(pointer)) {
//               shouldErase = true;
//             }
//           }

//           if (shouldErase) {
//             erasedObjects.add(obj);
//             canvas.remove(obj);
//             erasedSomething = true;
//           }
//         }

//         if (erasedSomething) {
//           canvas.requestRenderAll();
//         }
//       };

//       // ✅ Mouse event handlers
//       const mouseDownHandler = (opt) => {
//         erasingRef.current = true;
//         erasedObjects.clear();
//         const pointer =
//           opt.absolutePointer || opt.pointer || canvas.getViewportPoint(opt.e);
//         eraseAtPoint(pointer);
//       };

//       const mouseMoveHandler = (opt) => {
//         if (!erasingRef.current) return;
//         const pointer =
//           opt.absolutePointer || opt.pointer || canvas.getViewportPoint(opt.e);
//         eraseAtPoint(pointer);
//       };

//       const mouseUpHandler = () => {
//         if (erasingRef.current) {
//           erasingRef.current = false;
//           erasedObjects.clear();

//           // ✅ Save state immediately after erasing
//           const json = canvas.toJSON();
//           pageStatesRef.current[pageNumber] = json;
//         }
//       };

//       // ✅ Attach eraser event listeners
//       canvas.on("mouse:down", mouseDownHandler);
//       canvas.on("mouse:move", mouseMoveHandler);
//       canvas.on("mouse:up", mouseUpHandler);
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
//       setTimeout(() => {
//         applyToolMode(activePage, tool);
//       }, 100);
//     }, 0);

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activePage]);

//   useEffect(() => {
//     if (!fabricRef.current[activePage]) return;
//     applyToolMode(activePage, tool);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tool, penSize, activePage]);

//   // ---------------- ACTIONS ----------------
//   const addText = () => {
//     const canvas = fabricRef.current[activePage];
//     if (!canvas) return;

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

//   // =========================
//   // ✅ ADD IMAGE (FIXED + DEBUG)
//   // =========================
//   // Why it was failing:
//   // 1) fabric.Image.fromURL behaves differently across fabric versions.
//   //    In Fabric v6, you should use fabric.FabricImage.fromURL / fabric.Image.fromURL with options.
//   // 2) Blob URL sometimes loads async and fails silently (no onError).
//   // 3) input value not reset in some failure paths.
//   // 4) canvas may be disposed when switching pages quickly.

//   const addImage = async (e) => {
//     const canvas = fabricRef.current[activePage];

//     // ✅ basic guards
//     if (!canvas) {
//       console.error("[AddImage] No canvas found for activePage:", activePage);
//       alert("Canvas not ready yet. Try again in 1 sec.");
//       return;
//     }

//     const imgFile = e.target.files?.[0];
//     if (!imgFile) return;

//     // ✅ helpful debugging logs
//     console.log("[AddImage] selected file:", {
//       name: imgFile.name,
//       size: imgFile.size,
//       type: imgFile.type,
//     });

//     // ✅ validate file type
//     if (!imgFile.type?.startsWith("image/")) {
//       console.error("[AddImage] Not an image:", imgFile.type);
//       alert("Please select a valid image file.");
//       e.target.value = "";
//       return;
//     }

//     // ✅ If user was erasing/drawing, switch to select so image can be moved
//     setTool("select");
//     applyToolMode(activePage, "select");

//     const imgUrl = URL.createObjectURL(imgFile);

//     try {
//       // ✅ load image in a safe way (with explicit HTMLImageElement + onload/onerror)
//       const htmlImg = new Image();
//       htmlImg.crossOrigin = "anonymous";

//       await new Promise((resolve, reject) => {
//         htmlImg.onload = resolve;
//         htmlImg.onerror = (err) => reject(err);
//         htmlImg.src = imgUrl;
//       });

//       // ✅ IMPORTANT: Fabric v5 vs v6 compatibility
//       // If fabric.FabricImage exists (v6), use that.
//       // Else fallback to fabric.Image (v5).
//       const FabricImageCtor = fabric.FabricImage || fabric.Image;
//       if (!FabricImageCtor) {
//         throw new Error(
//           "FabricImage constructor not found. Check your fabric version/import."
//         );
//       }

//       const img = new FabricImageCtor(htmlImg, {
//         left: 80,
//         top: 160,
//         selectable: true,
//         evented: true,
//       });

//       // ✅ scale based on canvas size (so it always appears visible)
//       const maxW = canvas.getWidth() * 0.6;
//       const maxH = canvas.getHeight() * 0.6;

//       const w = img.width || htmlImg.width;
//       const h = img.height || htmlImg.height;

//       if (!w || !h) {
//         console.warn("[AddImage] width/height missing. Using default scale.");
//         img.scale(0.5);
//       } else {
//         const scale = Math.min(maxW / w, maxH / h, 1);
//         img.scale(scale);
//       }

//       // ✅ add to canvas
//       canvas.add(img);
//       canvas.setActiveObject(img);
//       canvas.requestRenderAll();

//       // ✅ save state immediately (extra safety)
//       pageStatesRef.current[activePage] = canvas.toJSON();

//       console.log("[AddImage] Image added successfully.");
//     } catch (err) {
//       console.error("[AddImage] Failed:", err);
//       alert("Failed to add image. Check console for exact error.");
//     } finally {
//       // ✅ cleanup ALWAYS
//       URL.revokeObjectURL(imgUrl);
//       e.target.value = "";
//     }
//   };

//   const deleteSelected = () => {
//     const canvas = fabricRef.current[activePage];
//     if (!canvas) return;

//     const activeObj = canvas.getActiveObject();
//     if (!activeObj) return;

//     if (activeObj.type === "activeSelection") {
//       activeObj.forEachObject((obj) => {
//         canvas.remove(obj);
//       });
//       canvas.discardActiveObject();
//     } else {
//       canvas.remove(activeObj);
//       canvas.discardActiveObject();
//     }

//     canvas.requestRenderAll();
//   };

//   const exportPdf = async () => {
//     if (!file) return alert("Upload a PDF first!");

//     setExporting(true);

//     try {
//       const activeCanvas = fabricRef.current[activePage];
//       if (activeCanvas) {
//         pageStatesRef.current[activePage] = activeCanvas.toJSON();
//       }

//       const pdfBytes = await file.arrayBuffer();
//       const pdfDoc = await PDFDocument.load(pdfBytes);
//       const pdfPages = pdfDoc.getPages();

//       for (let i = 0; i < pdfPages.length; i++) {
//         const pageNum = i + 1;

//         const json = pageStatesRef.current[pageNum];
//         if (!json || !json.objects || json.objects.length === 0) {
//           continue;
//         }

//         const page = pdfPages[i];
//         const { width, height } = page.getSize();

//         const tempCanvasEl = document.createElement("canvas");
//         tempCanvasEl.width = width;
//         tempCanvasEl.height = height;

//         const tempFabric = new fabric.Canvas(tempCanvasEl, {
//           width: width,
//           height: height,
//           backgroundColor: "transparent",
//         });

//         await new Promise((resolve) => {
//           let done = false;

//           tempFabric.loadFromJSON(json, () => {
//             if (done) return;
//             done = true;
//             tempFabric.renderAll();
//             setTimeout(() => resolve(), 100);
//           });

//           setTimeout(() => {
//             if (done) return;
//             done = true;
//             resolve();
//           }, 2000);
//         });

//         const overlayPng = tempFabric.toDataURL({
//           format: "png",
//           quality: 1,
//           multiplier: 1,
//         });

//         const pngBytes = await fetch(overlayPng).then((r) => r.arrayBuffer());
//         const pngImage = await pdfDoc.embedPng(pngBytes);

//         page.drawImage(pngImage, {
//           x: 0,
//           y: 0,
//           width: width,
//           height: height,
//         });

//         tempFabric.dispose();
//       }

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
//             <label className="px-4 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all">
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
//                   : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
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
//             className={`px-4 py-2 rounded-xl font-semibold transition-all ${
//               tool === "select"
//                 ? "bg-blue-600 text-white shadow-md"
//                 : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//             }`}
//           >
//             Select
//           </button>

//           <button
//             onClick={() => {
//               addText();
//             }}
//             className="px-4 py-2 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
//           >
//             Add Text
//           </button>

//           <button
//             onClick={() => {
//               setTool("draw");
//               applyToolMode(activePage, "draw");
//             }}
//             className={`px-4 py-2 rounded-xl font-semibold transition-all ${
//               tool === "draw"
//                 ? "bg-blue-600 text-white shadow-md"
//                 : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//             }`}
//           >
//             Draw
//           </button>

//           <button
//             onClick={() => {
//               setTool("highlight");
//               applyToolMode(activePage, "highlight");
//             }}
//             className={`px-4 py-2 rounded-xl font-semibold transition-all ${
//               tool === "highlight"
//                 ? "bg-blue-600 text-white shadow-md"
//                 : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//             }`}
//           >
//             Highlight
//           </button>

//           <button
//             onClick={() => {
//               setTool("eraser");
//               applyToolMode(activePage, "eraser");
//             }}
//             className={`px-4 py-2 rounded-xl font-semibold transition-all ${
//               tool === "eraser"
//                 ? "bg-red-600 text-white shadow-md"
//                 : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//             }`}
//           >
//             Eraser
//           </button>

//           <label className="px-4 py-2 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-all">
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
//             className="px-4 py-2 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-md"
//           >
//             Delete
//           </button>

//           <div className="ml-auto flex gap-2 items-center flex-wrap">
//             <div className="flex flex-col">
//               <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
//                 Font Size
//               </label>
//               <input
//                 type="number"
//                 value={fontSize}
//                 onChange={(e) => setFontSize(Number(e.target.value))}
//                 className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
//                 placeholder="Font"
//                 min="8"
//                 max="72"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
//                 Pen Size
//               </label>
//               <input
//                 type="number"
//                 value={penSize}
//                 onChange={(e) => setPenSize(Number(e.target.value))}
//                 className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
//                 placeholder="Pen"
//                 min="1"
//                 max="20"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
//                 Eraser Size
//               </label>
//               <input
//                 type="number"
//                 value={eraserSize}
//                 onChange={(e) => setEraserSize(Number(e.target.value))}
//                 className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
//                 placeholder="Eraser"
//                 min="10"
//                 max="100"
//               />
//             </div>
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
//                         ? "border-blue-500 bg-blue-50 dark:bg-gray-700 shadow-md"
//                         : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
//                     }`}
//                   >
//                     <div className="text-xs font-semibold mb-2">
//                       Page {p.pageNumber}
//                     </div>
//                     <img
//                       src={p.dataUrl}
//                       className="w-full rounded-lg"
//                       alt={`Page ${p.pageNumber}`}
//                     />
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
//                   alt={`Page ${activePage}`}
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
      selectionKey: "ctrlKey",
      altSelectionKey: "shiftKey",
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

    fc.on("object:added", () => setTimeout(saveState, 50));
    fc.on("object:modified", () => setTimeout(saveState, 50));
    fc.on("object:removed", () => setTimeout(saveState, 50));
    fc.on("path:created", () => setTimeout(saveState, 50));

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

    // ✅ CRITICAL: Remove ALL existing event listeners first
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");

    // reset modes
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });

    // Enable multi-selection
    canvas.selectionKey = "ctrlKey";
    canvas.altSelectionKey = "shiftKey";

    // Reset cursor
    canvas.defaultCursor = "default";
    canvas.hoverCursor = "move";

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
      // ✅ Disable selection and interaction
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });

      // ✅ Create eraser cursor
      const svgCursor = `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${eraserSize}" height="${eraserSize}">
          <circle cx="${eraserSize / 2}" cy="${eraserSize / 2}" r="${eraserSize / 2 - 2}" 
                  fill="rgba(255,0,0,0.15)" stroke="#ff0000" stroke-width="2"/>
          <line x1="${eraserSize / 2}" y1="0" x2="${eraserSize / 2}" y2="${eraserSize}" 
                stroke="#ff0000" stroke-width="1" opacity="0.5"/>
          <line x1="0" y1="${eraserSize / 2}" x2="${eraserSize}" y2="${eraserSize / 2}" 
                stroke="#ff0000" stroke-width="1" opacity="0.5"/>
        </svg>
      `)}`;

      const hotspot = Math.floor(eraserSize / 2);
      canvas.defaultCursor = `url("${svgCursor}") ${hotspot} ${hotspot}, crosshair`;
      canvas.hoverCursor = `url("${svgCursor}") ${hotspot} ${hotspot}, crosshair`;

      // ✅ Eraser state tracking
      const erasedObjects = new Set();

      // ✅ Improved erase detection function
      const eraseAtPoint = (pointer) => {
        const objects = canvas.getObjects();
        const eraserRadius = eraserSize / 2;
        let erasedSomething = false;

        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];

          // Skip already erased objects in this stroke
          if (erasedObjects.has(obj)) continue;

          // Get object bounding box
          const bounds = obj.getBoundingRect(true);

          // Quick bounding box check first
          const inBounds =
            pointer.x + eraserRadius >= bounds.left &&
            pointer.x - eraserRadius <= bounds.left + bounds.width &&
            pointer.y + eraserRadius >= bounds.top &&
            pointer.y - eraserRadius <= bounds.top + bounds.height;

          if (!inBounds) continue;

          // ✅ Detailed intersection check
          let shouldErase = false;

          if (obj.type === "path") {
            // For paths (drawings/highlights), check multiple points around eraser
            const checkPoints = [
              { x: pointer.x, y: pointer.y }, // center
              { x: pointer.x - eraserRadius * 0.5, y: pointer.y },
              { x: pointer.x + eraserRadius * 0.5, y: pointer.y },
              { x: pointer.x, y: pointer.y - eraserRadius * 0.5 },
              { x: pointer.x, y: pointer.y + eraserRadius * 0.5 },
            ];

            for (const point of checkPoints) {
              if (obj.containsPoint(point)) {
                shouldErase = true;
                break;
              }
            }
          } else if (
            obj.type === "textbox" ||
            obj.type === "i-text" ||
            obj.type === "text"
          ) {
            if (obj.containsPoint(pointer)) {
              shouldErase = true;
            }
          } else if (obj.type === "image") {
            if (obj.containsPoint(pointer)) {
              shouldErase = true;
            }
          } else {
            if (obj.containsPoint && obj.containsPoint(pointer)) {
              shouldErase = true;
            }
          }

          if (shouldErase) {
            erasedObjects.add(obj);
            canvas.remove(obj);
            erasedSomething = true;
          }
        }

        if (erasedSomething) {
          canvas.requestRenderAll();
        }
      };

      // ✅ Mouse event handlers
      const mouseDownHandler = (opt) => {
        erasingRef.current = true;
        erasedObjects.clear();
        const pointer =
          opt.absolutePointer || opt.pointer || canvas.getViewportPoint(opt.e);
        eraseAtPoint(pointer);
      };

      const mouseMoveHandler = (opt) => {
        if (!erasingRef.current) return;
        const pointer =
          opt.absolutePointer || opt.pointer || canvas.getViewportPoint(opt.e);
        eraseAtPoint(pointer);
      };

      const mouseUpHandler = () => {
        if (erasingRef.current) {
          erasingRef.current = false;
          erasedObjects.clear();

          // ✅ Save state immediately after erasing
          const json = canvas.toJSON();
          pageStatesRef.current[pageNumber] = json;
        }
      };

      // ✅ Attach eraser event listeners
      canvas.on("mouse:down", mouseDownHandler);
      canvas.on("mouse:move", mouseMoveHandler);
      canvas.on("mouse:up", mouseUpHandler);
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

  // =========================
  // ✅ FIXED ADD IMAGE (V2)
  // =========================
  const addImage = async (e) => {
    const canvas = fabricRef.current[activePage];

    if (!canvas) {
      console.error("[AddImage] No canvas found for activePage:", activePage);
      alert("Canvas not ready yet. Try again in 1 sec.");
      return;
    }

    const imgFile = e.target.files?.[0];
    if (!imgFile) return;

    console.log("[AddImage] selected file:", {
      name: imgFile.name,
      size: imgFile.size,
      type: imgFile.type,
    });

    if (!imgFile.type?.startsWith("image/")) {
      console.error("[AddImage] Not an image:", imgFile.type);
      alert("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    setTool("select");
    applyToolMode(activePage, "select");

    try {
      // ✅ Convert to base64 data URL
      const reader = new FileReader();
      
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imgFile);
      });

      console.log("[AddImage] File converted to data URL");

      // ✅ Load image using native HTMLImageElement first
      const htmlImg = new Image();
      htmlImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        htmlImg.onload = () => {
          console.log("[AddImage] HTML Image loaded:", htmlImg.width, "x", htmlImg.height);
          resolve();
        };
        htmlImg.onerror = (err) => {
          console.error("[AddImage] HTML Image load error:", err);
          reject(new Error("Failed to load image"));
        };
        htmlImg.src = dataUrl;
      });

      // ✅ Create Fabric image from loaded HTMLImageElement
      let fabricImg;
      
      // Try FabricImage first (Fabric v6), then fall back to Image (Fabric v5)
      if (fabric.FabricImage) {
        fabricImg = new fabric.FabricImage(htmlImg, {
          left: 80,
          top: 160,
          selectable: true,
          evented: true,
        });
      } else if (fabric.Image) {
        fabricImg = new fabric.Image(htmlImg, {
          left: 80,
          top: 160,
          selectable: true,
          evented: true,
        });
      } else {
        throw new Error("No Fabric Image constructor found");
      }

      console.log("[AddImage] Fabric image created:", fabricImg.width, "x", fabricImg.height);

      // ✅ Scale image to fit canvas nicely
      const maxW = canvas.getWidth() * 0.6;
      const maxH = canvas.getHeight() * 0.6;
      const imgW = fabricImg.width || htmlImg.width || 100;
      const imgH = fabricImg.height || htmlImg.height || 100;
      const scale = Math.min(maxW / imgW, maxH / imgH, 1);

      fabricImg.scale(scale);

      console.log("[AddImage] Scaled by:", scale);

      // ✅ Add to canvas
      canvas.add(fabricImg);
      canvas.setActiveObject(fabricImg);
      canvas.renderAll();
      canvas.requestRenderAll();

      // ✅ Force a re-render after a short delay
      setTimeout(() => {
        canvas.renderAll();
        canvas.requestRenderAll();
      }, 100);

      // ✅ Save state
      setTimeout(() => {
        pageStatesRef.current[activePage] = canvas.toJSON();
        console.log("[AddImage] State saved. Canvas has", canvas.getObjects().length, "objects");
      }, 150);

      console.log("[AddImage] ✅ Image added successfully!");

    } catch (err) {
      console.error("[AddImage] ❌ Failed:", err);
      alert("Failed to add image: " + err.message);
    } finally {
      e.target.value = "";
    }
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current[activePage];
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    if (activeObj.type === "activeSelection") {
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

  // =========================
  // ✅ FIXED EXPORT PDF
  // =========================
  const exportPdf = async () => {
    if (!file) return alert("Upload a PDF first!");

    setExporting(true);

    try {
      // ✅ FIX 3: Save current page state before export
      const activeCanvas = fabricRef.current[activePage];
      if (activeCanvas) {
        pageStatesRef.current[activePage] = activeCanvas.toJSON();
      }

      console.log("[Export] Starting PDF export...");
      console.log("[Export] Page states:", Object.keys(pageStatesRef.current));

      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pdfPages = pdfDoc.getPages();

      for (let i = 0; i < pdfPages.length; i++) {
        const pageNum = i + 1;
        const json = pageStatesRef.current[pageNum];

        // Skip pages with no edits
        if (!json || !json.objects || json.objects.length === 0) {
          console.log(`[Export] Page ${pageNum}: No edits, skipping`);
          continue;
        }

        console.log(`[Export] Page ${pageNum}: Processing ${json.objects.length} objects`);

        const page = pdfPages[i];
        const { width, height } = page.getSize();

        // ✅ FIX 4: Create temp canvas with correct dimensions
        const tempCanvasEl = document.createElement("canvas");
        tempCanvasEl.width = width;
        tempCanvasEl.height = height;

        const tempFabric = new fabric.Canvas(tempCanvasEl, {
          width: width,
          height: height,
          backgroundColor: null, // transparent
        });

        // ✅ FIX 5: Wait for JSON to load properly
        await new Promise((resolve, reject) => {
          let resolved = false;
          
          tempFabric.loadFromJSON(json, () => {
            if (resolved) return;
            resolved = true;
            
            tempFabric.renderAll();
            console.log(`[Export] Page ${pageNum}: Canvas rendered`);
            
            // Give extra time for any images to load
            setTimeout(resolve, 300);
          });

          // Timeout fallback
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              console.warn(`[Export] Page ${pageNum}: Timeout fallback`);
              resolve();
            }
          }, 3000);
        });

        // ✅ FIX 6: Export with high quality
        const overlayPng = tempFabric.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 1,
          enableRetinaScaling: false,
        });

        console.log(`[Export] Page ${pageNum}: Canvas exported to PNG`);

        // Embed the overlay onto the PDF page
        const pngBytes = await fetch(overlayPng).then((r) => r.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngBytes);

        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });

        console.log(`[Export] Page ${pageNum}: Overlay applied to PDF`);

        tempFabric.dispose();
      }

      // Save the modified PDF
      const outputBytes = await pdfDoc.save();
      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `edited_${file.name.replace(".pdf", "")}.pdf`;
      a.click();

      URL.revokeObjectURL(url);

      console.log("[Export] PDF export completed successfully!");
      alert("PDF exported successfully!");

    } catch (err) {
      console.error("[Export] Failed:", err);
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
            <label className="px-4 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all">
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
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
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
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              tool === "select"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Select
          </button>

          <button
            onClick={() => {
              addText();
            }}
            className="px-4 py-2 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            Add Text
          </button>

          <button
            onClick={() => {
              setTool("draw");
              applyToolMode(activePage, "draw");
            }}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              tool === "draw"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Draw
          </button>

          <button
            onClick={() => {
              setTool("highlight");
              applyToolMode(activePage, "highlight");
            }}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              tool === "highlight"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Highlight
          </button>

          <button
            onClick={() => {
              setTool("eraser");
              applyToolMode(activePage, "eraser");
            }}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              tool === "eraser"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Eraser
          </button>

          <label className="px-4 py-2 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-all">
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
            className="px-4 py-2 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-md"
          >
            Delete
          </button>

          <div className="ml-auto flex gap-2 items-center flex-wrap">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Font Size
              </label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                placeholder="Font"
                min="8"
                max="72"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Pen Size
              </label>
              <input
                type="number"
                value={penSize}
                onChange={(e) => setPenSize(Number(e.target.value))}
                className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                placeholder="Pen"
                min="1"
                max="20"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Eraser Size
              </label>
              <input
                type="number"
                value={eraserSize}
                onChange={(e) => setEraserSize(Number(e.target.value))}
                className="w-20 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                placeholder="Eraser"
                min="10"
                max="100"
              />
            </div>
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
                        ? "border-blue-500 bg-blue-50 dark:bg-gray-700 shadow-md"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-2">
                      Page {p.pageNumber}
                    </div>
                    <img
                      src={p.dataUrl}
                      className="w-full rounded-lg"
                      alt={`Page ${p.pageNumber}`}
                    />
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