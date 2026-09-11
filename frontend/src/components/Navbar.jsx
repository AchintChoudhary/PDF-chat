import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, LogOut, User, FileText, Database, Activity } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.get('/health');
        setApiStatus('online');
      } catch (err) {
        setApiStatus('offline');
      }
    };
    checkHealth();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-[#0b0f19]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
        
        {/* Brand Identity */}
        <div className="flex min-w-0 items-center space-x-2 sm:space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">PDF Insight Chat</span>
              <span className="hidden rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20 sm:inline-block">
                MERN + RAG
              </span>
            </div>
            <p className="hidden text-[11px] text-gray-400 sm:block">Intelligent PDF Question Answering</p>
          </div>
        </div>

        {/* Status & User Controls */}
        <div className="flex shrink-0 items-center space-x-2 sm:space-x-4">
          
          {/* API Health Indicator */}
          <div className="hidden sm:flex items-center space-x-2 rounded-full bg-gray-900/80 border border-gray-800 px-3 py-1 text-xs">
            <Activity className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-400">API Status:</span>
            <span className="flex items-center space-x-1 font-medium">
              <span className={`h-2 w-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className={apiStatus === 'online' ? 'text-emerald-400' : 'text-rose-400'}>
                {apiStatus === 'online' ? 'Connected' : 'Offline'}
              </span>
            </span>
          </div>

          {user && (
            <div className="flex items-center space-x-3">
              <div className="flex max-w-[120px] items-center space-x-2 rounded-lg bg-gray-800/60 border border-gray-700/50 px-2 py-1.5 text-xs text-gray-200 sm:max-w-none sm:px-3">
                <User className="h-3.5 w-3.5 text-blue-400" />
                <span className="truncate font-semibold">{user.name}</span>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="flex items-center space-x-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-400 transition hover:bg-rose-500/20 hover:border-rose-500/40"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
