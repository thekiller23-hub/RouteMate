import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Navigation, User, Mail, Phone, Lock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: searchParams.get('role') || 'REQUESTER',
    terms_accepted: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && (roleParam === 'REQUESTER' || roleParam === 'TRAVELLER')) {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.terms_accepted) {
      setError('You must accept the terms and safety policy.');
      return;
    }

    setLoading(true);
    try {
      const { dashboard_redirect } = await register(formData);
      navigate(dashboard_redirect, { replace: true });
    } catch (err) {
      const resp = err.response?.data;
      if (resp) {
        if (typeof resp === 'string') setError(resp);
        else {
          const firstKey = Object.keys(resp)[0];
          setError(`${firstKey}: ${Array.isArray(resp[firstKey]) ? resp[firstKey][0] : resp[firstKey]}`);
        }
      } else {
        setError('Registration failed. Please check details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg glass-panel p-8 sm:p-10 rounded-3xl border border-charcoal-800 shadow-2xl relative my-6">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4 border border-brand-500/20 shadow-emerald-glow">
              <Navigation className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create RouteMate Account
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-400 mt-2 font-mono">
              Join India's premier peer-to-peer travel delivery platform
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Type Selection */}
            <div>
              <label className="text-xs font-mono text-charcoal-400 block mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'REQUESTER' })}
                  className={`py-3 px-4 rounded-xl font-semibold text-xs transition-all border ${
                    formData.role === 'REQUESTER'
                      ? 'bg-brand-500 text-charcoal-950 border-brand-400 shadow-emerald-glow'
                      : 'bg-charcoal-900 text-charcoal-300 border-charcoal-700 hover:border-charcoal-600'
                  }`}
                >
                  I am a Requester
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'TRAVELLER' })}
                  className={`py-3 px-4 rounded-xl font-semibold text-xs transition-all border ${
                    formData.role === 'TRAVELLER'
                      ? 'bg-brand-500 text-charcoal-950 border-brand-400 shadow-emerald-glow'
                      : 'bg-charcoal-900 text-charcoal-300 border-charcoal-700 hover:border-charcoal-600'
                  }`}
                >
                  I am a Traveller
                </button>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Priya"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Username & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="priya_s"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-mono text-charcoal-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="priya@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.terms_accepted}
                  onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-brand-500 bg-charcoal-900 border-charcoal-700 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-charcoal-300">
                  I accept the <a href="#terms" className="text-brand-400 hover:underline">Terms of Service</a>,{' '}
                  <a href="#prohibited" className="text-brand-400 hover:underline">Prohibited Items Policy</a>, and consent to peer-to-peer verification protocols.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-sm transition-all shadow-emerald-glow flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Registering Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-charcoal-400">
            Already registered?{' '}
            <Link to="/login" className="text-brand-400 font-semibold hover:underline">
              Log in to your dashboard
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;

