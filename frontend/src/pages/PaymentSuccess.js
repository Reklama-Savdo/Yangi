import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      pollPaymentStatus(sessionId);
    }
  }, [searchParams]);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setPaymentStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(`${API}/payments/status/${sessionId}`);
      
      if (response.data.payment_status === 'paid') {
        setPaymentStatus('success');
        setOrderDetails(response.data);
        clearCart();
        return;
      } else if (response.data.status === 'expired') {
        setPaymentStatus('expired');
        return;
      }

      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('error');
    }
  };

  return (
    <main className="pt-20 min-h-screen flex items-center" data-testid="payment-success-page">
      <div className="max-w-2xl mx-auto px-6 md:px-12 py-24 text-center">
        {paymentStatus === 'checking' && (
          <div className="animate-fade-in">
            <div className="w-16 h-16 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="font-heading font-black text-3xl text-[#E7F0FA] mb-4">Processing Payment...</h1>
            <p className="text-[#7BA4D0]">Please wait while we confirm your payment.</p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="animate-fade-in">
            <div className="w-24 h-24 bg-[#00F0FF]/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-12 w-12 text-[#00F0FF]" />
            </div>
            <h1 className="font-heading font-black text-4xl text-[#E7F0FA] mb-4">
              Payment <span className="text-[#00F0FF]">Successful!</span>
            </h1>
            <p className="text-[#7BA4D0] text-lg mb-8">
              Thank you for your purchase! Your order has been confirmed and will be processed shortly.
            </p>
            
            {orderDetails && (
              <div className="bg-[#132D4E] border border-white/5 p-6 mb-8 text-left">
                <h3 className="font-heading font-bold text-[#E7F0FA] mb-4">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-[#7BA4D0]">Amount Paid:</span>
                    <span className="text-[#00F0FF] font-mono">${(orderDetails.amount_total / 100).toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[#7BA4D0]">Status:</span>
                    <span className="text-[#00F0FF]">Confirmed</span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button className="bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80 font-bold uppercase tracking-widest rounded-none">
                  <Package className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="border-[#2E5E99] text-[#E7F0FA] hover:bg-[#2E5E99]/20">
                  Back to Home
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {(paymentStatus === 'error' || paymentStatus === 'timeout') && (
          <div className="animate-fade-in">
            <div className="w-24 h-24 bg-[#FFD700]/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Package className="h-12 w-12 text-[#FFD700]" />
            </div>
            <h1 className="font-heading font-black text-3xl text-[#E7F0FA] mb-4">Payment Status Unknown</h1>
            <p className="text-[#7BA4D0] mb-8">
              We couldn't verify your payment status. Please check your email for confirmation or contact support.
            </p>
            <Link to="/contact">
              <Button className="bg-[#2E5E99] text-[#E7F0FA] hover:bg-[#2E5E99]/80">
                Contact Support
              </Button>
            </Link>
          </div>
        )}

        {paymentStatus === 'expired' && (
          <div className="animate-fade-in">
            <h1 className="font-heading font-black text-3xl text-[#FF4D4D] mb-4">Session Expired</h1>
            <p className="text-[#7BA4D0] mb-8">Your payment session has expired. Please try again.</p>
            <Link to="/cart">
              <Button className="bg-[#2E5E99] text-[#E7F0FA] hover:bg-[#2E5E99]/80">
                Return to Cart
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
