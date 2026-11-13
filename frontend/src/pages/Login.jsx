import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Navigation, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { dashboard_redirect } = await login(credential, password);
      const destination = location.state?.from?.pathname || dashboard_redirect;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for 1-click test credentials
  const fillDemo = (user, pass) => {
    setCredential(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-charcoal-800 shadow-2xl relative">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4 border border-brand-500/20 shadow-emerald-glow">
              <Navigation className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back to RouteMate
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-400 mt-2 font-mono">
              Sign in to manage requests, journeys & deliveries
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-charcoal-400 block mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-500" />
                <input
                  type="text"
                  required
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="e.g. requester_demo or email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white placeholder-charcoal-600 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-charcoal-400">Password</label>
                <a href="#forgot" className="text-xs text-brand-400 hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white placeholder-charcoal-600 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-sm transition-all shadow-emerald-glow flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts Selector */}
          <div className="mt-8 pt-6 border-t border-charcoal-800">
            <span className="text-[11px] uppercase tracking-wider font-mono text-charcoal-400 block mb-3 text-center">
              Quick 1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => fillDemo('requester_demo', 'Requester@12345')}
                className="py-2 px-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-brand-300 border border-charcoal-700 text-center transition-colors"
              >
                Requester
              </button>
              <button
                type="button"
                onClick={() => fillDemo('traveller_demo', 'Traveller@12345')}
                className="py-2 px-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-emerald-300 border border-charcoal-700 text-center transition-colors"
              >
                Traveller
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin', 'Admin@12345')}
                className="py-2 px-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-purple-300 border border-charcoal-700 text-center transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-charcoal-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-400 font-semibold hover:underline">
              Create an account
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;

