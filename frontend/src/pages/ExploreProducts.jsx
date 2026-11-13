import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Box, 
  Filter, 
  ArrowRight, 
  Calendar,
  Sparkles
} from 'lucide-react';

const ExploreProducts = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Handicrafts & Art', value: 'HANDICRAFTS' },
    { label: 'Food & Sweets', value: 'FOOD_SWEETS' },
    { label: 'Electronics', value: 'ELECTRONICS' },
    { label: 'Fashion & Wear', value: 'FASHION' },
    { label: 'Documents', value: 'DOCUMENTS' },
    { label: 'Other Permitted', value: 'OTHER' },
  ];

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = '/requests/?status=OPEN';
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (selectedCity) url += `&destination_city=${encodeURIComponent(selectedCity)}`;
      
      const res = await api.get(url);
      setRequests(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedCategory, selectedCity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col">
      <Header />

      {/* Header Banner */}
      <section className="py-14 bg-charcoal-900 border-b border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
              Live Delivery Requests
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              Explore Open Requests Looking for Travellers
            </h1>
            <p className="text-charcoal-300 mt-2 text-sm sm:text-base">
              Find requests aligned with your upcoming commute or travel plans. Earn verified rewards by delivering on your route.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <form onSubmit={handleSearchSubmit} className="glass-panel p-4 rounded-2xl border border-charcoal-800 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search product, city (e.g. Warangal, Hyderabad)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white placeholder-charcoal-500 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-sm transition-colors shadow-emerald-glow"
          >
            Filter
          </button>
        </form>
      </section>

      {/* Requests Grid */}
      <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-charcoal-700 border-t-brand-500 animate-spin" />
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="glass-panel rounded-2xl p-6 border border-charcoal-800 hover:border-brand-500/50 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-full h-44 rounded-xl bg-charcoal-800 overflow-hidden mb-4 relative">
                    {req.product_image_url || req.product_image ? (
                      <img
                        src={req.product_image_url || req.product_image}
                        alt={req.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal-500">
                        <Box className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-500 text-charcoal-950 font-mono shadow">
                      Reward: ₹{req.traveller_reward}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-charcoal-400 mb-1">
                    <span className="px-2 py-0.5 rounded bg-charcoal-800 text-brand-300">
                      {req.product_category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>By {req.required_delivery_date}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-400 transition-colors">
                    {req.product_name}
                  </h3>

                  <p className="text-xs text-charcoal-300 line-clamp-2 mb-4">
                    {req.product_description || 'Product requested by verified user on RouteMate.'}
                  </p>

                  {/* Route corridor */}
                  <div className="p-3 rounded-xl bg-charcoal-800/60 border border-charcoal-700/50 mb-4 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-charcoal-200">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="font-semibold text-white">{req.pickup_city}</span>
                      <span className="text-charcoal-400 text-[11px]">({req.pickup_address})</span>
                    </div>
                    <div className="w-0.5 h-2 bg-charcoal-600 ml-1.5" />
                    <div className="flex items-center gap-2 text-charcoal-200">
                      <Navigation className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                      <span className="font-semibold text-white">{req.destination_city}</span>
                      <span className="text-charcoal-400 text-[11px]">({req.destination_address})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-charcoal-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-charcoal-400 block font-mono">Product Budget</span>
                    <span className="text-sm font-semibold text-white font-mono">₹{req.max_budget}</span>
                  </div>

                  <Link
                    to="/login?redirect=/traveller/matches"
                    className="px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-brand-500 hover:text-charcoal-950 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>Accept to Deliver</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel rounded-3xl border border-charcoal-800">
            <Box className="w-12 h-12 text-charcoal-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white">No Matching Requests Found</h4>
            <p className="text-sm text-charcoal-400 mt-1">Try modifying your search or clearing category filters.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default ExploreProducts;

