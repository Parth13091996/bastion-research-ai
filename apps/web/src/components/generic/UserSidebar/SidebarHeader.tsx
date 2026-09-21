import { ChevronLeft } from "lucide-react";

const SidebarHeader = ({ isCollapsed, toggleSidebar }) => {
  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-gray-700 ${
        isCollapsed ? "justify-center" : ""
      }`}
    >
      {!isCollapsed ? (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <img src={"/media/favicon.webp"} alt="Logo" className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-white">
              Bastion Research
            </h1>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <img src={"/media/favicon.webp"} alt="Logo" className="h-5 w-5" />
          </div>
        </div>
      )}

      <button
        onClick={toggleSidebar}
        className="hidden lg:block"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          className={`h-5 w-5 text-gray-300 transition-transform duration-300 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
};

export default SidebarHeader;
