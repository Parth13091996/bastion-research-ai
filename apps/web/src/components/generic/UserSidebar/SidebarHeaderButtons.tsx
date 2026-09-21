import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";

const SidebarHeaderButtons = ({ isCollapsed, onExploreWebsite, onLogout }) => {
  return (
    <div
      className={`px-4 py-3 border-b border-gray-700 ${isCollapsed ? "px-2" : ""}`}
    >
      {!isCollapsed ? (
        <div className="flex gap-2">
          <Button
            onClick={onExploreWebsite}
            variant="outline"
            size="sm"
            className="flex-1 bg-[#C4B696] border-gray-600 text-black hover:bg-white hover:text-blue-900 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Explore Website
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="flex-1 bg-[#C00000] border-gray-600 text-white hover:bg-white hover:text-[#C00000] hover:border-600 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            onClick={onExploreWebsite}
            variant="outline"
            size="icon"
            className="w-full bg-transparent border-gray-600 text-white hover:bg-white hover:text-blue-950 transition-colors"
            title="Explore Website"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            size="icon"
            className="w-full bg-transparent border-gray-600 text-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SidebarHeaderButtons;
