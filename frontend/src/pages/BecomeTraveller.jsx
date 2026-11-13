import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Coins, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Navigation,
  Train,
  Plane,
  Car
} from 'lucide-react';

const BecomeTraveller = () => {
  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="py-20 bg-charcoal-900 border-b border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
            Monetize Your Routine Travel
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
            Turn Your Existing Journey Into Earnings
          </h1>
          <p className="text-charcoal-300 mt-4 max-w-2xl mx-auto text-base">
            Commuting for university, business trips, or visiting family? Carry a parcel along your route and get paid upon verified OTP delivery.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register?role=TRAVELLER"
              className="px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-sm shadow-emerald-glow transition-all flex items-center gap-2"
            >
              <span>Create Traveller Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Modes of Transport Supported */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel p-8 rounded-3xl border border-charcoal-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Train className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Intercity Rail Commuters</h3>
            <p className="text-sm text-charcoal-300 leading-relaxed">
              Ideal for daily and weekly train passengers (e.g. Warangal ➔ Hyderabad, Mysore ➔ Bangalore). Carry up to 8kg of luggage without extra baggage fees.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-charcoal-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Highway & Road Travellers</h3>
            <p className="text-sm text-charcoal-300 leading-relaxed">
              Driving your car or riding an intercity bus? Offset toll gates and petrol costs by transporting permitted packages in your trunk or back seat.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-charcoal-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Domestic Flight Passengers</h3>
            <p className="text-sm text-charcoal-300 leading-relaxed">
              Flying between metropolitan hubs? Utilize unused cabin luggage space for urgent documents or regional delicacies and earn ₹800 - ₹2,000 per trip.
            </p>
          </div>

        </div>
      </section>

      {/* Earnings Calculator & Guarantee */}
      <section className="py-16 bg-charcoal-900 border-t border-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 glass-panel p-8 rounded-3xl border border-charcoal-700">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white">The RouteMate Payout Guarantee</h3>
            <p className="text-sm text-charcoal-300 mt-1">Guaranteed payments backed by locked escrow funds.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800">
              <div className="text-2xl font-extrabold text-brand-400 font-mono">100%</div>
              <div className="text-xs text-charcoal-300 mt-1">Pre-Authorized Escrow</div>
            </div>
            <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800">
              <div className="text-2xl font-extrabold text-brand-400 font-mono">₹0</div>
              <div className="text-xs text-charcoal-300 mt-1">Listing or Joining Fee</div>
            </div>
            <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800">
              <div className="text-2xl font-extrabold text-brand-400 font-mono">Instant</div>
              <div className="text-xs text-charcoal-300 mt-1">Payout via UPI / IMPS</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeTraveller;

