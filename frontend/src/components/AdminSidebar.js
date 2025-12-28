import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, BarChart3, LogOut, Home, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, admin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 min-h-screen bg-[#0A1B30] border-r border-[#2E5E99]/30 flex flex-col" data-testid="admin-sidebar">
      <div className="p-6 border-b border-[#2E5E99]/30">
        <Link to="/admin" className="flex items-center space-x-2">
          <span className="font-heading font-black text-xl text-[#E7F0FA]">
            REKLAMA <span className="text-[#00F0FF]">SAVDO</span>
          </span>
        </Link>
        <p className="text-[#7BA4D0] text-xs mt-2 uppercase tracking-wider">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            data-testid={`admin-nav-${item.label.toLowerCase()}`}
            className={`flex items-center space-x-3 px-4 py-3 rounded-sm transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-[#2E5E99] text-[#E7F0FA] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-[#7BA4D0] hover:bg-[#132D4E] hover:text-[#E7F0FA]'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#2E5E99]/30 space-y-4">
        <div className="px-4 py-2">
          <p className="text-[#E7F0FA] font-medium text-sm">{admin?.name}</p>
          <p className="text-[#7BA4D0] text-xs">{admin?.email}</p>
        </div>
        
        <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-[#7BA4D0] hover:bg-[#132D4E] hover:text-[#E7F0FA] rounded-sm transition-all">
          <Home className="h-5 w-5" />
          <span className="font-medium">View Store</span>
        </Link>
        
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-[#FF4D4D] hover:bg-[#FF4D4D]/10 hover:text-[#FF4D4D]"
          data-testid="admin-logout"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
