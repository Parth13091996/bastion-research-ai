import { Link, useLocation } from "react-router-dom";
import PDFViewer from "@/lib/PDFViewer";

type LocationState = {
  url?: string;
} | null;

const PdfViewerPage = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const url = state?.url;

  if (!url) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">No PDF URL provided.</p>
        <Link to=".." relative="path" className="text-blue-600 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="p-0">
      <PDFViewer pdfUrl={url} />
    </div>
  );
};

export default PdfViewerPage;

