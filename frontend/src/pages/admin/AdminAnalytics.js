import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, ShoppingBag, DollarSign } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminAnalytics() {
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

  const COLORS = ['#00F0FF', '#2E5E99', '#7BA4D0', '#FFD700', '#FF4D4D'];

  const categoryData = analytics ? Object.entries(analytics.category_sales).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  })) : [];

  const orderStatusData = analytics ? [
    { name: 'Pending', value: analytics.pending_orders },
    { name: 'Confirmed', value: analytics.confirmed_orders },
    { name: 'Other', value: analytics.total_orders - analytics.pending_orders - analytics.confirmed_orders }
  ].filter(d => d.value > 0) : [];

  const statCards = analytics ? [
    { icon: Package, label: 'Total Products', value: analytics.total_products, change: '+12%', color: 'text-[#00F0FF]' },
    { icon: ShoppingBag, label: 'Total Orders', value: analytics.total_orders, change: '+8%', color: 'text-[#7BA4D0]' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${analytics.total_revenue.toFixed(2)}`, change: '+15%', color: 'text-[#00F0FF]' },
    { icon: TrendingUp, label: 'Avg Order Value', value: analytics.total_orders > 0 ? `$${(analytics.total_revenue / analytics.total_orders).toFixed(2)}` : '$0', change: '+5%', color: 'text-[#FFD700]' },
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A1B30] border border-[#2E5E99] p-3">
          <p className="text-[#E7F0FA] font-medium">{label}</p>
          <p className="text-[#00F0FF] font-mono">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-[#0D2440]" data-testid="admin-analytics">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-heading font-black text-3xl text-[#E7F0FA]">Analytics</h1>
          <p className="text-[#7BA4D0]">Track your store performance</p>
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
                    <span className="text-[#00F0FF] text-sm font-medium">{stat.change}</span>
                  </div>
                  <p className="text-[#7BA4D0] text-sm uppercase tracking-wider">{stat.label}</p>
                  <p className={`font-heading font-black text-3xl ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales by Category */}
              <div className="bg-[#132D4E] border border-white/5 p-6">
                <h2 className="font-heading font-bold text-xl text-[#E7F0FA] mb-6">Sales by Category</h2>
                {categoryData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2E5E99" opacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#7BA4D0', fontSize: 12 }}
                          axisLine={{ stroke: '#2E5E99' }}
                        />
                        <YAxis 
                          tick={{ fill: '#7BA4D0', fontSize: 12 }}
                          axisLine={{ stroke: '#2E5E99' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#00F0FF" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-[#7BA4D0]">
                    No sales data available
                  </div>
                )}
              </div>

              {/* Order Status Distribution */}
              <div className="bg-[#132D4E] border border-white/5 p-6">
                <h2 className="font-heading font-bold text-xl text-[#E7F0FA] mb-6">Order Status</h2>
                {orderStatusData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0A1B30', 
                            border: '1px solid #2E5E99',
                            color: '#E7F0FA'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-[#7BA4D0]">
                    No order data available
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-[#132D4E] border border-white/5 p-6">
                <h3 className="font-heading font-bold text-[#E7F0FA] mb-4">Pending Orders</h3>
                <p className="font-heading font-black text-5xl text-[#FFD700]">{analytics.pending_orders}</p>
                <p className="text-[#7BA4D0] text-sm mt-2">Awaiting processing</p>
              </div>
              
              <div className="bg-[#132D4E] border border-white/5 p-6">
                <h3 className="font-heading font-bold text-[#E7F0FA] mb-4">Low Stock Items</h3>
                <p className="font-heading font-black text-5xl text-[#FF4D4D]">{analytics.low_stock_products.length}</p>
                <p className="text-[#7BA4D0] text-sm mt-2">Products need restocking</p>
              </div>
              
              <div className="bg-[#132D4E] border border-white/5 p-6">
                <h3 className="font-heading font-bold text-[#E7F0FA] mb-4">Confirmed Orders</h3>
                <p className="font-heading font-black text-5xl text-[#00F0FF]">{analytics.confirmed_orders}</p>
                <p className="text-[#7BA4D0] text-sm mt-2">Ready to ship</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
