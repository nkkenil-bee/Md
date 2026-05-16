import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  LogOut, 
  Settings, 
  Users,
  Menu, 
  X,
  FolderKanban
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "../components/UI.tsx";

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean, key?: string }) => (
  <Link 
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
      active 
        ? "bg-indigo-50 text-indigo-600 shadow-sm" 
        : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
    }`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className="text-sm">{label}</span>
  </Link>
);

const Navbar = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
      <button onClick={onToggleSidebar} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
        <Menu size={24} />
      </button>
      
      <div className="flex items-center gap-4 ml-auto">
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800 leading-none mb-0.5">{user?.name}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{user?.role}</p>
          </div>
          <Badge color="indigo" className="h-fit">Admin</Badge>
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/projects", icon: Briefcase, label: "Projects" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
    { to: "/team", icon: Users, label: "Team Members" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Desktop - Fixed width 240px */}
      <aside className="hidden lg:flex w-[240px] bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-8 pb-10">
          <Link to="/" className="flex items-center gap-3 font-extrabold text-xl tracking-tight text-indigo-600">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
              <FolderKanban size={18} />
            </div>
            <span>SyncTeam</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map(item => (
            <SidebarItem 
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to))}
            />
          ))}
        </nav>

        <div className="p-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
            <p className="text-sm font-bold text-slate-800">Enterprise Pro</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[240px] bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 font-extrabold text-xl tracking-tight text-indigo-600">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <FolderKanban size={18} />
                  </div>
                  <span>SyncTeam</span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 space-y-1.5 mt-4">
                {navItems.map(item => (
                  <SidebarItem 
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    active={location.pathname === item.to}
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
