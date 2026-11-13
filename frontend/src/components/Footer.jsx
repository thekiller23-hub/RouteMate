import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, ShieldCheck, Heart, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal-900 border-t border-charcoal-800 text-charcoal-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-charcoal-950">
                <Navigation className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Route<span className="text-brand-400">Mate</span>
              </span>
            </Link>
            <p className="text-charcoal-300 leading-relaxed text-sm max-w-sm">
              Your Journey. Their Need. Your Reward. Connecting people needing products from across cities with travellers already going that way.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Travellers & Secure OTP Handover</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/how-it-works" className="hover:text-brand-400 transition-colors">How It Works</Link></li>
              <li><Link to="/explore-products" className="hover:text-brand-400 transition-colors">Explore Requests</Link></li>
              <li><Link to="/product-cinema" className="hover:text-brand-400 transition-colors">Product Exploration</Link></li>
              <li><Link to="/become-traveller" className="hover:text-brand-400 transition-colors">Become a Traveller</Link></li>
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Create Request</Link></li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Trust & Safety</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">Safety Guidelines</Link></li>
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">Prohibited Items</Link></li>
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">Identity Verification</Link></li>
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@routemate.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+91 1800-ROUTEMATE</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Hyderabad, Telangana, India</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-4">
          <p>© {new Date().getFullYear()} RouteMate Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with emerald precision & peer-to-peer trust.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

