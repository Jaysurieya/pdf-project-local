// import { useEffect, useState, useRef } from "react";
// import pdfjsLib from "../../lib/pdf";
// import { jsPDF } from "jspdf";
// import RedactionBox from "./RedactionBox";

// export default function RedactPdfPreview({ file }) {
//   const [pages, setPages] = useState([]);
//   const [textItems, setTextItems] = useState([]);
//   const [rects, setRects] = useState([]);
//   const [activeRect, setActiveRect] = useState(null);
//   const [pageSizes, setPageSizes] = useState([]);

//   const canvasRefs = useRef([]);

//   useEffect(() => {
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = async () => {
//       const pdf = await pdfjsLib
//         .getDocument({ data: new Uint8Array(reader.result) })
//         .promise;

//       const pageImages = [];
//       const extractedItems = [];
//       const sizes = [];

//       for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//         const page = await pdf.getPage(pageNum);
//         const viewport = page.getViewport({ scale: 1.5 });

//         sizes.push({ width: viewport.width, height: viewport.height });

//         // Render page
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");
//         canvas.width = viewport.width;
//         canvas.height = viewport.height;

//         await page.render({ canvasContext: ctx, viewport }).promise;
//         pageImages.push(canvas.toDataURL());

//         // TEXT EXTRACTION WITH CORRECT TRANSFORM
//         const text = await page.getTextContent();

//         text.items.forEach((t) => {
//           const transform = pdfjsLib.Util.transform(viewport.transform, t.transform);

//           const x = transform[4];
//           const y = transform[5] - (t.height * viewport.scale);

//           extractedItems.push({
//             page: pageNum - 1,
//             text: t.str,
//             x,
//             y,
//             width: t.width * viewport.scale,
//             height: t.height * viewport.scale
//           });
//         });
//       }

//       setPages(pageImages);
//       setTextItems(extractedItems);
//       setPageSizes(sizes);
//     };

//     reader.readAsArrayBuffer(file);
//   }, [file]);

//   // SEARCH → SET RECTS
//   // SEARCH → SET RECTS
// const handleSearch = (query) => {
//   if (!query) return setRects([]);

//   const q = query.toLowerCase();
//   const results = [];

//   textItems.forEach((item) => {
//     const text = item.text.toLowerCase();

//     let index = text.indexOf(q);
//     while (index !== -1) {
//       const charWidth = item.width / item.text.length;

//       const x = item.x + index * charWidth;
//       const width = q.length * charWidth;

//       results.push({
//         id: Math.random(),
//         page: item.page,
//         x,
//         y: item.y,
//         width,
//         height: item.height
//       });

//       index = text.indexOf(q, index + 1);
//     }
//   });

//   setRects(results);
// };


//   // BLACKOUT REDACTION
//   const applyRedaction = () => {
//     rects.forEach((r) => {
//       const canvas = canvasRefs.current[r.page];
//       const ctx = canvas.getContext("2d");

//       ctx.fillStyle = "black";
//       ctx.fillRect(r.x, r.y, r.width, r.height);
//     });

//     alert("Redaction Applied!");
//   };

//   // DOWNLOAD
//   const downloadRedactedPdf = () => {
//     const pdf = new jsPDF("p", "px", [800, 1100]);

//     canvasRefs.current.forEach((canvas, idx) => {
//       const img = canvas.toDataURL("image/png");
//       if (idx > 0) pdf.addPage();
//       pdf.addImage(img, "PNG", 0, 0, 800, 1100);
//     });

//     pdf.save("redacted.pdf");
//   };

//   // SERVER EXPORT
//   const sendToBackend = async () => {
//     const fd = new FormData();

//     canvasRefs.current.forEach((canvas) => {
//       const png = canvas.toDataURL("image/png");
//       const byteStr = atob(png.split(",")[1]);
//       const arr = [];
//       for (let i = 0; i < byteStr.length; i++) arr.push(byteStr.charCodeAt(i));
//       fd.append("pages", new Blob([new Uint8Array(arr)], { type: "image/png" }));
//     });

//     const res = await fetch("http://localhost:5000/api/security/redact", {
//       method: "POST",
//       body: fd
//     });

//     const blob = await res.blob();
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "redacted.pdf";
//     a.click();
//   };

//   return (
//     <div className="p-4">

//       <input
//         type="text"
//         placeholder="Search text to redact"
//         onChange={(e) => handleSearch(e.target.value)}
//         className="border p-2 w-full mb-4"
//       />

//       <div className="mb-4 flex gap-3">
//         <button onClick={applyRedaction} className="bg-red-600 text-white px-4 py-2 rounded">
//           Apply Redaction
//         </button>
//         <button onClick={downloadRedactedPdf} className="bg-green-600 text-white px-4 py-2 rounded">
//           Download Redacted PDF
//         </button>
        
//       </div>

//       {pages.map((page, index) => (
//         <div key={index} className="relative mt-4">

//           <canvas
//             ref={(el) => (canvasRefs.current[index] = el)}
//             width={pageSizes[index]?.width}
//             height={pageSizes[index]?.height}
//           />

//           <img
//             src={page}
//             onLoad={(e) => {
//               const canvas = canvasRefs.current[index];
//               const ctx = canvas.getContext("2d");
//               ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);
//             }}
//             style={{ display: "none" }}
//           />

//           {rects
//             .filter((r) => r.page === index)
//             .map((r) => (
//               <RedactionBox
//                 key={r.id}
//                 rect={r}
//                 selected={activeRect === r.id}
//                 onSelect={(id) => setActiveRect(id)}
//                 onChange={(id, updated) => {
//                   if (!updated) return setRects(prev => prev.filter(x => x.id !== id));
//                   setRects(prev => prev.map(x => x.id === id ? updated : x));
//                 }}
//               />
//             ))}
//         </div>
//       ))}
//     </div>
//   );
// }
// #################################################################################
 
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import pdfjsLib from "../../lib/pdf";
import { jsPDF } from "jspdf";
import RedactionBox from "./RedactionBox";

const RedactPdfPreview = forwardRef(({ file }, ref) => {
  const [pages, setPages] = useState([]);
  const [textItems, setTextItems] = useState([]);
  const [rects, setRects] = useState([]);
  const [activeRect, setActiveRect] = useState(null);
  const [pageSizes, setPageSizes] = useState([]);

  const canvasRefs = useRef([]);

  useImperativeHandle(ref, () => ({
    applyRedaction,
    downloadRedactedPdf,
  }));

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(reader.result),
      }).promise;

      const pageImages = [];
      const extracted = [];
      const sizes = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        sizes.push({ width: viewport.width, height: viewport.height });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: canvas.getContext("2d"),
          viewport,
        }).promise;

        pageImages.push(canvas.toDataURL());

        const text = await page.getTextContent();
        text.items.forEach(t => {
          const tr = pdfjsLib.Util.transform(viewport.transform, t.transform);
          extracted.push({
            page: i - 1,
            text: t.str,
            x: tr[4],
            y: tr[5] - t.height * viewport.scale,
            width: t.width * viewport.scale,
            height: t.height * viewport.scale,
          });
        });
      }

      setPages(pageImages);
      setTextItems(extracted);
      setPageSizes(sizes);
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

  const handleSearch = (q) => {
    if (!q) return setRects([]);
    const res = [];

    textItems.forEach(item => {
      let i = item.text.toLowerCase().indexOf(q.toLowerCase());
      while (i !== -1) {
        const cw = item.width / item.text.length;
        res.push({
          id: Math.random(),
          page: item.page,
          x: item.x + i * cw,
          y: item.y,
          width: q.length * cw,
          height: item.height,
        });
        i = item.text.toLowerCase().indexOf(q.toLowerCase(), i + 1);
      }
    });

    setRects(res);
  };

  const applyRedaction = () => {
    rects.forEach(r => {
      const ctx = canvasRefs.current[r.page].getContext("2d");
      ctx.fillStyle = "black";
      ctx.fillRect(r.x, r.y, r.width, r.height);
    });
    setRects([]);
    setActiveRect(null);
  };

  const downloadRedactedPdf = () => {
    const pdf = new jsPDF("p", "px", [800, 1100]);
    canvasRefs.current.forEach((c, i) => {
      const img = c.toDataURL("image/png");
      if (i) pdf.addPage();
      pdf.addImage(img, "PNG", 0, 0, 800, 1100);
    });
    pdf.save("redacted.pdf");
  };

  return (
    <div>
      <input
        placeholder="Search text to redact"
        onChange={(e) => handleSearch(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      {pages.map((p, i) => (
        <div key={i} className="relative mt-4">
          <canvas
            ref={el => (canvasRefs.current[i] = el)}
            width={pageSizes[i]?.width}
            height={pageSizes[i]?.height}
          />
          <img
            src={p}
            style={{ display: "none" }}
            onLoad={e => {
              const ctx = canvasRefs.current[i].getContext("2d");
              ctx.drawImage(e.target, 0, 0);
            }}
          />

          {rects.filter(r => r.page === i).map(r => (
            <RedactionBox
              key={r.id}
              rect={r}
              selected={activeRect === r.id}
              onSelect={setActiveRect}
              onChange={(id, up) =>
                up
                  ? setRects(prev => prev.map(x => x.id === id ? up : x))
                  : setRects(prev => prev.filter(x => x.id !== id))
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
});

export default RedactPdfPreview;


// ###########################################

// import {
//   useEffect,
//   useState,
//   useRef,
//   forwardRef,
//   useImperativeHandle,
// } from "react";
// import pdfjsLib from "../../lib/pdf";
// import { jsPDF } from "jspdf";
// import RedactionBox from "./RedactionBox";

// const RedactPdfPreview = forwardRef(({ file }, ref) => {
//   const [pages, setPages] = useState([]);
//   const [textItems, setTextItems] = useState([]);
//   const [rects, setRects] = useState([]);
//   const [activeRect, setActiveRect] = useState(null);
//   const [pageSizes, setPageSizes] = useState([]);

//   const [searchQuery, setSearchQuery] = useState("");

//   const canvasRefs = useRef([]);
//   const originalImagesRef = useRef([]); // 🔥 to restore

//   useImperativeHandle(ref, () => ({
//     applyRedaction,
//     downloadRedactedPdf,
//     resetRedactions,
//     resetAll,
//   }));

//   useEffect(() => {
//     if (!file) return;

//     // reset everything on new upload
//     resetAll();

//     const reader = new FileReader();
//     reader.onload = async () => {
//       const pdf = await pdfjsLib.getDocument({
//         data: new Uint8Array(reader.result),
//       }).promise;

//       const pageImages = [];
//       const extracted = [];
//       const sizes = [];

//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const viewport = page.getViewport({ scale: 1.5 });

//         sizes.push({ width: viewport.width, height: viewport.height });

//         const canvas = document.createElement("canvas");
//         canvas.width = viewport.width;
//         canvas.height = viewport.height;

//         await page.render({
//           canvasContext: canvas.getContext("2d"),
//           viewport,
//         }).promise;

//         const img = canvas.toDataURL();
//         pageImages.push(img);

//         const text = await page.getTextContent();
//         text.items.forEach((t) => {
//           const tr = pdfjsLib.Util.transform(viewport.transform, t.transform);
//           extracted.push({
//             page: i - 1,
//             text: t.str,
//             x: tr[4],
//             y: tr[5] - t.height * viewport.scale,
//             width: t.width * viewport.scale,
//             height: t.height * viewport.scale,
//           });
//         });
//       }

//       setPages(pageImages);
//       setTextItems(extracted);
//       setPageSizes(sizes);

//       // keep original reference for reset
//       originalImagesRef.current = pageImages;
//     };

//     reader.readAsArrayBuffer(file);
//   }, [file]);

//   const handleSearch = (q) => {
//     setSearchQuery(q);

//     if (!q) return setRects([]);
//     const res = [];

//     const query = q.toLowerCase();

//     textItems.forEach((item) => {
//       const text = item.text.toLowerCase();
//       let i = text.indexOf(query);

//       while (i !== -1) {
//         const cw = item.text.length ? item.width / item.text.length : 0;

//         res.push({
//           id: Math.random(),
//           page: item.page,
//           x: item.x + i * cw,
//           y: item.y,
//           width: q.length * cw,
//           height: item.height,
//         });

//         i = text.indexOf(query, i + 1);
//       }
//     });

//     setRects(res);
//   };

//   const applyRedaction = () => {
//     if (!rects.length) {
//       alert("No redaction boxes found. Search something first.");
//       return;
//     }

//     rects.forEach((r) => {
//       const ctx = canvasRefs.current[r.page]?.getContext("2d");
//       if (!ctx) return;

//       ctx.fillStyle = "black";
//       ctx.fillRect(r.x, r.y, r.width, r.height);
//     });

//     // allow user to search again & redact more
//     setRects([]);
//     setActiveRect(null);
//     setSearchQuery("");
//   };

//   const downloadRedactedPdf = () => {
//     const pdf = new jsPDF("p", "px", [800, 1100]);

//     canvasRefs.current.forEach((c, i) => {
//       const img = c.toDataURL("image/png");
//       if (i) pdf.addPage();
//       pdf.addImage(img, "PNG", 0, 0, 800, 1100);
//     });

//     pdf.save("redacted.pdf");
//   };

//   const resetRedactions = () => {
//     // restore original canvas images
//     canvasRefs.current.forEach((canvas, index) => {
//       const ctx = canvas?.getContext("2d");
//       if (!ctx) return;

//       const img = new Image();
//       img.src = originalImagesRef.current[index];

//       img.onload = () => {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(img, 0, 0);
//       };
//     });

//     setRects([]);
//     setActiveRect(null);
//     setSearchQuery("");
//   };

//   const resetAll = () => {
//     setPages([]);
//     setTextItems([]);
//     setRects([]);
//     setActiveRect(null);
//     setPageSizes([]);
//     setSearchQuery("");
//     canvasRefs.current = [];
//     originalImagesRef.current = [];
//   };

//   return (
//     <div className="w-full">
//       <input
//         placeholder="Search text to redact"
//         value={searchQuery}
//         onChange={(e) => handleSearch(e.target.value)}
//         className="border p-2 w-full mb-4"
//       />

//       {pages.map((p, i) => (
//         <div key={i} className="relative mt-4">
//           <canvas
//             ref={(el) => (canvasRefs.current[i] = el)}
//             width={pageSizes[i]?.width}
//             height={pageSizes[i]?.height}
//           />

//           <img
//             src={p}
//             style={{ display: "none" }}
//             onLoad={(e) => {
//               const canvas = canvasRefs.current[i];
//               const ctx = canvas?.getContext("2d");
//               if (!ctx) return;
//               ctx.drawImage(e.target, 0, 0);
//             }}
//           />

//           {rects
//             .filter((r) => r.page === i)
//             .map((r) => (
//               <RedactionBox
//                 key={r.id}
//                 rect={r}
//                 selected={activeRect === r.id}
//                 onSelect={() => setActiveRect(r.id)}
//                 onChange={(id, up) =>
//                   up
//                     ? setRects((prev) =>
//                         prev.map((x) => (x.id === id ? up : x))
//                       )
//                     : setRects((prev) => prev.filter((x) => x.id !== id))
//                 }
//               />
//             ))}
//         </div>
//       ))}
//     </div>
//   );
// });

// export default RedactPdfPreview;
