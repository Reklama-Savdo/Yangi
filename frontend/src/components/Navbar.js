import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const { t, language, changeLanguage } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/products', label: t('nav_products') },
    { href: '/about', label: t('nav_about') },
    { href: '/contact', label: t('nav_contact') },
  ];

  const isActive = (path) => location.pathname === path;
  const currentLang = languages.find(l => l.code === language);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#0D2440]/80 border-b border-white/5" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <span className="font-heading font-black text-2xl text-[#E7F0FA] tracking-tight">
              REKLAMA <span className="text-[#00F0FF]">SAVDO</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-${link.href.replace('/', '') || 'home'}`}
                className={`text-sm font-medium uppercase tracking-widest transition-colors duration-300 ${
                  isActive(link.href)
                    ? 'text-[#00F0FF]'
                    : 'text-[#7BA4D0] hover:text-[#E7F0FA]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Language, Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-[#E7F0FA] hover:text-[#00F0FF] hover:bg-[#2E5E99]/20" data-testid="language-switcher">
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{currentLang?.name}</span>
                  <span className="sm:hidden">{currentLang?.flag}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#132D4E] border-[#2E5E99]">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`cursor-pointer ${language === lang.code ? 'text-[#00F0FF]' : 'text-[#E7F0FA]'} hover:bg-[#2E5E99] focus:bg-[#2E5E99]`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/cart" data-testid="cart-button" className="relative">
              <Button variant="ghost" size="icon" className="text-[#E7F0FA] hover:text-[#00F0FF] hover:bg-[#2E5E99]/20">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#00F0FF] text-[#0D2440] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <button
              className="md:hidden text-[#E7F0FA]"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/5 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`mobile-nav-${link.href.replace('/', '') || 'home'}`}
                onClick={() => setIsOpen(false)}
                className={`block py-3 text-sm font-medium uppercase tracking-widest ${
                  isActive(link.href)
                    ? 'text-[#00F0FF]'
                    : 'text-[#7BA4D0]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
