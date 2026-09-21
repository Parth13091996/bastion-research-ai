import { ExternalLink, FileText, X } from "lucide-react";
import { formatMonthYear } from "./utils";
import { Link } from "react-router-dom";

// Modal component for updates
type RecommendationUpdate = {
    id: number;
    date: string;
    heading: string;
    preview: string;
    hasPdf: boolean;
    pdf_url: string;
  };
  
  type ModalProps = {
    selectedUpdate: RecommendationUpdate | null;
    setSelectedUpdate: (update: RecommendationUpdate | null) => void;
  };
  
  const UpdateModal = ({ selectedUpdate, setSelectedUpdate }: ModalProps) => {
    if (!selectedUpdate) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500 mb-2">
                {formatMonthYear(selectedUpdate?.date)}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {selectedUpdate?.heading}
              </h3>
            </div>
            <button
              onClick={() => setSelectedUpdate(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-6">
              {selectedUpdate?.preview}
            </p>
            {selectedUpdate?.hasPdf && selectedUpdate?.pdf_url && (
              <Link
                to="/user/app/pdf-viewer"
                state={{ url: selectedUpdate.pdf_url }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={18} />
                Open PDF Document
                <ExternalLink size={16} />
              </Link>
            )}
            {selectedUpdate?.hasPdf && !selectedUpdate?.pdf_url && (
              <span className="block text-sm text-gray-400 mt-2">
                PDF is not available for this update.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default UpdateModal