import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A1B30] border-t border-[#2E5E99]/30 mt-auto" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-heading font-black text-xl text-[#E7F0FA]">
              REKLAMA <span className="text-[#00F0FF]">SAVDO</span>
            </h3>
            <p className="text-[#7BA4D0] text-sm leading-relaxed">
              We make them notice. Premium advertising signage and digital printing materials for businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-[#E7F0FA] uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Products', 'About', 'Contact'].map((link) => (
                <li key={link}>
                  <Link
                    to={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
                    className="text-[#7BA4D0] hover:text-[#00F0FF] text-sm transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-[#E7F0FA] uppercase tracking-wider text-sm">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-[#7BA4D0] text-sm">
                <Mail className="h-4 w-4 text-[#00F0FF]" />
                <span>reklamasavdo4@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3 text-[#7BA4D0] text-sm">
                <Phone className="h-4 w-4 text-[#00F0FF]" />
                <span>+998 (98) 177 36 33</span>
              </li>
              <li className="flex items-center space-x-3 text-[#7BA4D0] text-sm">
                <MapPin className="h-4 w-4 text-[#00F0FF]" />
                <span>Andijan, Uzbekistan</span>
              </li>
            </ul>
          </div>

          {/* Admin Access */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-[#E7F0FA] uppercase tracking-wider text-sm">Admin</h4>
            <Link
              to="/admin/login"
              data-testid="admin-login-link"
              className="inline-block text-[#7BA4D0] hover:text-[#00F0FF] text-sm transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>

        <div className="border-t border-[#2E5E99]/30 mt-12 pt-8 text-center">
          <p className="text-[#7BA4D0] text-sm">
            &copy; 2008 REKLAMA SAVDO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
