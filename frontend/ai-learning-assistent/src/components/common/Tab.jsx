import React from "react";

const Tab = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div>
      {/* Tab Navigation */}
      <nav className="flex space-x-6 border-b border-slate-200 relative">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.name
                ? "text-emerald-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>{tab.label}</span>
            {/* Active Indicator */}
            {activeTab === tab.name && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-emerald-600 rounded-full" />
            )}
          </button>
        ))}
      </nav>
      {/* Tab Content */}
      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) => {
          if (tab.name === activeTab) {
            return (
              <div
                key={tab.name}
                className="animate-in fade-in duration-300 ease-in-out" // Smooth fade effect
              >
                {typeof tab.content === "function"
                  ? tab.content()
                  : tab.content}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Tab;
