import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Bell,
  BusFront,
  MapPin,
  Settings,
  LogOut,
  X,
  BadgeCheck
} from 'lucide-react';

export default function SidebarNavigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Listen to the custom event emitted by GovHeader.jsx hamburger menu
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('smartbus:toggle-sidebar', handleToggle);
    return () => window.removeEventListener('smartbus:toggle-sidebar', handleToggle);
  }, []);

  // Close sidebar automatically on route change (mobile mostly)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const menuItems = [
    { name: 'Public Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Universal Alerts', path: '/alerts', icon: Bell },
    { name: 'Track Bus', path: '/map', icon: BusFront },
    { name: 'My Stops', path: '/saved', icon: MapPin },
    { name: 'Preferences', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/welcome');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const displayName = user.name || user.username || 'Authorized User';
  const displayRole = user.role || 'Commuter';

  return (
    <>
      {/* Universal Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside 
        className={`fixed top-0 left-0 h-screen w-[280px] bg-white dark:bg-[#111111] border-r border-slate-200 dark:border-slate-800 flex flex-col z-[70] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Universal Close Action */}
        <button 
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-sm bg-gray-100 dark:bg-gray-800 transition-colors focus:outline-none"
          onClick={() => setIsOpen(false)}
        >
          <X size={20} />
        </button>

        {/* Profile Card Fragment */}
        <div className="p-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-sm bg-gray-50 dark:bg-[#1a1d24] border border-gray-300 dark:border-gray-700 flex items-center justify-center text-lg font-bold text-[#0a3161] dark:text-blue-400 shrink-0 relative">
              {getInitials(displayName)}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-[#111111] rounded-sm flex items-center justify-center pb-[1px] pl-[1px]">
                 <BadgeCheck size={16} className="text-[#10B981]" strokeWidth={2.5} />
              </div>
            </div>
            
            {/* Identity Text */}
            <div className="flex flex-col overflow-hidden">
               <span className="font-[700] text-[15px] text-slate-900 dark:text-white truncate">
                 {displayName}
               </span>
               <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                     {displayRole}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">Verified</span>
               </div>
            </div>
          </div>
        </div>

        {/* Navigation Matrix */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5 scrollbar-thin">
          <div className="text-[10px] font-[800] text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-3 mb-2">Systems</div>
          {menuItems.map((item) => {
             const isActive = location.pathname.includes(item.path);
             const activeClasses = isActive 
               ? "bg-[#0a3161] text-white border-l-4 border-blue-400 font-bold" 
               : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent hover:border-gray-300 dark:hover:border-gray-600 font-medium";
               
             return (
               <button
                 key={item.name}
                 onClick={() => navigate(item.path)}
                 className={`flex items-center gap-3 w-full px-4 py-3 rounded-none transition-all duration-200 outline-none ${activeClasses}`}
               >
                 <item.icon size={20} className={isActive ? "text-white" : "text-gray-400"} strokeWidth={isActive ? 2 : 1.5} />
                 <span className="text-[14px]">{item.name}</span>
               </button>
             );
          })}
        </nav>

        {/* Auth / Operations Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/30">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1d24] text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-bold text-sm"
          >
            <LogOut size={18} strokeWidth={2} />
            End Secure Session
          </button>
          
          <div className="mt-4 flex flex-col items-center justify-center gap-1.5">
             <div className="w-full flex items-center gap-2 px-2">
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
             </div>
             <div className="text-[10px] font-[700] text-slate-400 uppercase tracking-widest opacity-70">
                System undefined protocol
             </div>
          </div>
        </div>

      </aside>
    </>
  );
}
