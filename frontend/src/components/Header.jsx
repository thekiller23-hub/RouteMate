import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Navigation, 
  Menu, 
  X, 
  ShieldCheck, 
  User, 
  LogOut, 
  LayoutDashboard,
  Compass,
  Package,
  Sparkles
} from 'lucide-react';

const Header = () => {
  const { user, logout, getDashboardPath } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Explore Products', path: '/explore-products' },
    { name: 'Product Cinema', path: '/product-cinema' },
    { name: 'Become a Traveller', path: '/become-traveller' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-charcoal-800/80 bg-charcoal-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-emerald-glow group-hover:scale-105 transition-transform duration-200">
              <Navigation className="w-5 h-5 text-charcoal-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Route<span className="emerald-gradient-text font-extrabold">Mate</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-mono -mt-1">
                P2P Travel Delivery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive(link.path)
                    ? 'text-brand-400 bg-brand-500/10'
                    : 'text-charcoal-300 hover:text-white hover:bg-charcoal-800/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-white text-sm font-medium border border-charcoal-700 transition-all duration-150"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-400" />
                  <span>Dashboard</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-lg text-charcoal-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-charcoal-200 hover:text-white hover:bg-charcoal-800/60 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-500 hover:bg-brand-400 text-charcoal-950 shadow-emerald-glow hover:shadow-emerald-glow-lg transition-all duration-200 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-400 hover:text-white hover:bg-charcoal-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-charcoal-800 bg-charcoal-950 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? 'text-brand-400 bg-brand-500/10'
                  : 'text-charcoal-300 hover:text-white hover:bg-charcoal-800/50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-charcoal-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-lg bg-brand-500 text-charcoal-950 text-center font-semibold"
                >
                  Open Dashboard ({user.role})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-4 rounded-lg text-rose-400 hover:bg-rose-500/10 text-center text-sm font-medium"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-lg text-center font-medium text-charcoal-200 bg-charcoal-800"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-lg text-center font-semibold text-charcoal-950 bg-brand-500"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

