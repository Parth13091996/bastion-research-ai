import React, { useEffect, useRef, useState } from "react";

interface PDFViewerProps {
  pdfUrl: string;
}

declare global {
  const pdfjsLib: any;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unique render token
  const renderIdRef = useRef(0);

  // Go Back button handler
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // fallback, e.g. redirect to dashboard route
      window.location.assign("/user/app/scratch-pad");
    }
  };

  useEffect(() => {
    const currentRenderId = ++renderIdRef.current; // increment for each PDF load

    const loadPDFJS = async () => {
      if (typeof (window as any).pdfjsLib === "undefined") {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load PDF.js"));
          document.head.appendChild(script);
        });
      }

      const pdfLib = (window as any).pdfjsLib;
      pdfLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      renderPDF(pdfLib, currentRenderId);
    };

    const renderPDF = async (pdfLib: any, renderId: number) => {
      if (!containerRef.current) return;

      try {
        setLoading(true);
        setError(null);
        containerRef.current.innerHTML = ""; // clear container

        const loadingTask = pdfLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          // Stop if another render started
          if (renderId !== renderIdRef.current) return;

          const page = await pdf.getPage(pageNumber);
          const scale = 1.5;
          const viewport = page.getViewport({ scale });

          const tempCanvas = document.createElement("canvas");
          const tempContext = tempCanvas.getContext("2d")!;
          tempCanvas.width = viewport.width;
          tempCanvas.height = viewport.height;
          await page.render({ canvasContext: tempContext, viewport }).promise;

          // Crop top & bottom margins
          const imgData = tempContext.getImageData(
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
          );
          let top = 0,
            bottom = tempCanvas.height - 1,
            foundTop = false;

          for (let y = 0; y < tempCanvas.height; y++) {
            for (let x = 0; x < tempCanvas.width; x++) {
              const i = (y * tempCanvas.width + x) * 4;
              const r = imgData.data[i],
                g = imgData.data[i + 1],
                b = imgData.data[i + 2],
                a = imgData.data[i + 3];
              if (!(r > 240 && g > 240 && b > 240) && a > 0) {
                top = y;
                foundTop = true;
                break;
              }
            }
            if (foundTop) break;
          }

          for (let y = tempCanvas.height - 1; y >= 0; y--) {
            for (let x = 0; x < tempCanvas.width; x++) {
              const i = (y * tempCanvas.width + x) * 4;
              const r = imgData.data[i],
                g = imgData.data[i + 1],
                b = imgData.data[i + 2],
                a = imgData.data[i + 3];
              if (!(r > 240 && g > 240 && b > 240) && a > 0) {
                bottom = y;
                break;
              }
            }
            if (bottom < tempCanvas.height - 1) break;
          }

          const croppedHeight = bottom - top + 1;
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.width = tempCanvas.width;
          canvas.height = croppedHeight;
          context.drawImage(
            tempCanvas,
            0,
            top,
            tempCanvas.width,
            croppedHeight,
            0,
            0,
            tempCanvas.width,
            croppedHeight
          );

          containerRef.current.appendChild(canvas);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load PDF");
        setLoading(false);
      }
    };

    loadPDFJS();
  }, [pdfUrl]);

  return (
    <div
      className="pdf-viewer"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Header: Go Back Button and Title Side by Side */}
      <div
        className="flex flex-row items-center w-full mb-5 relative"
        style={{ minHeight: 40 }}
      >
        <button
          onClick={handleGoBack}
          className="absolute left-0 text-xs px-3 py-1 bg-transparent border-none text-blue-900 font-medium cursor-pointer"
          aria-label="Go back"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          ← Go Back
        </button>
        <div className="w-full flex justify-center">
          <h1 className="m-0 text-center">📄 PDF Viewer</h1>
        </div>
      </div>

      {loading && (
        // <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          maxWidth: "920px",
          width: "100%",
        }}
      />
    </div>
  );
};

export default PDFViewer;
