import React, { useEffect, useRef, useState } from "react";

interface PDFViewerProps {
  pdfUrl: string;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderIdRef = useRef(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const pdfDocRef = useRef<any>(null);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign("/user/app/scratch-pad");
    }
  };

  // Detect zoom changes
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    
    const handleZoomChange = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newZoom = window.devicePixelRatio;
        setZoomLevel(newZoom);
      }, 150); // Debounce to avoid excessive re-renders
    };

    // Listen for resize events (which fire on zoom)
    window.addEventListener('resize', handleZoomChange);
    
    // Initial zoom level
    setZoomLevel(window.devicePixelRatio);

    return () => {
      window.removeEventListener('resize', handleZoomChange);
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    const currentRenderId = ++renderIdRef.current;

    const loadPDFJS = async () => {
      if (typeof window.pdfjsLib === "undefined") {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load PDF.js"));
          document.head.appendChild(script);
        });
      }

      const pdfLib = window.pdfjsLib;
      pdfLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      renderPDF(pdfLib, currentRenderId);
    };

    const renderPDF = async (pdfLib: any, renderId: number) => {
      if (!containerRef.current) return;

      try {
        setLoading(true);
        setError(null);
        containerRef.current.innerHTML = "";

        // Load PDF only once and cache it
        if (!pdfDocRef.current) {
          const loadingTask = pdfLib.getDocument(pdfUrl);
          pdfDocRef.current = await loadingTask.promise;
        }

        const pdf = pdfDocRef.current;
        const isMobile = window.innerWidth < 768;
        const baseScale = isMobile ? 0.9 : 1.5;
        
        // Multiply base scale by zoom level for crisp rendering
        const scale = baseScale * zoomLevel * 2.5;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          if (renderId !== renderIdRef.current) return;

          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale });

          const tempCanvas = document.createElement("canvas");
          const tempContext = tempCanvas.getContext("2d")!;
          tempCanvas.width = viewport.width;
          tempCanvas.height = viewport.height;

          await page.render({
            canvasContext: tempContext,
            viewport,
          }).promise;

          // Crop top and bottom margins
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
              const [r, g, b, a] = [
                imgData.data[i],
                imgData.data[i + 1],
                imgData.data[i + 2],
                imgData.data[i + 3],
              ];
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
              const [r, g, b, a] = [
                imgData.data[i],
                imgData.data[i + 1],
                imgData.data[i + 2],
                imgData.data[i + 3],
              ];
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

          // Wrapper for responsiveness
          const wrapper = document.createElement("div");
          wrapper.className = "pdf-page";
          wrapper.style.position = "relative";
          wrapper.style.width = "100%";
          wrapper.style.display = "flex";
          wrapper.style.justifyContent = "center";
          wrapper.style.scrollSnapAlign = "start";
          wrapper.style.overflow = "hidden";
          wrapper.style.marginBottom = "20px";

          // Canvas styling - scale down to original size for display
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.maxWidth = "920px";
          canvas.style.borderRadius = "6px";
          canvas.style.boxShadow = "0 1px 4px rgba(0,0,0,0.15)";
          canvas.style.backgroundColor = "#fff";
          
          // Scale canvas display size back down while keeping high-res rendering
          canvas.style.imageRendering = "high-quality";

          // 🔒 Transparent overlay to block right-click/save
          const overlay = document.createElement("div");
          overlay.style.position = "absolute";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100%";
          overlay.style.height = "100%";
          overlay.style.background = "rgba(255,255,255,0)";
          overlay.style.cursor = "default";
          overlay.oncontextmenu = (e) => e.preventDefault();

          wrapper.appendChild(canvas);
          wrapper.appendChild(overlay);
          containerRef.current.appendChild(wrapper);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load PDF");
        setLoading(false);
      }
    };

    loadPDFJS();
  }, [pdfUrl, zoomLevel]); // Re-render when zoom changes

  return (
    <div
      className="pdf-viewer"
      onContextMenu={(e) => e.preventDefault()}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        className="w-full flex items-center mb-4"
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "transparent",
          padding: "10px 0",
          zIndex: 20,
        }}
      >
        <button
          onClick={handleGoBack}
          className="text-xs px-3 py-1 bg-white border border-gray-300 rounded shadow-md text-blue-900 font-medium cursor-pointer hover:bg-gray-50"
          aria-label="Go back"
        >
          ← Go Back
        </button>
      </div>

      {loading && (
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
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      />
    </div>
  );
};

export default PDFViewer;