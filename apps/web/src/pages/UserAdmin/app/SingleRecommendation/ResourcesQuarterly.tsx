import { ClipboardList, FileText, Video } from "lucide-react";
import { Link } from "react-router-dom";
const ResourcesQuarterly = ({ stock, setSelectedUpdate }) => {
  const quarterlyUpdates = Array.isArray(stock?.quarterly_update)
    ? stock.quarterly_update.map((item: any, idx: number) => ({
        id: idx,
        date: item.date,
        heading: item.title,
        preview: item.description,
        hasPdf: !!item.pdf_url,
        pdf_url: item.pdf_url,
      }))
    : [];

  const businessNoteAvailable = !!stock?.business_note;
  const quickBiteAvailable = !!stock?.quick_bite;
  const videoAvailable = !!stock?.video;
  const exitRationaleAvailable = !!stock?.exit_rationale;
  return (
    <div className="space-y-6">
      {/* Resources */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
        <div className="space-y-3">
          {/* Dynamically show 'Read Business Understanding Note' only if available */}
          {businessNoteAvailable && (
            <Link
              to="/user/app/pdf-viewer"
              state={{ url: stock.business_note }}
              className="w-full flex justify-center sm:items-center items-start gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 sm:px-6 px-4 py-4 rounded-lg font-semibold shadow-sm"
            >
              <FileText size={18} className="hidden md:inline" />
              {/* Mobile (28px) */}
              <FileText size={28} className="inline md:hidden" />
              Read Business Understanding Note
            </Link>
          )}
          {/* Secondary Resources */}
          <div className="grid grid-cols-3 gap-3">
            {/* Quick Bite */}
            {quickBiteAvailable && (
              <Link
                to="/user/app/pdf-viewer"
                state={{ url: stock.quick_bite }}
                className="flex items-center justify-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition"
              >
                <FileText size={16} />
                Quick Bite
              </Link>
            )}
            {/* Watch Video */}
            {videoAvailable && (
              <a
                href={stock.video}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition"
              >
                <Video size={16} />
                Watch Video
              </a>
            )}
            {/* Exit Rationale */}
            {exitRationaleAvailable && (
              <Link
                to="/user/app/pdf-viewer"
                state={{ url: stock.exit_rationale }}
                className="flex items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition"
              >
                <FileText size={16} />
                Exit Rationale
              </Link>
            )}
          </div>
          {/* Show fallback if none of the dynamic resources exist */}
          {!businessNoteAvailable &&
            !quickBiteAvailable &&
            !videoAvailable &&
            !exitRationaleAvailable && (
              <div className="text-sm text-gray-400 text-center py-6">
                No resources available for this stock.
              </div>
            )}
        </div>
      </div>

      {/* Quarterly Updates */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Quarterly Updates
          </h3>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {quarterlyUpdates.length === 0 && (
            <div className="text-gray-400 text-center py-6 text-sm">
              No quarterly updates yet.
            </div>
          )}
          {quarterlyUpdates.map((u) => (
            <div
              key={u.id}
              onClick={() =>
                setSelectedUpdate({ ...u, updateType: "quarterly" })
              }
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer border border-gray-200 shadow-sm transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                  {u.date}
                </span>
                {u.hasPdf && <FileText size={14} className="text-gray-400" />}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                {u.heading}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">{u.preview}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesQuarterly;
