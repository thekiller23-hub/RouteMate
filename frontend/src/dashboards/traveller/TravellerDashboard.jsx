import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Compass, 
  PackageCheck, 
  Truck, 
  Coins, 
  ShieldCheck, 
  Bell, 
  LogOut,
  MapPin,
  Navigation,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Train,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';

const TravellerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Data states
  const [stats, setStats] = useState({
    total_journeys: 0,
    available_requests: 0,
    accepted_requests: 0,
    active_deliveries: 0,
    completed_deliveries: 0,
    total_earnings: 0,
  });
  const [journeys, setJourneys] = useState([]);
  const [matchedRequests, setMatchedRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [earningsData, setEarningsData] = useState({
    total_earnings: 0,
    pending_earnings: 0,
    available_balance: 0,
    withdrawn_balance: 0,
    history: [],
    withdrawals: []
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Publish Journey form
  const [newJourney, setNewJourney] = useState({
    origin_city: '',
    origin_address: '',
    destination_city: '',
    destination_address: '',
    intermediate_stops_str: '',
    departure_datetime: '',
    estimated_arrival_datetime: '',
    travel_mode: 'TRAIN',
    carrying_capacity_kg: '5.0',
    additional_notes: ''
  });
  const [journeyMsg, setJourneyMsg] = useState({ type: '', text: '' });
  const [submittingJourney, setSubmittingJourney] = useState(false);

  // OTP Verification state for deliveries
  const [otpInputs, setOtpInputs] = useState({});
  const [otpErrors, setOtpErrors] = useState({});
  const [otpSuccess, setOtpSuccess] = useState({});

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState({ type: '', text: '' });

  // Load all initial data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, journeysRes, matchesRes, deliveriesRes, earningsRes, notifRes] = await Promise.all([
        api.get('/journeys/overview/'),
        api.get('/journeys/?mine=true'),
        api.get('/matching/requests/'),
        api.get('/deliveries/'),
        api.get('/payments/earnings/'),
        api.get('/notifications/')
      ]);
      setStats(statsRes.data);
      setJourneys(journeysRes.data.results || journeysRes.data || []);
      setMatchedRequests(matchesRes.data.matches || []);
      setDeliveries(deliveriesRes.data.results || deliveriesRes.data || []);
      setEarningsData(earningsRes.data);
      setNotifications(notifRes.data.results || notifRes.data || []);
    } catch (err) {
      console.error('Error loading traveller dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Publish Journey handler
  const handlePublishJourney = async (e) => {
    e.preventDefault();
    setSubmittingJourney(true);
    setJourneyMsg({ type: '', text: '' });

    const stops = newJourney.intermediate_stops_str
      ? newJourney.intermediate_stops_str.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      ...newJourney,
      intermediate_stops: stops,
    };

    try {
      await api.post('/journeys/', payload);
      setJourneyMsg({ type: 'success', text: 'Journey published! Route matching engine is analyzing requests along your route.' });
      setNewJourney({
        origin_city: '',
        origin_address: '',
        destination_city: '',
        destination_address: '',
        intermediate_stops_str: '',
        departure_datetime: '',
        estimated_arrival_datetime: '',
        travel_mode: 'TRAIN',
        carrying_capacity_kg: '5.0',
        additional_notes: ''
      });
      loadDashboardData();
      setTimeout(() => setActiveTab('explore_requests'), 1200);
    } catch (err) {
      setJourneyMsg({ type: 'error', text: err.response?.data?.error || 'Failed to publish journey. Check details.' });
    } finally {
      setSubmittingJourney(false);
    }
  };

  // Accept a matched request
  const handleAcceptRequest = async (requestId, journeyId) => {
    try {
      await api.post(`/deliveries/accept/${requestId}/`, { journey_id: journeyId });
      loadDashboardData();
      setActiveTab('deliveries');
    } catch (err) {
      alert(err.response?.data?.error || 'Could not accept request.');
    }
  };

  // Update status (Collected, In Transit, Arrived, Ready for Handover)
  const handleUpdateStatus = async (deliveryId, newStatus) => {
    try {
      await api.post(`/deliveries/${deliveryId}/status/`, { status: newStatus });
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update status.');
    }
  };

  // Confirm delivery with customer OTP
  const handleConfirmOtp = async (deliveryId) => {
    const code = otpInputs[deliveryId];
    if (!code || code.length !== 6) {
      setOtpErrors({ ...otpErrors, [deliveryId]: 'Please enter full 6-digit OTP provided by the customer.' });
      return;
    }

    try {
      const res = await api.post(`/deliveries/${deliveryId}/confirm-otp/`, { otp_code: code });
      setOtpSuccess({ ...otpSuccess, [deliveryId]: 'Delivery confirmed! Reward has been credited to your balance.' });
      setOtpErrors({ ...otpErrors, [deliveryId]: '' });
      loadDashboardData();
    } catch (err) {
      setOtpErrors({ ...otpErrors, [deliveryId]: err.response?.data?.error || 'Incorrect OTP code.' });
    }
  };

  // Request withdrawal
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawMsg({ type: '', text: '' });
    try {
      await api.post('/payments/withdraw/', {
        amount: withdrawAmount,
        payout_method: 'UPI',
        account_details: withdrawAccount
      });
      setWithdrawMsg({ type: 'success', text: 'Withdrawal request submitted! Payout will settle to your account.' });
      setWithdrawAmount('');
      loadDashboardData();
    } catch (err) {
      setWithdrawMsg({ type: 'error', text: err.response?.data?.error || 'Withdrawal failed. Check balance.' });
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-charcoal-900 border-r border-charcoal-800 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-3 py-4 mb-6 border-b border-charcoal-800">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-charcoal-950 font-bold">
              RM
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">RouteMate</span>
              <span className="block text-[10px] uppercase font-mono text-emerald-400">Traveller Portal</span>
            </div>
          </div>

          {/* User Badge */}
          <div className="p-3 mb-6 rounded-xl bg-charcoal-850 border border-charcoal-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</div>
              <div className="text-[11px] text-charcoal-400 font-mono flex items-center gap-1">
                <span>Verified Traveller</span>
                <ShieldCheck className="w-3 h-3 text-brand-400" />
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'overview' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('publish_journey')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'publish_journey' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Journey</span>
            </button>

            <button
              onClick={() => setActiveTab('explore_requests')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'explore_requests' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Route Matches</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-charcoal-800 text-brand-400 font-mono">
                {matchedRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('deliveries')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'deliveries' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>My Deliveries</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                {deliveries.filter(d => d.status !== 'DELIVERED').length} active
              </span>
            </button>

            <button
              onClick={() => setActiveTab('earnings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'earnings' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Earnings & Payout</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'notifications' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-charcoal-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-charcoal-800 gap-4">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">Traveller Command</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('publish_journey')}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-xs flex items-center gap-1.5 shadow-emerald-glow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Journey</span>
            </button>
          </div>
        </div>

        {/* ==================== TAB: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* 6 Real Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-charcoal-400 uppercase">Journeys</span>
                <div className="text-2xl font-extrabold text-white mt-1 font-mono">{stats.total_journeys}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Published routes</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-brand-400 uppercase">Available Requests</span>
                <div className="text-2xl font-extrabold text-brand-400 mt-1 font-mono">{stats.available_requests}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Open in network</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-emerald-300 uppercase">Matched Requests</span>
                <div className="text-2xl font-extrabold text-emerald-300 mt-1 font-mono">{matchedRequests.length}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Along your corridor</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-amber-300 uppercase">Active Deliveries</span>
                <div className="text-2xl font-extrabold text-amber-300 mt-1 font-mono">{stats.active_deliveries}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Underway now</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-purple-400 uppercase">Completed</span>
                <div className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">{stats.completed_deliveries}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Delivered via OTP</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-emerald-400 uppercase">Total Earnings</span>
                <div className="text-2xl font-extrabold text-brand-400 mt-1 font-mono">₹{stats.total_earnings}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Settled payout</div>
              </div>
            </div>

            {/* Top Priority: Active Deliveries Underway */}
            <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-400" />
                  <span>Deliveries in Progress ({deliveries.filter(d => d.status !== 'DELIVERED').length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('deliveries')}
                  className="text-xs text-brand-400 hover:underline"
                >
                  Manage Status & OTP
                </button>
              </div>

              {deliveries.filter(d => d.status !== 'DELIVERED').length > 0 ? (
                <div className="space-y-4">
                  {deliveries.filter(d => d.status !== 'DELIVERED').map(del => (
                    <div key={del.id} className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-charcoal-400">
                          <span className="text-brand-400 font-bold">{del.tracking_code}</span>
                          <span>•</span>
                          <span>Reward: <strong className="text-white font-mono">₹{del.agreed_reward}</strong></span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">{del.request?.product_name}</h4>
                        <div className="text-xs text-charcoal-300 mt-1">
                          Pickup: {del.request?.pickup_city} ({del.request?.pickup_address}) ➔ Drop: {del.request?.destination_city} ({del.request?.destination_address})
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('deliveries')}
                        className="px-4 py-2 rounded-xl bg-brand-500 text-charcoal-950 font-bold text-xs"
                      >
                        Update / Complete Delivery
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-charcoal-400 py-3">No active deliveries underway right now.</p>
              )}
            </div>

            {/* Quick Matched Requests Teaser */}
            <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Top Requests Along Your Routes</h3>
                <button
                  onClick={() => setActiveTab('explore_requests')}
                  className="text-xs text-brand-400 hover:underline"
                >
                  Explore All Matches
                </button>
              </div>

              {matchedRequests.slice(0, 3).map((match, i) => (
                <div key={i} className="py-3 border-b border-charcoal-800 last:border-0 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{match.request?.product_name}</h4>
                    <span className="text-xs text-charcoal-400">
                      {match.request?.pickup_city} ➔ {match.request?.destination_city} • Reward: ₹{match.request?.traveller_reward}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-brand-500/20 text-brand-400">
                      {match.match_score}% Match
                    </span>
                    <button
                      onClick={() => handleAcceptRequest(match.request.id, match.journey.id)}
                      className="px-3 py-1.5 rounded-lg bg-brand-500 text-charcoal-950 font-bold text-xs"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================== TAB: PUBLISH JOURNEY ==================== */}
        {activeTab === 'publish_journey' && (
          <div className="max-w-3xl glass-panel p-8 rounded-3xl border border-charcoal-800">
            <h2 className="text-xl font-bold text-white mb-2">Publish an Existing Journey</h2>
            <p className="text-xs text-charcoal-400 mb-6 font-mono">
              Share details of your upcoming personal, business, or educational commute to discover matching deliveries.
            </p>

            {journeyMsg.text && (
              <div className={`p-4 rounded-xl mb-6 text-xs flex items-center gap-2 ${
                journeyMsg.type === 'success' ? 'bg-brand-500/10 border border-brand-500/30 text-brand-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {journeyMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{journeyMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePublishJourney} className="space-y-4">
              
              {/* Origin */}
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Starting Point (Origin)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-charcoal-400 block mb-1">Origin City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Warangal"
                      value={newJourney.origin_city}
                      onChange={(e) => setNewJourney({ ...newJourney, origin_city: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-charcoal-400 block mb-1">Origin Station / Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Kazipet Railway Station"
                      value={newJourney.origin_address}
                      onChange={(e) => setNewJourney({ ...newJourney, origin_address: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-brand-400" />
                  <span>Final Destination</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-charcoal-400 block mb-1">Destination City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyderabad"
                      value={newJourney.destination_city}
                      onChange={(e) => setNewJourney({ ...newJourney, destination_city: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-charcoal-400 block mb-1">Destination Station / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Secunderabad Station / Hitec City"
                      value={newJourney.destination_address}
                      onChange={(e) => setNewJourney({ ...newJourney, destination_address: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Intermediate Stops */}
              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">Intermediate Stations / Stops (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Jangaon, Aler, Bhongir"
                  value={newJourney.intermediate_stops_str}
                  onChange={(e) => setNewJourney({ ...newJourney, intermediate_stops_str: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                />
              </div>

              {/* Dates & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Departure Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newJourney.departure_datetime}
                    onChange={(e) => setNewJourney({ ...newJourney, departure_datetime: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Estimated Arrival Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newJourney.estimated_arrival_datetime}
                    onChange={(e) => setNewJourney({ ...newJourney, estimated_arrival_datetime: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                  />
                </div>
              </div>

              {/* Mode & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Travel Mode</label>
                  <select
                    value={newJourney.travel_mode}
                    onChange={(e) => setNewJourney({ ...newJourney, travel_mode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                  >
                    <option value="TRAIN">Train (Intercity / Express)</option>
                    <option value="CAR">Personal Car / Taxi</option>
                    <option value="FLIGHT">Flight</option>
                    <option value="BUS">Intercity Bus</option>
                    <option value="BIKE">Motorcycle</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Available Luggage Capacity (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="5.0"
                    value={newJourney.carrying_capacity_kg}
                    onChange={(e) => setNewJourney({ ...newJourney, carrying_capacity_kg: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">Commute Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Taking morning Golconda Express. Can easily carry small to medium parcel in overhead rack."
                  value={newJourney.additional_notes}
                  onChange={(e) => setNewJourney({ ...newJourney, additional_notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submittingJourney}
                className="w-full mt-4 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-sm shadow-emerald-glow"
              >
                {submittingJourney ? 'Publishing...' : 'Publish Journey & Find Deliveries'}
              </button>

            </form>
          </div>
        )}

        {/* ==================== TAB: EXPLORE REQUESTS & ROUTE MATCHES ==================== */}
        {activeTab === 'explore_requests' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Route-Matched Product Requests</h3>
              <p className="text-xs text-charcoal-400 mt-1 font-mono">
                Requests calculated by our Smart Route Engine strictly aligned with your published travel origins, stops, and destinations.
              </p>
            </div>

            {matchedRequests.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {matchedRequests.map((match, i) => (
                  <div key={i} className="glass-panel p-6 rounded-2xl border border-charcoal-800 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-charcoal-800 text-brand-300">
                          {match.request?.product_category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-500/20 text-brand-400">
                          {match.match_score}% Match Score
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-white mt-2">{match.request?.product_name}</h4>
                      <p className="text-xs text-charcoal-300 mt-1">{match.request?.product_description}</p>

                      {/* Route specs */}
                      <div className="mt-3 p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1 text-xs">
                        <div>
                          Pickup: <span className="text-white font-semibold">{match.request?.pickup_city}</span> ({match.request?.pickup_address})
                        </div>
                        <div>
                          Destination: <span className="text-white font-semibold">{match.request?.destination_city}</span> ({match.request?.destination_address})
                        </div>
                        <div className="text-charcoal-400 font-mono text-[11px] pt-1">
                          Delivery Deadline: {match.request?.required_delivery_date}
                        </div>
                      </div>

                      {/* Matching factors */}
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-mono text-charcoal-400">
                        {match.factors?.map((f, idx) => (
                          <span key={idx} className="bg-charcoal-800/80 px-2 py-0.5 rounded text-charcoal-300">
                            • {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-charcoal-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-charcoal-400 block">Traveller Reward</span>
                        <span className="text-xl font-extrabold text-brand-400 font-mono">₹{match.request?.traveller_reward}</span>
                      </div>

                      <button
                        onClick={() => handleAcceptRequest(match.request.id, match.journey.id)}
                        className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-xs shadow-emerald-glow"
                      >
                        Accept Request & Deliver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 glass-panel rounded-3xl border border-charcoal-800">
                <Compass className="w-12 h-12 text-charcoal-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white">No Matching Requests on Current Routes</h4>
                <p className="text-sm text-charcoal-400 mt-1">Publish a new journey or check back shortly as requesters post continuously.</p>
                <button
                  onClick={() => setActiveTab('publish_journey')}
                  className="mt-4 px-4 py-2 rounded-xl bg-brand-500 text-charcoal-950 font-bold text-xs"
                >
                  Publish New Route
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: MY DELIVERIES & OTP VERIFICATION ==================== */}
        {activeTab === 'deliveries' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Active & Completed Deliveries</h3>

            {deliveries.map(del => (
              <div key={del.id} className="glass-panel p-6 rounded-3xl border border-charcoal-800 space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-charcoal-800 gap-2">
                  <div>
                    <span className="text-xs font-mono text-brand-400 font-bold">{del.tracking_code}</span>
                    <h4 className="text-lg font-bold text-white">{del.request?.product_name}</h4>
                    <span className="text-xs text-charcoal-400">
                      From {del.request?.pickup_city} ➔ {del.request?.destination_city} • Agreed Reward: <strong className="text-brand-400 font-mono">₹{del.agreed_reward}</strong>
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold self-start ${
                    del.status === 'DELIVERED' ? 'bg-purple-500/20 text-purple-300' : 'bg-brand-500/20 text-brand-400'
                  }`}>
                    {del.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Progress / Status Controls if not delivered */}
                {del.status !== 'DELIVERED' ? (
                  <div className="space-y-4">
                    <span className="text-xs font-mono uppercase text-charcoal-400 block font-bold">
                      Update Delivery Stage:
                    </span>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateStatus(del.id, 'COLLECTED')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                          del.status === 'COLLECTED' ? 'bg-brand-500 text-charcoal-950' : 'bg-charcoal-800 text-white hover:bg-charcoal-700'
                        }`}
                      >
                        1. Product Collected
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(del.id, 'IN_TRANSIT')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                          del.status === 'IN_TRANSIT' ? 'bg-brand-500 text-charcoal-950' : 'bg-charcoal-800 text-white hover:bg-charcoal-700'
                        }`}
                      >
                        2. In Transit
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(del.id, 'ARRIVED')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                          del.status === 'ARRIVED' ? 'bg-brand-500 text-charcoal-950' : 'bg-charcoal-800 text-white hover:bg-charcoal-700'
                        }`}
                      >
                        3. Arrived at Destination
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(del.id, 'READY_FOR_HANDOVER')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                          del.status === 'READY_FOR_HANDOVER' ? 'bg-brand-500 text-charcoal-950' : 'bg-charcoal-800 text-white hover:bg-charcoal-700'
                        }`}
                      >
                        4. Ready for Handover
                      </button>
                    </div>

                    {/* Handover OTP Verification Form */}
                    <div className="p-5 rounded-2xl bg-charcoal-900 border border-brand-500/40 space-y-3">
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <KeyRound className="w-4 h-4 text-brand-400" />
                        <span>Confirm Delivery via Customer OTP</span>
                      </div>
                      <p className="text-xs text-charcoal-300">
                        When you hand over the item to the customer, ask them for their 6-digit confirmation OTP code shown on their dashboard.
                      </p>

                      {otpErrors[del.id] && (
                        <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                          {otpErrors[del.id]}
                        </div>
                      )}

                      {otpSuccess[del.id] && (
                        <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                          {otpSuccess[del.id]}
                        </div>
                      )}

                      <div className="flex gap-3 max-w-sm">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 584920"
                          value={otpInputs[del.id] || ''}
                          onChange={(e) => setOtpInputs({ ...otpInputs, [del.id]: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white text-base tracking-widest font-mono text-center focus:outline-none focus:border-brand-500"
                        />
                        <button
                          onClick={() => handleConfirmOtp(del.id)}
                          className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-xs whitespace-nowrap shadow-emerald-glow"
                        >
                          Verify & Settle
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Delivery Completed & Verified via Customer OTP</span>
                    </span>
                    <span className="font-mono font-bold text-white">₹{del.agreed_reward} Added to Earnings</span>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* ==================== TAB: EARNINGS & WITHDRAWALS ==================== */}
        {activeTab === 'earnings' && (
          <div className="space-y-8">
            
            {/* Earnings Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono uppercase text-charcoal-400">Total All-Time Earnings</span>
                <div className="text-3xl font-extrabold text-white mt-1 font-mono">₹{earningsData.total_earnings}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Completed deliveries</div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-brand-500/30 bg-brand-500/5">
                <span className="text-xs font-mono uppercase text-brand-400 font-bold">Available For Withdrawal</span>
                <div className="text-3xl font-extrabold text-brand-400 mt-1 font-mono">₹{earningsData.available_balance}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Instant UPI payout eligible</div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono uppercase text-charcoal-400">Withdrawn to Date</span>
                <div className="text-3xl font-extrabold text-purple-400 mt-1 font-mono">₹{earningsData.withdrawn_balance}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Settled to bank accounts</div>
              </div>
            </div>

            {/* Withdrawal Request Box */}
            <div className="max-w-xl glass-panel p-6 rounded-2xl border border-charcoal-800">
              <h4 className="text-base font-bold text-white mb-2">Request Payout (UPI / Bank)</h4>
              
              {withdrawMsg.text && (
                <div className={`p-3 rounded-xl mb-4 text-xs ${
                  withdrawMsg.type === 'success' ? 'bg-brand-500/10 text-brand-300' : 'bg-rose-500/10 text-rose-300'
                }`}>
                  {withdrawMsg.text}
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Amount to Withdraw (₹)</label>
                  <input
                    type="number"
                    required
                    max={earningsData.available_balance}
                    placeholder={`Max ₹${earningsData.available_balance}`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">UPI ID or Bank Account Details</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rahul@upi or Account + IFSC"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={earningsData.available_balance <= 0}
                  className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-xs disabled:opacity-50"
                >
                  Withdraw Funds
                </button>
              </form>
            </div>

            {/* History Table */}
            <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
              <h4 className="text-base font-bold text-white mb-4">Earnings History</h4>
              {earningsData.history?.length > 0 ? (
                <div className="divide-y divide-charcoal-800 text-xs">
                  {earningsData.history.map((h, i) => (
                    <div key={i} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-white">{h.product_name}</div>
                        <div className="text-charcoal-400 font-mono">Order {h.delivery_code}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-brand-400 font-mono">+₹{h.net_amount}</div>
                        <span className="text-[10px] text-charcoal-500 font-mono">{h.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-charcoal-400 py-3">No earnings records yet.</p>
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB: NOTIFICATIONS ==================== */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl space-y-3">
            <h3 className="text-lg font-bold text-white mb-4">Platform Notifications</h3>
            {notifications.map(n => (
              <div key={n.id} className="p-4 rounded-2xl glass-panel border border-charcoal-800 text-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-brand-400">{n.title}</span>
                  <span className="text-[10px] text-charcoal-500 font-mono">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-charcoal-300">{n.message}</p>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default TravellerDashboard;

