import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
