import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <main className="pt-20 min-h-screen flex items-center" data-testid="payment-cancel-page">
      <div className="max-w-2xl mx-auto px-6 md:px-12 py-24 text-center animate-fade-in">
        <div className="w-24 h-24 bg-[#FF4D4D]/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <XCircle className="h-12 w-12 text-[#FF4D4D]" />
        </div>
        
        <h1 className="font-heading font-black text-4xl text-[#E7F0FA] mb-4">
          Payment <span className="text-[#FF4D4D]">Cancelled</span>
        </h1>
        
        <p className="text-[#7BA4D0] text-lg mb-8">
          Your payment was cancelled. No charges have been made to your account. 
          Your items are still in your cart if you'd like to complete your purchase.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/cart">
            <Button className="bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80 font-bold uppercase tracking-widest rounded-none">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Return to Cart
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="border-[#2E5E99] text-[#E7F0FA] hover:bg-[#2E5E99]/20">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
