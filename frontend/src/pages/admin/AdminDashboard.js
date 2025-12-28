import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Package, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const { getAuthHeader } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics`, {
        headers: getAuthHeader()
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = analytics ? [
    { icon: Package, label: 'Total Products', value: analytics.total_products, color: 'text-[#00F0FF]' },
    { icon: ShoppingBag, label: 'Total Orders', value: analytics.total_orders, color: 'text-[#7BA4D0]' },
    { icon: DollarSign, label: 'Revenue', value: `$${analytics.total_revenue.toFixed(2)}`, color: 'text-[#00F0FF]' },
    { icon: AlertTriangle, label: 'Pending Orders', value: analytics.pending_orders, color: 'text-[#FFD700]' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-[#0D2440]" data-testid="admin-dashboard">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-heading font-black text-3xl text-[#E7F0FA]">Dashboard</h1>
          <p className="text-[#7BA4D0]">Welcome to REKLAMA SAVDO Admin Panel</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#132D4E] h-32 animate-pulse"></div>
            ))}
          </div>
        ) : analytics && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => (
                <div key={stat.label} className="bg-[#132D4E] border border-white/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <p className="text-[#7BA4D0] text-sm uppercase tracking-wider">{stat.label}</p>
                  <p className={`font-heading font-black text-3xl ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-[#132D4E] border border-white/5 p-6">
                <h2 className="font-heading font-bold text-xl text-[#E7F0FA] mb-4">Recent Orders</h2>
                {analytics.recent_orders.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.recent_orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between pb-4 border-b border-[#2E5E99]/30">
                        <div>
                          <p className="text-[#E7F0FA] font-medium">{order.customer_name}</p>
                          <p className="text-[#7BA4D0] text-sm">{order.customer_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#00F0FF] font-mono">${order.total_amount.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 ${
                            order.status === 'confirmed' ? 'bg-[#00F0FF]/10 text-[#00F0FF]' :
                            order.status === 'pending' ? 'bg-[#FFD700]/10 text-[#FFD700]' :
                            'bg-[#FF4D4D]/10 text-[#FF4D4D]'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#7BA4D0]">No orders yet</p>
                )}
              </div>

              {/* Low Stock Products */}
              <div className="bg-[#132D4E] border border-white/5 p-6">
                <h2 className="font-heading font-bold text-xl text-[#E7F0FA] mb-4">Low Stock Alert</h2>
                {analytics.low_stock_products.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.low_stock_products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between pb-4 border-b border-[#2E5E99]/30">
                        <div>
                          <p className="text-[#E7F0FA] font-medium">{product.name}</p>
                          <p className="text-[#7BA4D0] text-sm">{product.category}</p>
                        </div>
                        <span className={`text-sm font-mono ${
                          product.quantity === 0 ? 'text-[#FF4D4D]' : 'text-[#FFD700]'
                        }`}>
                          {product.quantity} left
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#7BA4D0]">All products are well stocked</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
