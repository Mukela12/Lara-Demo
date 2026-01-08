import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onExit: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab, 
  onNavigate,
  onExit 
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 transition-all duration-300">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                L
            </div>
            <span className="font-bold text-lg text-slate-900">LARA</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onExit} className="text-xs">
            Exit Demo
          </Button>
        </header>

        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
};