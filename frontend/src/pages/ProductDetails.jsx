import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollCanvas from '../animations/ScrollCanvas';
import { animationConfig } from '../animations/animationConfig';
import { 
  Sparkles, 
  ShieldCheck, 
  RotateCw, 
  Check, 
  ArrowRight, 
  Star, 
  Box, 
  Sliders, 
  Info,
  Maximize2
} from 'lucide-react';

const ProductDetails = () => {
  const [selectedVariant, setSelectedVariant] = useState('Standard');
  const [activeTab, setActiveTab] = useState('specs');
  const [manualScrub, setManualScrub] = useState(0);

  const specifications = [
    { name: 'Packaging Structure', value: 'Custom Quad-Flute Shockproof Box with Magnetic Seal' },
    { name: 'Unboxing Mechanism', value: 'Self-Actuating Tension-Lock Automatic Release' },
    { name: 'Material Composition', value: 'Precision Engineered Anodized Alloy & High-Impact Polymers' },
    { name: 'Inspection Protocol', value: 'Pre-Transit 360° Visual Condition Check by Verified Traveller' },
    { name: 'Transit Seal', value: 'Tamper-Evident Holographic Numbered Band' },
    { name: 'Carrying Weight', value: '1.2 kg (Compliant with Standard Carry-on Baggage)' }
  ];

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col">
      <Header />

      {/* Breadcrumb & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        <div className="flex items-center gap-2 text-xs font-mono text-charcoal-400">
          <Link to="/" className="hover:text-brand-400">Home</Link>
          <span>/</span>
          <Link to="/explore-products" className="hover:text-brand-400">Explore</Link>
          <span>/</span>
          <span className="text-brand-400">Cinematic Product Inspection</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-charcoal-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Shopify-Style Visual Exploration</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Acoustic Studio Monolith Pro
            </h1>
            <p className="text-charcoal-300 mt-2 text-sm sm:text-base max-w-2xl">
              Automatic unboxing, zero-character mechanical rotation, and structural disassembly. Controlled dynamically via scroll scrub or manual scrubber.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-mono text-charcoal-400 uppercase">Estimated Budget</div>
              <div className="text-3xl font-extrabold text-white font-mono">₹4,200</div>
            </div>
            <Link
              to="/register?role=REQUESTER"
              className="px-6 py-3.5 rounded-xl font-bold bg-brand-500 hover:bg-brand-400 text-charcoal-950 shadow-emerald-glow transition-all flex items-center gap-2"
            >
              <span>Request Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Interactive Scroll Canvas Experience */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-6">
        
        {/* Manual Scrub Controller Bar */}
        <div className="p-4 mb-4 glass-panel rounded-2xl border border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-charcoal-300">
            <RotateCw className="w-4 h-4 text-brand-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Interactive 360° Scrub Range:</span>
            <span className="text-brand-400 font-bold">{Math.round(manualScrub * 100)}%</span>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={manualScrub}
              onChange={(e) => setManualScrub(parseFloat(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer h-2 bg-charcoal-800 rounded-lg"
            />
          </div>

          <span className="text-[11px] font-mono text-charcoal-400">
            Or simply scroll page naturally to scrub
          </span>
        </div>

        {/* Cinematic Scroll-Controlled Canvas Container */}
        <div className="rounded-3xl border border-charcoal-800 bg-charcoal-900 overflow-hidden shadow-2xl relative">
          <ScrollCanvas
            config={animationConfig.product}
            progress={manualScrub > 0 ? manualScrub : undefined}
            containerHeight="220vh"
            overlayContent={(progress) => {
              const activeProgress = manualScrub > 0 ? manualScrub : progress;
              const stageIdx = Math.min(
                animationConfig.product.stages.length - 1,
                Math.floor(activeProgress * animationConfig.product.stages.length)
              );
              const currentStage = animationConfig.product.stages[stageIdx];

              return (
                <div className="p-6 md:p-10 flex flex-col justify-between h-full pointer-events-none">
                  {/* Top Badges */}
                  <div className="flex justify-between items-start">
                    <div className="glass-panel px-4 py-2 rounded-xl text-xs font-mono text-brand-400 border border-brand-500/30 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                      <span>{currentStage.label}</span>
                    </div>

                    <div className="glass-panel px-4 py-2 rounded-xl text-xs font-mono text-charcoal-300">
                      Sequence Frame: {Math.min(9, Math.floor(activeProgress * 9) + 1)} / 9
                    </div>
                  </div>

                  {/* Bottom Dynamic Callout */}
                  <div className="glass-panel p-6 rounded-2xl max-w-lg border border-charcoal-700/80 shadow-2xl backdrop-blur-xl">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-brand-400 font-semibold">
                      Automated Visual Verification
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      {currentStage.label}
                    </h3>
                    <p className="text-sm text-charcoal-300 mt-2 leading-relaxed">
                      {currentStage.detail}
                    </p>
                    <div className="mt-4 pt-3 border-t border-charcoal-800 flex items-center justify-between text-xs text-charcoal-400">
                      <span className="flex items-center gap-1.5 text-brand-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pre-transit verified</span>
                      </span>
                      <span className="font-mono">Clean Mechanical Animation</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>

      </div>

      {/* Product Details Specs & Review Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Specifications Table (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4 border-b border-charcoal-800 pb-3">
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                  activeTab === 'specs'
                    ? 'border-brand-500 text-white'
                    : 'border-transparent text-charcoal-400 hover:text-white'
                }`}
              >
                Technical Specifications
              </button>
              <button
                onClick={() => setActiveTab('inspection')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                  activeTab === 'inspection'
                    ? 'border-brand-500 text-white'
                    : 'border-transparent text-charcoal-400 hover:text-white'
                }`}
              >
                Traveller Handover Protocol
              </button>
            </div>

            {activeTab === 'specs' ? (
              <div className="glass-panel rounded-2xl border border-charcoal-800 overflow-hidden divide-y divide-charcoal-800">
                {specifications.map((spec, i) => (
                  <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                    <span className="text-charcoal-400 font-mono text-xs">{spec.name}</span>
                    <span className="text-white font-medium text-right sm:max-w-sm">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-charcoal-800 space-y-4 text-sm text-charcoal-300">
                <h4 className="text-lg font-bold text-white">How The Traveller Verifies This Item:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Traveller arrives at pickup location and visually compares the package against unboxed reference frames.</li>
                  <li>Ensures original seal has not been tampered with and matches item dimensions.</li>
                  <li>Packages the item inside carry-on luggage with protective padding.</li>
                  <li>Generates arrival notification upon reaching destination city.</li>
                  <li>Handover is finalized strictly when customer inputs the 6-digit confirmation OTP.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Pricing & Booking Card (1 col) */}
          <div className="glass-panel p-6 rounded-2xl border border-charcoal-800 space-y-6 h-fit">
            <div>
              <span className="text-xs font-mono uppercase text-charcoal-400">Estimated Cost Breakdown</span>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between text-charcoal-300">
                  <span>Product Estimated Value</span>
                  <span className="text-white font-mono">₹4,200.00</span>
                </div>
                <div className="flex justify-between text-charcoal-300">
                  <span>Recommended Traveller Reward</span>
                  <span className="text-white font-mono">₹650.00</span>
                </div>
                <div className="flex justify-between text-charcoal-300">
                  <span>Platform Protection & Escrow Fee</span>
                  <span className="text-white font-mono">₹32.50</span>
                </div>
                <div className="pt-3 border-t border-charcoal-800 flex justify-between font-bold text-base text-white">
                  <span>Total Escrow Authorization</span>
                  <span className="text-brand-400 font-mono">₹4,882.50</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-800/60 border border-charcoal-700 text-xs text-charcoal-300 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>RouteMate Escrow Guarantee</span>
              </div>
              <p>Your money is safe. It is never paid out until you physically receive the item and confirm with your OTP code.</p>
            </div>

            <Link
              to="/register?role=REQUESTER"
              className="w-full py-3.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-center block transition-all shadow-emerald-glow"
            >
              Post Request For Similar Item
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;

