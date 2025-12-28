import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import ProductCard from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="pt-20 min-h-screen" data-testid="products-page">
      {/* Header */}
      <section className="py-16 border-b border-[#2E5E99]/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <span className="text-[#00F0FF] text-sm uppercase tracking-widest mb-2 block">Catalog</span>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-[#E7F0FA] mb-6">
            OUR <span className="text-[#00F0FF]">PRODUCTS</span>
          </h1>
          <p className="text-[#7BA4D0] text-lg max-w-2xl">
            Browse our collection of premium advertising signage and digital printing materials.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-[#2E5E99]/30 bg-[#0A1B30]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7BA4D0]" />
              <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-[#132D4E] border-[#2E5E99]/50 text-[#E7F0FA] placeholder:text-[#7BA4D0]/50 h-12 rounded-none focus:border-[#00F0FF]"
                data-testid="product-search"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Filter className="h-5 w-5 text-[#7BA4D0]" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px] bg-[#132D4E] border-[#2E5E99]/50 text-[#E7F0FA] rounded-none h-12" data-testid="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-[#132D4E] border-[#2E5E99]">
                  <SelectItem value="all" className="text-[#E7F0FA] focus:bg-[#2E5E99] focus:text-[#E7F0FA]">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem 
                      key={category} 
                      value={category}
                      className="text-[#E7F0FA] focus:bg-[#2E5E99] focus:text-[#E7F0FA]"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#132D4E] animate-pulse h-96"></div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <p className="text-[#7BA4D0] mb-8">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#7BA4D0] text-lg mb-4">No products found matching your criteria.</p>
              <Button 
                onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                variant="outline"
                className="border-[#2E5E99] text-[#E7F0FA] hover:bg-[#2E5E99]/20"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
