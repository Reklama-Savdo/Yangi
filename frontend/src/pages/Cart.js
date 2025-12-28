import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <main className="pt-20 min-h-screen" data-testid="cart-page">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-[#7BA4D0] mx-auto mb-6 opacity-50" />
            <h1 className="font-heading font-black text-3xl text-[#E7F0FA] mb-4">Your Cart is Empty</h1>
            <p className="text-[#7BA4D0] mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products">
              <Button className="bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80 font-bold uppercase tracking-widest rounded-none">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen" data-testid="cart-page">
      {/* Header */}
      <section className="py-16 border-b border-[#2E5E99]/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <span className="text-[#00F0FF] text-sm uppercase tracking-widest mb-2 block">Shopping</span>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-[#E7F0FA]">
            YOUR <span className="text-[#00F0FF]">CART</span>
          </h1>
          <p className="text-[#7BA4D0] mt-2">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-6 p-6 bg-[#132D4E] border border-white/5"
                  data-testid={`cart-item-${item.id}`}
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 bg-[#0A1B30] flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[#7BA4D0] text-2xl font-heading font-bold opacity-20">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/products/${item.id}`} className="font-heading font-bold text-lg text-[#E7F0FA] hover:text-[#00F0FF] transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-[#00F0FF] text-sm uppercase tracking-wider mt-1">{item.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#2E5E99]">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-[#E7F0FA] hover:bg-[#2E5E99]/20 rounded-none h-8 w-8"
                          data-testid={`decrease-${item.id}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center text-[#E7F0FA] font-mono text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-[#E7F0FA] hover:bg-[#2E5E99]/20 rounded-none h-8 w-8"
                          data-testid={`increase-${item.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-heading font-bold text-xl text-[#E7F0FA]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-[#7BA4D0] text-sm">${item.price.toFixed(2)} each</p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#FF4D4D] hover:bg-[#FF4D4D]/10"
                        data-testid={`remove-${item.id}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#132D4E] border border-white/5 p-8 sticky top-24">
                <h2 className="font-heading font-bold text-xl text-[#E7F0FA] mb-6">Order Summary</h2>
                
                <div className="space-y-4 pb-6 border-b border-[#2E5E99]/30">
                  <div className="flex justify-between text-[#7BA4D0]">
                    <span>Subtotal</span>
                    <span className="text-[#E7F0FA]">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#7BA4D0]">
                    <span>Shipping</span>
                    <span className="text-[#00F0FF]">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between py-6 border-b border-[#2E5E99]/30">
                  <span className="font-heading font-bold text-lg text-[#E7F0FA]">Total</span>
                  <span className="font-heading font-black text-2xl text-[#00F0FF]">${cartTotal.toFixed(2)}</span>
                </div>

                <Link to="/checkout">
                  <Button 
                    className="w-full mt-6 bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80 font-bold uppercase tracking-widest rounded-none glow-hover h-12"
                    data-testid="proceed-to-checkout"
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Link to="/products">
                  <Button 
                    variant="ghost"
                    className="w-full mt-4 text-[#7BA4D0] hover:text-[#E7F0FA] hover:bg-[#2E5E99]/20"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
