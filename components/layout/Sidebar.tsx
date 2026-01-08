import React from 'react';
import { BookOpen, BarChart2, Settings, Users, PenTool } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Sessions', icon: BookOpen },
    { id: 'insights', label: 'Class Insights', icon: BarChart2 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'create', label: 'Create Task', icon: PenTool },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col z-20">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                L
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">LARA</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 w-full transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            Settings
        </button>
      </div>
    </aside>
  );
};