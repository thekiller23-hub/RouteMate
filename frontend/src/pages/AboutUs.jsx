import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Target, Users, Globe, Navigation, Award } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col">
      <Header />

      <section className="py-20 bg-charcoal-900 border-b border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
            About RouteMate
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
            Decentralizing Delivery Through Human Motion
          </h1>
          <p className="text-charcoal-300 mt-4 max-w-2xl mx-auto text-base">
            Millions of people travel between cities every day with empty luggage space, while millions more wait days for expensive courier networks. RouteMate connects them.
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-3xl border border-charcoal-800">
            <Target className="w-10 h-10 text-brand-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
            <p className="text-sm text-charcoal-300 leading-relaxed">
              To make peer-to-peer delivery the fastest, greenest, and most cost-effective way to transport legal goods across any distance without adding vehicles to the road.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-charcoal-800">
            <Users className="w-10 h-10 text-brand-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Community Powered</h3>
            <p className="text-sm text-charcoal-300 leading-relaxed">
              We empower regular commuters, students, and professionals to earn additional income by simply sharing their luggage space safely.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-charcoal-800">
            <ShieldCheck className="w-10 h-10 text-brand-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Trust & Safety First</h3>
            <p className="text-sm text-charcoal-300 leading-relaxed">
              From verified ID badges to escrow payments and cryptographically isolated delivery OTPs, security is the foundation of our entire stack.
            </p>
          </div>
        </div>

        {/* Taglines Banner */}
        <div className="p-8 rounded-3xl bg-charcoal-900 border border-brand-500/30 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            "Your Journey. Their Need. Your Reward."
          </h2>
          <p className="text-sm text-charcoal-300 mt-2 font-mono">
            Travel Smart. Deliver More. Anything from Anywhere.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;

