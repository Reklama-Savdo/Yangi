import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Eye, Package } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminOrders() {
  const { getAuthHeader } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: getAuthHeader()
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, null, {
        params: { status },
        headers: getAuthHeader()
      });
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-[#00F0FF]/10 text-[#00F0FF]';
      case 'pending': return 'bg-[#FFD700]/10 text-[#FFD700]';
      case 'cancelled': return 'bg-[#FF4D4D]/10 text-[#FF4D4D]';
      case 'shipped': return 'bg-[#7BA4D0]/10 text-[#7BA4D0]';
      case 'delivered': return 'bg-[#00F0FF]/20 text-[#00F0FF]';
      default: return 'bg-[#7BA4D0]/10 text-[#7BA4D0]';
    }
  };

  const getPaymentColor = (status) => {
    return status === 'paid' ? 'text-[#00F0FF]' : 'text-[#FFD700]';
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0D2440]" data-testid="admin-orders">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-black text-3xl text-[#E7F0FA]">Orders</h1>
            <p className="text-[#7BA4D0]">Manage customer orders</p>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-[#132D4E] border-[#2E5E99]/50 text-[#E7F0FA]" data-testid="status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[#132D4E] border-[#2E5E99]">
              <SelectItem value="all" className="text-[#E7F0FA] focus:bg-[#2E5E99]">All Orders</SelectItem>
              <SelectItem value="pending" className="text-[#E7F0FA] focus:bg-[#2E5E99]">Pending</SelectItem>
              <SelectItem value="confirmed" className="text-[#E7F0FA] focus:bg-[#2E5E99]">Confirmed</SelectItem>
              <SelectItem value="shipped" className="text-[#E7F0FA] focus:bg-[#2E5E99]">Shipped</SelectItem>
              <SelectItem value="delivered" className="text-[#E7F0FA] focus:bg-[#2E5E99]">Delivered</SelectItem>
              <SelectItem value="cancelled" className="text-[#E7F0FA] focus:bg-[#2E5E99]">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="bg-[#132D4E] border border-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2E5E99]/30 hover:bg-transparent">
                <TableHead className="text-[#7BA4D0]">Order ID</TableHead>
                <TableHead className="text-[#7BA4D0]">Customer</TableHead>
                <TableHead className="text-[#7BA4D0]">Total</TableHead>
                <TableHead className="text-[#7BA4D0]">Payment</TableHead>
                <TableHead className="text-[#7BA4D0]">Status</TableHead>
                <TableHead className="text-[#7BA4D0]">Date</TableHead>
                <TableHead className="text-[#7BA4D0] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-[#2E5E99]/30">
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-[#0A1B30] animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-[#2E5E99]/30 hover:bg-[#0A1B30]/50">
                    <TableCell className="font-mono text-[#7BA4D0] text-sm">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-[#E7F0FA] font-medium">{order.customer_name}</p>
                        <p className="text-[#7BA4D0] text-sm">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#00F0FF] font-mono font-bold">
                      ${order.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={getPaymentColor(order.payment_status)}>
                        {order.payment_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className={`w-[130px] h-8 ${getStatusColor(order.status)} border-none`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#132D4E] border-[#2E5E99]">
                          <SelectItem value="pending" className="text-[#FFD700]">Pending</SelectItem>
                          <SelectItem value="confirmed" className="text-[#00F0FF]">Confirmed</SelectItem>
                          <SelectItem value="shipped" className="text-[#7BA4D0]">Shipped</SelectItem>
                          <SelectItem value="delivered" className="text-[#00F0FF]">Delivered</SelectItem>
                          <SelectItem value="cancelled" className="text-[#FF4D4D]">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-[#7BA4D0] text-sm">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                        className="text-[#7BA4D0] hover:text-[#00F0FF] hover:bg-[#00F0FF]/10"
                        data-testid={`view-order-${order.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-[#2E5E99]/30">
                  <TableCell colSpan={7} className="text-center text-[#7BA4D0] py-12">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="bg-[#132D4E] border-[#2E5E99] text-[#E7F0FA] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl flex items-center gap-2">
                <Package className="h-5 w-5 text-[#00F0FF]" />
                Order Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#7BA4D0]">Order ID</p>
                    <p className="font-mono">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-[#7BA4D0]">Date</p>
                    <p>{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-[#7BA4D0]">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#7BA4D0]">Payment</p>
                    <span className={getPaymentColor(selectedOrder.payment_status)}>
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#2E5E99]/30 pt-4">
                  <h4 className="font-heading font-bold mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#7BA4D0]">Name</p>
                      <p>{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-[#7BA4D0]">Email</p>
                      <p>{selectedOrder.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-[#7BA4D0]">Phone</p>
                      <p>{selectedOrder.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-[#7BA4D0]">Address</p>
                      <p>{selectedOrder.customer_address}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#2E5E99]/30 pt-4">
                  <h4 className="font-heading font-bold mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-[#2E5E99]/20">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-[#7BA4D0] text-sm">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-mono text-[#00F0FF]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-[#2E5E99]/30">
                    <span className="font-heading font-bold text-lg">Total</span>
                    <span className="font-heading font-black text-2xl text-[#00F0FF]">
                      ${selectedOrder.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
