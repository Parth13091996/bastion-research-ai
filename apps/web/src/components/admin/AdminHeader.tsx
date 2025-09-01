import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminHeader = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Visit Website</Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
