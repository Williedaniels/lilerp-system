import React from 'react';
import { Badge } from '@/components/ui/badge.jsx';
import { Shield, BarChart3, AlertTriangle, User, LogOut } from 'lucide-react';

const DesktopSidebar = ({ currentScreen, stats, onNavigate, onLogout }) => {
  return (
    <aside className="sm:block w-64 bg-blue-800 text-white flex-shrink-0">
      <div className="flex flex-col h-screen sticky top-0 p-4">
        <div className="flex items-center space-x-3 p-2 mb-6">
          <Shield className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold">LILERP</h1>
            <p className="text-xs text-blue-200">Responder</p>
          </div>
        </div>
        <nav className="flex flex-col space-y-2 flex-1 overflow-y-auto">
          <button
            onClick={() => onNavigate('dashboard', 'overview')}
            className={`flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-blue-700 transition ${
              currentScreen === 'dashboard' ? 'bg-blue-900' : ''
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className={`flex items-center justify-between p-3 rounded-lg text-left hover:bg-blue-700 transition ${
              currentScreen === 'reports' ? 'bg-blue-900' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5" />
              <span>Reports</span>
            </div>
            {stats.pendingReports > 0 && (
              <Badge className="bg-red-500 text-white">{stats.pendingReports}</Badge>
            )}
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-blue-700 transition ${
              currentScreen === 'profile' ? 'bg-blue-900' : ''
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>
        </nav>
        <div className="mt-auto pt-4 border-t border-blue-700">
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-blue-700 transition w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;