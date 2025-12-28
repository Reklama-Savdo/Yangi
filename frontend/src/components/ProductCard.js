import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.quantity <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div 
      className="group bg-[#132D4E] border border-white/5 hover:border-[#00F0FF]/50 transition-all duration-300 overflow-hidden"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#0A1B30]">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[#7BA4D0] text-4xl font-heading font-bold opacity-20">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
          {product.quantity <= 0 && (
            <div className="absolute inset-0 bg-[#0D2440]/80 flex items-center justify-center">
              <span className="text-[#FF4D4D] font-bold uppercase tracking-wider text-sm">Out of Stock</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2440] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <div className="flex space-x-2">
              <Button
                size="sm"
                className="bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80"
                onClick={handleAddToCart}
                data-testid={`add-to-cart-${product.id}`}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/10"
                data-testid={`view-product-${product.id}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[#00F0FF] text-xs uppercase tracking-wider font-medium">
            {product.category}
          </span>
          {product.sku && (
            <span className="text-[#7BA4D0] text-xs font-mono">
              {product.sku}
            </span>
          )}
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-heading font-bold text-[#E7F0FA] text-lg group-hover:text-[#00F0FF] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-[#7BA4D0] text-sm line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-heading font-black text-2xl text-[#E7F0FA]">
            ${product.price.toFixed(2)}
          </span>
          <span className={`text-xs ${product.quantity > 5 ? 'text-[#00F0FF]' : product.quantity > 0 ? 'text-[#FFD700]' : 'text-[#FF4D4D]'}`}>
            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </div>
  );
}
