import React from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Menu } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 w-full justify-between">
        {/* Mobile Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md md:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        {/* Spacer for desktop alignment */}
        <div className="hidden md:block"></div>

        {/* Right Actions Side */}
        <div className="flex items-center gap-6">
          {/* User Profile Info Card */}
          <div className="flex items-center border-l border-slate-200 pl-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#00b289] text-white flex items-center justify-center rounded-xl font-medium">
                <User size={18} strokeWidth={2.5} />
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.username || "Alex"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email || "alex@timetoprogram.com"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
