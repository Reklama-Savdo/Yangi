import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.quantity <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    if (quantity > product.quantity) {
      toast.error(`Only ${product.quantity} items available`);
      return;
    }
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart`);
  };

  if (loading) {
    return (
      <main className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-[#132D4E] animate-pulse aspect-square"></div>
            <div className="space-y-4">
              <div className="h-8 bg-[#132D4E] animate-pulse w-1/4"></div>
              <div className="h-12 bg-[#132D4E] animate-pulse w-3/4"></div>
              <div className="h-24 bg-[#132D4E] animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 text-center">
          <h1 className="font-heading font-bold text-2xl text-[#E7F0FA] mb-4">Product Not Found</h1>
          <Link to="/products">
            <Button className="bg-[#2E5E99] hover:bg-[#2E5E99]/80">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {/* Back Button */}
        <Link to="/products" className="inline-flex items-center text-[#7BA4D0] hover:text-[#00F0FF] mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square bg-[#132D4E] border border-white/5 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-[#7BA4D0] opacity-20" />
              </div>
            )}
            {product.quantity <= 0 && (
              <div className="absolute inset-0 bg-[#0D2440]/80 flex items-center justify-center">
                <span className="text-[#FF4D4D] font-bold uppercase tracking-wider text-xl">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-[#00F0FF] text-sm uppercase tracking-widest">
                {product.category}
              </span>
              {product.sku && (
                <span className="text-[#7BA4D0] text-sm font-mono ml-4">
                  SKU: {product.sku}
                </span>
              )}
            </div>
            
            <h1 className="font-heading font-black text-3xl md:text-4xl text-[#E7F0FA]" data-testid="product-title">
              {product.name}
            </h1>
            
            <p className="text-[#7BA4D0] text-lg leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center space-x-4">
              <span className="font-heading font-black text-4xl text-[#E7F0FA]" data-testid="product-price">
                ${product.price.toFixed(2)}
              </span>
              <span className={`text-sm px-3 py-1 ${
                product.quantity > 5 
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF]' 
                  : product.quantity > 0 
                    ? 'bg-[#FFD700]/10 text-[#FFD700]' 
                    : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'
              }`}>
                {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.quantity > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-[#7BA4D0]">Quantity:</span>
                <div className="flex items-center border border-[#2E5E99]">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[#E7F0FA] hover:bg-[#2E5E99]/20 rounded-none"
                    data-testid="decrease-quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-[#E7F0FA] font-mono" data-testid="quantity-value">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="text-[#E7F0FA] hover:bg-[#2E5E99]/20 rounded-none"
                    data-testid="increase-quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={product.quantity <= 0}
              className="w-full bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80 font-bold uppercase tracking-widest rounded-none glow-hover disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="add-to-cart-btn"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>

            {/* Product Details */}
            <div className="pt-8 border-t border-[#2E5E99]/30 space-y-4">
              <h3 className="font-heading font-bold text-[#E7F0FA]">Product Details</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[#7BA4D0]">Category</dt>
                  <dd className="text-[#E7F0FA] font-medium">{product.category}</dd>
                </div>
                {product.sku && (
                  <div>
                    <dt className="text-[#7BA4D0]">SKU</dt>
                    <dd className="text-[#E7F0FA] font-mono">{product.sku}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[#7BA4D0]">Availability</dt>
                  <dd className={product.quantity > 0 ? 'text-[#00F0FF]' : 'text-[#FF4D4D]'}>
                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
