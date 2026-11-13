import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating contact / support inquiry submission
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col">
      <Header />

      <section className="py-16 bg-charcoal-900 border-b border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
            We're Here to Help
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Get in Touch with RouteMate
          </h1>
          <p className="text-charcoal-300 mt-2 text-sm sm:text-base">
            Have questions about deliveries, traveller verifications, or payments? Contact our 24/7 team.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Contact Information</h2>
            <p className="text-charcoal-300 text-sm leading-relaxed">
              Our support team is active across all major Indian transport corridors to assist with delivery handovers, dispute inquiries, and onboarding.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel border border-charcoal-800">
                <Mail className="w-5 h-5 text-brand-400" />
                <div>
                  <div className="text-xs text-charcoal-400 font-mono">Email Support</div>
                  <div className="text-sm font-semibold text-white">support@routemate.com</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel border border-charcoal-800">
                <Phone className="w-5 h-5 text-brand-400" />
                <div>
                  <div className="text-xs text-charcoal-400 font-mono">Toll Free Helpline</div>
                  <div className="text-sm font-semibold text-white">+91 1800-ROUTEMATE</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel border border-charcoal-800">
                <MapPin className="w-5 h-5 text-brand-400" />
                <div>
                  <div className="text-xs text-charcoal-400 font-mono">Headquarters</div>
                  <div className="text-sm font-semibold text-white">Banjara Hills, Hyderabad, Telangana, India</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-charcoal-800">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-brand-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Message Received!</h3>
                <p className="text-sm text-charcoal-300">Thank you for reaching out. A RouteMate agent will reply to your email within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-2">Send a Message</h3>
                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    placeholder="Priya Sharma"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    placeholder="priya@example.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    placeholder="Inquiry about route delivery"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Message</label>
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    placeholder="How can we assist you today?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-sm transition-colors shadow-emerald-glow flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Submit Message'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;

