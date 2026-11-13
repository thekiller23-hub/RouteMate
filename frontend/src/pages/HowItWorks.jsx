import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Coins, 
  KeyRound, 
  Clock, 
  Navigation,
  Compass,
  AlertCircle
} from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="py-20 bg-charcoal-900 border-b border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
            The Mechanics of RouteMate
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
            How Peer-to-Peer Travel Delivery Works
          </h1>
          <p className="text-charcoal-300 mt-4 max-w-2xl mx-auto text-base">
            RouteMate bridges the physical gap between products in one city and people in another by matching existing, scheduled travel journeys.
          </p>
        </div>
      </section>

      {/* Requester Journey vs Traveller Journey Comparison */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* For Requesters */}
          <div className="glass-panel p-8 rounded-3xl border border-charcoal-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
                R
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">For Requesters</h3>
                <p className="text-xs text-charcoal-400 font-mono">Need an item from another city?</p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal-800 text-brand-400 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-white text-base">Submit Product Request</h4>
                  <p className="text-sm text-charcoal-300 mt-1">Specify item name, category, pickup city & address, dropoff address, your budget, and delivery reward.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal-800 text-brand-400 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-white text-base">Traveller Matching & Acceptance</h4>
                  <p className="text-sm text-charcoal-300 mt-1">Our Smart Route Engine pairs you with travellers heading your way. Review their profile and rating.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal-800 text-brand-400 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-white text-base">Escrow Deposit Authorization</h4>
                  <p className="text-sm text-charcoal-300 mt-1">Authorize payment into RouteMate Escrow. Money is safely held and not released until delivery.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal-800 text-brand-400 flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-white text-base">Handover & OTP Confirmation</h4>
                  <p className="text-sm text-charcoal-300 mt-1">When the traveller hands you the product, share your private 6-digit OTP code to complete the transaction.</p>
                </div>
              </div>
            </div>

            <Link
              to="/register?role=REQUESTER"
              className="mt-6 w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-center block"
            >
              Start As Requester
            </Link>
          </div>

          {/* For Travellers */}
          <div className="glass-panel p-8 rounded-3xl border border-charcoal-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
                T
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">For Travellers</h3>
                <p className="text-xs text-charcoal-400 font-mono">Already travelling anyway?</p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal-800 text-brand-400 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-white text-base">Publish Your Existing Journey</h4>
                  <p className="text-sm text-charcoal-300 mt-1">Input your origin, destination, intermediate stations, departure time, and carrying capacity in kilograms.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal-800 text-brand-400 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-white text-base">Review Matched Requests</h4>
                  <p className="text-sm text-charcoal-300 mt-1">Browse requests along your travel corridor with 80%+ match scores. Inspect the reward and pickup point.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal-800 text-brand-400 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-white text-base">Collect & Travel</h4>
                  <p className="text-sm text-charcoal-300 mt-1">Pick up the item from the designated shop or seller, mark "Collected", and embark on your journey.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal-800 text-brand-400 flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-white text-base">Input OTP & Receive Payout</h4>
                  <p className="text-sm text-charcoal-300 mt-1">Hand over the parcel, ask customer for the OTP code, enter it in your dashboard, and withdraw your reward!</p>
                </div>
              </div>
            </div>

            <Link
              to="/register?role=TRAVELLER"
              className="mt-6 w-full py-3 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white border border-charcoal-700 font-bold text-center block"
            >
              Start As Traveller
            </Link>
          </div>

        </div>
      </section>

      {/* Safety Matrix */}
      <section className="py-16 bg-charcoal-900 border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-bold text-white">Platform Permitted Items Policy</h3>
            <p className="text-sm text-charcoal-300 mt-2">
              RouteMate is designed exclusively for legal, safe consumer goods, regional foods, handicrafts, and personal items.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-charcoal-950 border border-emerald-500/20">
              <h5 className="font-bold text-brand-400 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span>Permitted Items</span>
              </h5>
              <ul className="text-xs text-charcoal-300 space-y-2 list-disc pl-5">
                <li>Regional sweets, snacks, and packaged foods</li>
                <li>Handicrafts, traditional textiles, and apparel</li>
                <li>Books, stationery, and non-sensitive documents</li>
                <li>Small electronics & sealed accessories</li>
                <li>Over-the-counter non-prescription personal care</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal-950 border border-rose-500/20">
              <h5 className="font-bold text-rose-400 flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5" />
                <span>Strictly Prohibited Items</span>
              </h5>
              <ul className="text-xs text-charcoal-300 space-y-2 list-disc pl-5">
                <li>Hazardous chemicals, flammable substances, explosives</li>
                <li>Illegal drugs, narcotics, and controlled substances</li>
                <li>Firearms, weapons, and ammunition</li>
                <li>Unauthorized prescription medications</li>
                <li>Contraband or undeclared commercial bulk goods</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;

