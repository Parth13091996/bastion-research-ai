import { Bell, FileText } from "lucide-react";

const AnnouncementsUpdates = ({ announcements, setSelectedUpdate }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex sm:items-center items-start gap-2 mb-6">
        <Bell className="w-10 h-10 md:w-6 md:h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Important Announcements and Updates
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {announcements.length === 0 && (
          <div className="col-span-full text-gray-400 text-center py-6 text-sm">
            No announcements or updates yet.
          </div>
        )}
        {announcements.map((u) => (
          <div
            key={u.id}
            onClick={() =>
              setSelectedUpdate({ ...u, updateType: "announcement" })
            }
            className="p-5 bg-gray-50 hover:bg-white border border-gray-200 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                {u.date}
              </span>
              {u.hasPdf && <FileText size={16} className="text-blue-600" />}
            </div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
              {u.heading}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-3">{u.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsUpdates;
