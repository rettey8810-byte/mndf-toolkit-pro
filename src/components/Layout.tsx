import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wrench, ArrowRightLeft, RotateCcw, WrenchIcon, Users, LogOut, Menu, Bookmark, History } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { currentUser, logout, isSuperAdmin, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', permission: 'viewInventory' },
    { path: '/tools', icon: Wrench, label: 'Tools', permission: 'viewInventory' },
    { path: '/reservations', icon: Bookmark, label: 'Reservations', permission: 'viewInventory' },
    { path: '/issue', icon: ArrowRightLeft, label: 'Issue Tools', permission: 'lendTools' },
    { path: '/receive', icon: RotateCcw, label: 'Receive Tools', permission: 'returnTools' },
    { path: '/maintenance', icon: WrenchIcon, label: 'Maintenance', permission: 'maintenanceAccess' },
    { path: '/staff', icon: Users, label: 'Staff', permission: 'viewInventory' },
    { path: '/audit-logs', icon: History, label: 'Audit Logs', permission: null },
    { path: '/users', icon: Users, label: 'Users', permission: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: left side, Mobile: right side */}
      <aside className={`fixed lg:static inset-y-0 lg:left-0 lg:right-auto right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:-translate-x-full'} lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="MNDF Toolkit Pro" className="w-36 h-36 object-contain" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              if ((item.path === '/users' || item.path === '/audit-logs') && !isSuperAdmin()) return null;
              if (item.permission && !hasPermission(item.permission as any) && !isSuperAdmin()) return null;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-olive-100 text-olive-700' 
                        : 'text-olive-700 hover:bg-olive-50 hover:text-olive-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            <div className="mb-4 px-4">
              <p className="font-medium text-gray-800">{currentUser?.name}</p>
              <p className="text-sm text-gray-500">{currentUser?.email}</p>
              <p className="text-xs text-olive-600 mt-1">
                {currentUser?.role === 'super_admin' ? 'Super Admin' : 'User'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <img src="/logo.png" alt="MNDF" className="w-28 h-28 object-contain" />
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-olive-800 via-olive-700 to-olive-600 border-t border-olive-500 mt-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="h-8 w-auto opacity-90" />
                <div className="text-white/90 font-semibold">MNDF Toolkit Pro</div>
              </div>
              
              {/* Developer Credit */}
              <div className="text-center md:text-left">
                <p className="text-olive-200 text-sm">
                  Developed by <span className="text-cyan-400 font-medium">RettsWebDev</span>
                </p>
                <p className="text-olive-300 text-xs mt-0.5">
                  Since 2016 • Powered by <span className="text-emerald-400">Hawaain 4 Brothers</span>
                </p>
              </div>
              
              {/* Links */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-olive-300 text-xs">v1.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
