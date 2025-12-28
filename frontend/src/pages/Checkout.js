import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: formData.address
      };

      const orderResponse = await axios.post(`${API}/orders`, orderData);
      const orderId = orderResponse.data.id;

      // Create payment checkout session
      const originUrl = window.location.origin;
      const checkoutResponse = await axios.post(`${API}/payments/checkout`, null, {
        params: { order_id: orderId, origin_url: originUrl }
      });

      // Redirect to Stripe
      window.location.href = checkoutResponse.data.checkout_url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <main className="pt-20 min-h-screen" data-testid="checkout-page">
      {/* Header */}
      <section className="py-16 border-b border-[#2E5E99]/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <span className="text-[#00F0FF] text-sm uppercase tracking-widest mb-2 block">Secure</span>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-[#E7F0FA]">
            <span className="text-[#00F0FF]">CHECKOUT</span>
          </h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Checkout Form */}
            <div className="bg-[#132D4E] border border-white/5 p-8 md:p-12">
              <h2 className="font-heading font-bold text-2xl text-[#E7F0FA] mb-6">Shipping Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#E7F0FA]">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] h-12 rounded-none focus:border-[#00F0FF]"
                    placeholder="John Doe"
                    data-testid="checkout-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#E7F0FA]">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] h-12 rounded-none focus:border-[#00F0FF]"
                    placeholder="john@example.com"
                    data-testid="checkout-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#E7F0FA]">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] h-12 rounded-none focus:border-[#00F0FF]"
                    placeholder="+998 90 123 45 67"
                    data-testid="checkout-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[#E7F0FA]">Shipping Address *</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="bg-[#0A1B30] border-[#2E5E99]/50 text-[#E7F0FA] h-12 rounded-none focus:border-[#00F0FF]"
                    placeholder="123 Main Street, City, Country"
                    data-testid="checkout-address"
                  />
                </div>

                <div className="pt-6 border-t border-[#2E5E99]/30">
                  <div className="flex items-center text-[#7BA4D0] text-sm mb-6">
                    <Lock className="h-4 w-4 mr-2" />
                    Your payment will be securely processed by Stripe
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80 font-bold uppercase tracking-widest rounded-none glow-hover h-14 text-lg"
                    data-testid="pay-now-btn"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <span className="w-5 h-5 border-2 border-[#0D2440] border-t-transparent rounded-full animate-spin mr-2"></span>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay ${cartTotal.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-[#132D4E] border border-white/5 p-8 sticky top-24">
                <h2 className="font-heading font-bold text-xl text-[#E7F0FA] mb-6">Order Summary</h2>
                
                <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-[#2E5E99]/30">
                      <div className="w-16 h-16 bg-[#0A1B30] flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[#7BA4D0] font-heading font-bold opacity-20">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#E7F0FA] font-medium truncate">{item.name}</p>
                        <p className="text-[#7BA4D0] text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[#E7F0FA] font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pb-6 border-b border-[#2E5E99]/30">
                  <div className="flex justify-between text-[#7BA4D0]">
                    <span>Subtotal</span>
                    <span className="text-[#E7F0FA]">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#7BA4D0]">
                    <span>Shipping</span>
                    <span className="text-[#00F0FF]">Free</span>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <span className="font-heading font-bold text-xl text-[#E7F0FA]">Total</span>
                  <span className="font-heading font-black text-2xl text-[#00F0FF]">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
