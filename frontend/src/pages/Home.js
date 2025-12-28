import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Home() {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setFeaturedProducts(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, title: t('feature_quality'), description: t('feature_quality_desc') },
    { icon: Shield, title: t('feature_durability'), description: t('feature_durability_desc') },
    { icon: Clock, title: t('feature_delivery'), description: t('feature_delivery_desc') },
  ];

  return (
    <main className="pt-20" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 grid-pattern"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1580747182688-aa1f07847e8c?crop=entropy&cs=srgb&fm=jpg&q=85)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D2440] via-[#0D2440]/80 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-block px-4 py-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-sm uppercase tracking-widest mb-6">
              {t('hero_badge')}
            </span>
            <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl text-[#E7F0FA] leading-tight mb-6">
              {t('hero_title')} <span className="text-[#00F0FF]">{t('hero_title_accent')}</span>
            </h1>
            <p className="text-[#7BA4D0] text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              {t('hero_description')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button 
                  size="lg" 
                  className="bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80 font-bold uppercase tracking-widest rounded-none glow-hover"
                  data-testid="hero-cta"
                >
                  {t('hero_cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-[#2E5E99] text-[#E7F0FA] hover:bg-[#2E5E99]/20 hover:border-[#00F0FF] uppercase tracking-widest rounded-none"
                >
                  {t('hero_contact')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-y border-[#2E5E99]/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group p-8 bg-[#132D4E] border border-white/5 hover:border-[#00F0FF]/30 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-[#00F0FF]/10 flex items-center justify-center mb-6 group-hover:bg-[#00F0FF]/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-[#00F0FF]" />
                </div>
                <h3 className="font-heading font-bold text-xl text-[#E7F0FA] mb-3">{feature.title}</h3>
                <p className="text-[#7BA4D0]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-[#00F0FF] text-sm uppercase tracking-widest mb-2 block">Our Products</span>
              <h2 className="font-heading font-black text-4xl text-[#E7F0FA]">FEATURED ITEMS</h2>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="text-[#00F0FF] hover:text-[#E7F0FA] hover:bg-[#2E5E99]/20">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#132D4E] animate-pulse h-96"></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#7BA4D0] text-lg">No products available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-[#0D2440] to-[#132D4E]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="font-heading font-black text-4xl md:text-5xl text-[#E7F0FA] mb-6">
            Ready to Make Your Brand <span className="text-[#00F0FF]">Stand Out</span>?
          </h2>
          <p className="text-[#7BA4D0] text-lg mb-8 max-w-2xl mx-auto">
            Get in touch with us today and let's discuss how we can help elevate your advertising presence.
          </p>
          <Link to="/contact">
            <Button 
              size="lg" 
              className="bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80 font-bold uppercase tracking-widest rounded-none glow-hover"
              data-testid="cta-contact"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
