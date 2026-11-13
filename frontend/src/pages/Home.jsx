import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Sparkles, 
  Navigation, 
  Search,
  KeyRound,
  TrendingUp,
  Box,
  Truck,
  Layers,
  ChevronRight
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollCanvas from '../animations/ScrollCanvas';
import { animationConfig } from '../animations/animationConfig';
import api from '../services/api';

const Home = () => {
  const [featuredRequests, setFeaturedRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/requests/?status=OPEN');
        setFeaturedRequests(res.data.results || res.data || []);
      } catch (err) {
        console.warn('Could not load real requests for homepage showcase:', err);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-300">
      <Header />

      {/* ========================================================
          HERO SECTION & CINEMATIC SCROLL ANIMATION (important/ frames)
          ======================================================== */}
      <section className="relative">
        {/* ScrollCanvas driven by 55 frames from important/ */}
        <ScrollCanvas
          config={animationConfig.hero}
          containerHeight="260vh"
          overlayContent={(progress) => (
            <div className="w-full max-w-7xl mx-auto h-full flex flex-col justify-between py-12 px-4 sm:px-6 pointer-events-none">
              
              {/* Top Banner & Main Headline */}
              <div className="max-w-2xl mt-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-6 backdrop-blur-md pointer-events-auto">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Peer-to-Peer Logistics Revolution</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 drop-shadow-md">
                  Anything From Anywhere.{' '}
                  <span className="emerald-gradient-text block">
                    Delivered By Someone Already Travelling.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed max-w-xl mb-8 drop-shadow">
                  Connect with travellers heading your way. Get products from different locations while helping people turn their existing journeys into extra earnings.
                </p>

                {/* Call to Actions */}
                <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
                  <Link
                    to="/register?role=REQUESTER"
                    className="px-6 py-3.5 rounded-xl font-semibold bg-brand-500 hover:bg-brand-400 text-charcoal-950 shadow-emerald-glow hover:shadow-emerald-glow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <span>Request a Product</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/register?role=TRAVELLER"
                    className="px-6 py-3.5 rounded-xl font-semibold bg-charcoal-800/90 hover:bg-charcoal-700/90 text-white border border-charcoal-700 backdrop-blur-md transition-all duration-200 flex items-center gap-2"
                  >
                    <span>Become a Traveller</span>
                    <Coins className="w-4 h-4 text-brand-400" />
                  </Link>
                </div>
              </div>

              {/* Dynamic scroll progress subtitle indicator */}
              <div className="self-end max-w-md p-4 rounded-xl glass-panel text-right pointer-events-auto border border-charcoal-700/60 shadow-xl">
                <div className="flex items-center justify-end gap-2 text-xs font-mono text-brand-400 uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                  <span>Live Journey Simulation</span>
                </div>
                <p className="text-sm font-medium text-charcoal-100">
                  {progress < 0.35 && "1. Requester posts product requirement across cities."}
                  {progress >= 0.35 && progress < 0.70 && "2. Smart Route Engine matches travellers already on that route."}
                  {progress >= 0.70 && "3. Traveller picks up item, travels, and delivers with OTP verification."}
                </p>
                <div className="text-[11px] text-charcoal-400 mt-2 font-mono">
                  Scroll down to scrub cinematic sequence ({Math.round(progress * 100)}%)
                </div>
              </div>

            </div>
          )}
        />
      </section>

      {/* ========================================================
          HOW ROUTEMATE WORKS SECTION (product_delivery/ frames)
          ======================================================== */}
      <section className="relative py-24 bg-charcoal-900 border-y border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-brand-400 font-mono font-semibold mb-3">
              Frictionless Logistics
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              How RouteMate Works In 3 Simple Steps
            </h3>
            <p className="text-charcoal-300 mt-4 text-base">
              A peer-to-peer delivery platform designed for real travel habits. Not restricted to shops or rigid delivery vans.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            
            <div className="glass-panel p-8 rounded-2xl border border-charcoal-800 hover:border-brand-500/40 transition-colors relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                01
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Request Anything</h4>
              <p className="text-charcoal-300 text-sm leading-relaxed">
                Find and request a product from any permitted location—local bazaars, specialty confectionery, electronics, or personal sellers. Set your budget and reward.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-charcoal-800 hover:border-brand-500/40 transition-colors relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                02
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Match With Travellers</h4>
              <p className="text-charcoal-300 text-sm leading-relaxed">
                Our Smart Route Matching Engine identifies commuters, trains, and flights traveling along that specific corridor. Travellers review the request and accept.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-charcoal-800 hover:border-brand-500/40 transition-colors relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                03
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Deliver & Release Reward</h4>
              <p className="text-charcoal-300 text-sm leading-relaxed">
                The traveller collects the item and delivers it to your destination. Handover is confirmed via a secure 6-digit OTP, instantly releasing the escrow reward.
              </p>
            </div>

          </div>

          {/* Delivery Journey Scroll Animation (product_delivery/ frames) */}
          <div className="rounded-3xl overflow-hidden border border-charcoal-800 bg-charcoal-950 p-2 sm:p-4 shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-charcoal-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-brand-400 uppercase tracking-wider">Step-by-Step Delivery Experience</span>
                <h4 className="text-xl font-bold text-white mt-1">From Pickup to Handover</h4>
              </div>
              <div className="flex items-center gap-2 text-xs text-charcoal-400 font-mono">
                <Truck className="w-4 h-4 text-brand-400" />
                <span>Scroll to scrub delivery journey</span>
              </div>
            </div>

            <ScrollCanvas
              config={animationConfig.delivery}
              containerHeight="200vh"
              overlayContent={(progress) => {
                const stepIdx = Math.min(
                  animationConfig.delivery.steps.length - 1,
                  Math.floor(progress * animationConfig.delivery.steps.length)
                );
                const step = animationConfig.delivery.steps[stepIdx];
                return (
                  <div className="p-6 flex flex-col justify-end h-full">
                    <div className="glass-panel p-5 rounded-2xl max-w-md border border-charcoal-700/70 shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-2 text-xs font-mono text-brand-400 uppercase mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Stage {stepIdx + 1} of 4</span>
                      </div>
                      <h5 className="text-lg font-bold text-white">{step.title}</h5>
                      <p className="text-sm text-charcoal-300 mt-1">{step.desc}</p>
                    </div>
                  </div>
                );
              }}
            />
          </div>

        </div>
      </section>

      {/* ========================================================
          PRODUCT EXPLORATION EXPERIENCE (product_details/ frames)
          Shopify-inspired unboxing, 360 rotation, component reveal
          ======================================================== */}
      <section className="relative py-24 bg-charcoal-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-mono text-brand-400 uppercase tracking-widest font-semibold">
                Shopify-Style Cinema
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
                Cinematic Product Unboxing & Inspection
              </h3>
              <p className="text-charcoal-300 mt-2 max-w-xl text-sm sm:text-base">
                No human characters. Automatic box opening, 360-degree rotation, component-level clarity, and verified condition inspection before transit.
              </p>
            </div>
            
            <Link
              to="/product-cinema"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-brand-300 border border-charcoal-700 text-sm font-medium transition-colors"
            >
              <span>Full Interactive Mode</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-charcoal-800 bg-charcoal-900 overflow-hidden shadow-2xl">
            <ScrollCanvas
              config={animationConfig.product}
              containerHeight="220vh"
              overlayContent={(progress) => {
                const stageIdx = Math.min(
                  animationConfig.product.stages.length - 1,
                  Math.floor(progress * animationConfig.product.stages.length)
                );
                const currentStage = animationConfig.product.stages[stageIdx];
                return (
                  <div className="p-8 flex flex-col justify-between h-full pointer-events-none">
                    <div className="glass-panel px-4 py-2 rounded-full self-start border border-brand-500/20 text-xs font-mono text-brand-400">
                      Automatic Product Reveal • Stage {stageIdx + 1}/4
                    </div>

                    <div className="glass-panel p-6 rounded-2xl max-w-md self-end border border-charcoal-700/80 shadow-2xl backdrop-blur-xl">
                      <span className="text-xs font-mono text-brand-400 uppercase tracking-wider">
                        {currentStage.label}
                      </span>
                      <h4 className="text-xl font-bold text-white mt-1">
                        High-Definition Structural Inspection
                      </h4>
                      <p className="text-sm text-charcoal-300 mt-2">
                        {currentStage.detail}
                      </p>
                      <div className="mt-4 pt-3 border-t border-charcoal-800 flex items-center justify-between text-xs text-charcoal-400">
                        <span>Zero-Character Clean Reveal</span>
                        <span className="text-brand-400 font-mono">100% Authentic Packaging</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>

        </div>
      </section>

      {/* ========================================================
          LIVE OPEN REQUESTS SHOWCASE (Real DB Requests)
          ======================================================== */}
      <section className="py-20 bg-charcoal-900 border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono text-brand-400 uppercase tracking-wider font-semibold">
                Live Marketplace
              </span>
              <h3 className="text-3xl font-bold text-white mt-1">
                Active Requests Looking For Travellers
              </h3>
            </div>

            <Link
              to="/explore-products"
              className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>View All Requests</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingRequests ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-charcoal-700 border-t-brand-500 animate-spin" />
            </div>
          ) : featuredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRequests.slice(0, 6).map((req) => (
                <div
                  key={req.id}
                  className="glass-panel rounded-2xl p-6 border border-charcoal-800 hover:border-brand-500/50 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image / Fallback */}
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
                      <span>By {req.required_delivery_date}</span>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-400 transition-colors">
                      {req.product_name}
                    </h4>

                    <p className="text-xs text-charcoal-300 line-clamp-2 mb-4">
                      {req.product_description}
                    </p>

                    {/* Route Corridor */}
                    <div className="p-3 rounded-xl bg-charcoal-800/60 border border-charcoal-700/50 mb-4 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-charcoal-200">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="font-medium text-white">{req.pickup_city}</span>
                        <span className="text-charcoal-400 text-[11px]">({req.pickup_address})</span>
                      </div>
                      <div className="w-0.5 h-2 bg-charcoal-600 ml-1.5" />
                      <div className="flex items-center gap-2 text-charcoal-200">
                        <Navigation className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                        <span className="font-medium text-white">{req.destination_city}</span>
                        <span className="text-charcoal-400 text-[11px]">({req.destination_address})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-charcoal-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-charcoal-400 block font-mono">Product Budget</span>
                      <span className="text-sm font-semibold text-white">₹{req.max_budget}</span>
                    </div>

                    <Link
                      to={`/login?redirect=/traveller/matches`}
                      className="px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-brand-500 hover:text-charcoal-950 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Deliver This</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-panel rounded-2xl border border-charcoal-800">
              <p className="text-charcoal-400 text-sm">No open requests at the moment.</p>
              <Link to="/register" className="mt-3 inline-block text-brand-400 text-sm font-semibold hover:underline">
                Be the first to post a product request →
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================
          TRAVELLER BENEFITS SECTION
          ======================================================== */}
      <section className="py-24 bg-charcoal-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <span className="text-xs font-mono text-brand-400 uppercase tracking-widest font-semibold">
                Turn Travel Into Income
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
                Offset Your Tickets & Fuel Costs On Journeys You’re Already Taking
              </h3>
              <p className="text-charcoal-300 mt-4 leading-relaxed text-base">
                Whether commuting by train between Warangal and Hyderabad, flying between Bengaluru and Mumbai, or driving on a highway, simply publish your journey. Collect rewards without doing extra trips.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">Zero Dedicated Delivery Routes</h5>
                    <p className="text-xs text-charcoal-300">Only accept requests strictly along your existing commute path.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">Instant Escrow Settlement</h5>
                    <p className="text-xs text-charcoal-300">Money is held safely in escrow and credited to your withdrawable balance the moment OTP is confirmed.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">Flexible Carrying Capacity</h5>
                    <p className="text-xs text-charcoal-300">Carry small 500g parcels or up to 10kg depending on your luggage allowance.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link
                  to="/register?role=TRAVELLER"
                  className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-sm shadow-emerald-glow transition-all inline-flex items-center gap-2"
                >
                  <span>Register As A Traveller</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Callout Card */}
            <div className="glass-panel rounded-3xl p-8 border border-charcoal-800 relative">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-charcoal-800">
                  <span className="text-xs uppercase font-mono text-charcoal-400">Sample Earnings Potential</span>
                  <span className="text-xs px-2.5 py-1 rounded bg-brand-500/20 text-brand-300 font-mono">Real Corridor</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-charcoal-800/50">
                    <div>
                      <div className="text-sm font-semibold text-white">Warangal ➔ Hyderabad</div>
                      <div className="text-xs text-charcoal-400">1x Brass Craft Lamp</div>
                    </div>
                    <span className="text-brand-400 font-mono font-bold">+₹450</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-charcoal-800/50">
                    <div>
                      <div className="text-sm font-semibold text-white">Hyderabad ➔ Bengaluru</div>
                      <div className="text-xs text-charcoal-400">2x Confectionery Boxes</div>
                    </div>
                    <span className="text-brand-400 font-mono font-bold">+₹850</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-charcoal-800/50">
                    <div>
                      <div className="text-sm font-semibold text-white">Karimnagar ➔ Hyderabad</div>
                      <div className="text-xs text-charcoal-400">1x Silver Filigree Box</div>
                    </div>
                    <span className="text-brand-400 font-mono font-bold">+₹550</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Total Travel Earnings</span>
                  <span className="text-xl font-extrabold text-brand-400 font-mono">₹1,850</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          TRUST & SAFETY PROTOCOLS
          ======================================================== */}
      <section className="py-20 bg-charcoal-900 border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ShieldCheck className="w-12 h-12 text-brand-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white tracking-tight">
              Built on Institutional Trust & Security
            </h3>
            <p className="text-charcoal-300 mt-2 text-sm">
              Multiple layers of automated and cryptographic safeguards keep peer deliveries safe, legal, and verified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl glass-panel border border-charcoal-800 text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-white mb-2 text-base">Verified Identities</h5>
              <p className="text-xs text-charcoal-300">Govt ID photo checks & mobile phone verification for every traveller.</p>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-charcoal-800 text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-white mb-2 text-base">Delivery Handover OTP</h5>
              <p className="text-xs text-charcoal-300">Deliveries can only be completed when the customer provides their private 6-digit OTP.</p>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-charcoal-800 text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4">
                <Coins className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-white mb-2 text-base">Escrow Payment Hold</h5>
              <p className="text-xs text-charcoal-300">Requester payment is held securely in escrow until successful physical delivery.</p>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-charcoal-800 text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-white mb-2 text-base">Prohibited Items Filter</h5>
              <p className="text-xs text-charcoal-300">Automated category checks prevent hazardous or illegal item requests.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

