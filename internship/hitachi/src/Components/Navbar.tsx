import React from "react";
import { useNavigate } from "react-router-dom";
import { PenSquare, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { Button } from "./Button";

interface NavbarProps {
  onNewPost?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewPost }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("authToken");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold text-gray-900">Blog Platform</h1>
          <div className="flex items-center space-x-4">
            {onNewPost && (
              <Button onClick={onNewPost} className="flex items-center">
                <PenSquare className="h-4 w-4 mr-2" />
                New Post
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout} className="flex items-center text-gray-700">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
