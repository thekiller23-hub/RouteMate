import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  Users, 
  Truck, 
  CheckCircle2, 
  CreditCard, 
  Bell, 
  Star, 
  User as UserIcon, 
  HelpCircle, 
  LogOut,
  Clock,
  MapPin,
  Navigation,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Coins,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const RequesterDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Data states
  const [stats, setStats] = useState({
    total_requests: 0,
    active_requests: 0,
    matched_requests: 0,
    completed_deliveries: 0,
    total_spending: 0,
  });
  const [requests, setRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating request
  const [newRequest, setNewRequest] = useState({
    product_name: '',
    product_category: 'HANDICRAFTS',
    product_description: '',
    product_source: 'LOCAL_MARKET',
    pickup_address: '',
    pickup_city: '',
    destination_address: '',
    destination_city: '',
    max_budget: '',
    traveller_reward: '',
    required_delivery_date: '',
    additional_instructions: '',
    product_image_url: ''
  });
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  // Matching travellers state
  const [selectedRequestForMatch, setSelectedRequestForMatch] = useState(null);
  const [matchedTravellers, setMatchedTravellers] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Fetch all initial data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, reqsRes, delivRes, notifRes] = await Promise.all([
        api.get('/requests/overview/'),
        api.get('/requests/?mine=true'),
        api.get('/deliveries/'),
        api.get('/notifications/')
      ]);
      setStats(statsRes.data);
      setRequests(reqsRes.data.results || reqsRes.data || []);
      setDeliveries(delivRes.data.results || delivRes.data || []);
      setNotifications(notifRes.data.results || notifRes.data || []);
    } catch (err) {
      console.error('Error fetching requester dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Fetch matches for a specific request
  const handleCheckMatches = async (req) => {
    setSelectedRequestForMatch(req);
    setActiveTab('matches');
    setLoadingMatches(true);
    try {
      const res = await api.get(`/matching/travellers/?request_id=${req.id}`);
      setMatchedTravellers(res.data.matches || []);
    } catch (err) {
      console.error('Error loading matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Create request handler
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setCreateMsg({ type: '', text: '' });
    try {
      const res = await api.post('/requests/', newRequest);
      setCreateMsg({ type: 'success', text: 'Product request successfully published! Matching travellers will be alerted.' });
      setNewRequest({
        product_name: '',
        product_category: 'HANDICRAFTS',
        product_description: '',
        product_source: 'LOCAL_MARKET',
        pickup_address: '',
        pickup_city: '',
        destination_address: '',
        destination_city: '',
        max_budget: '',
        traveller_reward: '',
        required_delivery_date: '',
        additional_instructions: '',
        product_image_url: ''
      });
      loadDashboardData();
      setTimeout(() => setActiveTab('my_requests'), 1500);
    } catch (err) {
      setCreateMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create request. Please check inputs.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Mark notification read
  const handleMarkNotification = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-charcoal-900 border-r border-charcoal-800 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-3 py-4 mb-6 border-b border-charcoal-800">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-charcoal-950 font-bold">
              RM
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">RouteMate</span>
              <span className="block text-[10px] uppercase font-mono text-brand-400">Requester Portal</span>
            </div>
          </div>

          {/* User Badge */}
          <div className="p-3 mb-6 rounded-xl bg-charcoal-850 border border-charcoal-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</div>
              <div className="text-[11px] text-charcoal-400 font-mono">Requester</div>
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
              onClick={() => setActiveTab('create')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'create' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Request</span>
            </button>

            <button
              onClick={() => setActiveTab('my_requests')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'my_requests' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Requests</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-charcoal-800 text-charcoal-300 font-mono">
                {requests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'matches' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Matching Travellers</span>
            </button>

            <button
              onClick={() => setActiveTab('deliveries')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'deliveries' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Delivery Tracking</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                {deliveries.filter(d => d.status !== 'DELIVERED').length} active
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'payments' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Escrow & Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'notifications' ? 'bg-brand-500 text-charcoal-950 font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-brand-500 text-charcoal-950 font-bold font-mono">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-charcoal-800 space-y-2">
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
            <span className="text-xs font-mono text-brand-400 uppercase tracking-widest font-semibold">Requester Dashboard</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-xs flex items-center gap-1.5 shadow-emerald-glow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Request</span>
            </button>
          </div>
        </div>

        {/* ==================== TAB: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* 5 Real Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-charcoal-400 uppercase">Total Requests</span>
                <div className="text-2xl font-extrabold text-white mt-1 font-mono">{stats.total_requests}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">All time created</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-brand-400 uppercase">Active Requests</span>
                <div className="text-2xl font-extrabold text-brand-400 mt-1 font-mono">{stats.active_requests}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Open for traveller offers</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-emerald-300 uppercase">Matched Requests</span>
                <div className="text-2xl font-extrabold text-emerald-300 mt-1 font-mono">{stats.matched_requests}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Travellers found on route</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-purple-400 uppercase">Completed Deliveries</span>
                <div className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">{stats.completed_deliveries}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Confirmed with OTP</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-charcoal-400 uppercase">Total Spending</span>
                <div className="text-2xl font-extrabold text-white mt-1 font-mono">₹{stats.total_spending}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">Escrow settlements</div>
              </div>
            </div>

            {/* Active Deliveries Quick Tracker */}
            <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-400" />
                  <span>Ongoing Deliveries ({deliveries.filter(d => d.status !== 'DELIVERED').length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('deliveries')}
                  className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Detailed Tracking</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {deliveries.filter(d => d.status !== 'DELIVERED').length > 0 ? (
                <div className="space-y-4">
                  {deliveries.filter(d => d.status !== 'DELIVERED').map(del => (
                    <div key={del.id} className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-brand-500/20 text-brand-400 font-bold">
                            {del.tracking_code}
                          </span>
                          <span className="text-xs text-charcoal-400 font-mono">Status: {del.status.replace(/_/g, ' ')}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">{del.request?.product_name}</h4>
                        <div className="text-xs text-charcoal-400 mt-1">
                          Traveller: <span className="text-white font-semibold">{del.traveller?.first_name || del.traveller?.username}</span>
                        </div>
                      </div>

                      {/* Requester's Secret Handover OTP Badge */}
                      {del.requester_otp && (
                        <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-right">
                          <span className="text-[10px] uppercase font-mono text-brand-400 block font-bold">
                            Your Handover OTP
                          </span>
                          <span className="text-2xl font-extrabold text-white tracking-widest font-mono">
                            {del.requester_otp}
                          </span>
                          <span className="text-[10px] text-charcoal-400 block mt-0.5">
                            Share ONLY when item is received
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-charcoal-400 py-4">No active deliveries underway right now.</p>
              )}
            </div>

            {/* Recent Product Requests */}
            <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Requests</h3>
                <button
                  onClick={() => setActiveTab('my_requests')}
                  className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {requests.slice(0, 3).map(req => (
                <div key={req.id} className="py-3 border-b border-charcoal-800/60 last:border-0 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{req.product_name}</h4>
                    <span className="text-xs text-charcoal-400">
                      {req.pickup_city} ➔ {req.destination_city} • Budget: ₹{req.max_budget} • Reward: ₹{req.traveller_reward}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold ${
                    req.status === 'OPEN' ? 'bg-brand-500/20 text-brand-400' : 'bg-charcoal-800 text-charcoal-300'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==================== TAB: CREATE REQUEST ==================== */}
        {activeTab === 'create' && (
          <div className="max-w-3xl glass-panel p-8 rounded-3xl border border-charcoal-800">
            <h2 className="text-xl font-bold text-white mb-2">Create New Product Delivery Request</h2>
            <p className="text-xs text-charcoal-400 mb-6 font-mono">
              Post any legal, platform-permitted item from physical shops, bazaars, or individual sellers.
            </p>

            {createMsg.text && (
              <div className={`p-4 rounded-xl mb-6 text-xs flex items-center gap-2 ${
                createMsg.type === 'success' ? 'bg-brand-500/10 border border-brand-500/30 text-brand-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {createMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{createMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              
              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Warangal Brass Dhokra Art Lamp, Mysore Sweets, Regional Textiles"
                  value={newRequest.product_name}
                  onChange={(e) => setNewRequest({ ...newRequest, product_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Category</label>
                  <select
                    value={newRequest.product_category}
                    onChange={(e) => setNewRequest({ ...newRequest, product_category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="HANDICRAFTS">Handicrafts & Art</option>
                    <option value="FOOD_SWEETS">Regional Sweets & Specialty Food</option>
                    <option value="ELECTRONICS">Electronics & Gadgets</option>
                    <option value="FASHION">Fashion & Traditional Wear</option>
                    <option value="DOCUMENTS">Urgent Documents</option>
                    <option value="BOOKS">Books & Educational Material</option>
                    <option value="HEALTH">Personal Care / Medicines</option>
                    <option value="OTHER">Other Permitted Items</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Product Source</label>
                  <select
                    value={newRequest.product_source}
                    onChange={(e) => setNewRequest({ ...newRequest, product_source: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="LOCAL_MARKET">Local Market / Bazaar</option>
                    <option value="PHYSICAL_STORE">Physical Store / Shop</option>
                    <option value="MALL">Shopping Mall</option>
                    <option value="INDIVIDUAL_SELLER">Individual Seller / Friend</option>
                    <option value="OTHER">Other Permitted Source</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">Product Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newRequest.product_image_url}
                  onChange={(e) => setNewRequest({ ...newRequest, product_image_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Pickup location */}
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Pickup Location (Where traveller collects it)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-charcoal-400 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Warangal"
                      value={newRequest.pickup_city}
                      onChange={(e) => setNewRequest({ ...newRequest, pickup_city: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-charcoal-400 block mb-1">Specific Address / Landmark</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hanamkonda Main Market, Shop #12"
                      value={newRequest.pickup_address}
                      onChange={(e) => setNewRequest({ ...newRequest, pickup_address: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Dropoff location */}
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-brand-400" />
                  <span>Delivery Destination (Where traveller hands it to you)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-charcoal-400 block mb-1">Destination City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyderabad"
                      value={newRequest.destination_city}
                      onChange={(e) => setNewRequest({ ...newRequest, destination_city: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-charcoal-400 block mb-1">Dropoff Address / Landmark</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Banjara Hills, Road No. 12"
                      value={newRequest.destination_address}
                      onChange={(e) => setNewRequest({ ...newRequest, destination_address: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Financials & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Item Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2500"
                    value={newRequest.max_budget}
                    onChange={(e) => setNewRequest({ ...newRequest, max_budget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-brand-400 block mb-1 font-bold">Traveller Reward (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="450"
                    value={newRequest.traveller_reward}
                    onChange={(e) => setNewRequest({ ...newRequest, traveller_reward: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-brand-500/50 text-brand-300 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-charcoal-400 block mb-1">Required By Date</label>
                  <input
                    type="date"
                    required
                    value={newRequest.required_delivery_date}
                    onChange={(e) => setNewRequest({ ...newRequest, required_delivery_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-charcoal-400 block mb-1">Special Handling Instructions</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Fragile ceramic lamp, keep upright, collect receipt from shop owner"
                  value={newRequest.additional_instructions}
                  onChange={(e) => setNewRequest({ ...newRequest, additional_instructions: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-charcoal-950 font-bold text-sm shadow-emerald-glow flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'Publishing Request...' : 'Publish Product Request'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

            </form>
          </div>
        )}

        {/* ==================== TAB: MY REQUESTS ==================== */}
        {activeTab === 'my_requests' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">All Product Requests ({requests.length})</h3>
            
            {requests.map(req => (
              <div key={req.id} className="glass-panel p-6 rounded-2xl border border-charcoal-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-charcoal-800 text-brand-300">
                      {req.product_category}
                    </span>
                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                      req.status === 'OPEN' ? 'bg-brand-500/20 text-brand-400' : 'bg-charcoal-800 text-charcoal-300'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{req.product_name}</h4>
                  <p className="text-xs text-charcoal-400">
                    Pickup: <span className="text-white">{req.pickup_city}</span> ({req.pickup_address}) ➔ Dropoff: <span className="text-white">{req.destination_city}</span> ({req.destination_address})
                  </p>
                  <div className="text-xs text-charcoal-300 pt-1">
                    Budget: <span className="text-white font-mono font-bold">₹{req.max_budget}</span> • Reward: <span className="text-brand-400 font-mono font-bold">₹{req.traveller_reward}</span> • Due: <span className="text-charcoal-200">{req.required_delivery_date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCheckMatches(req)}
                    className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-brand-500 hover:text-charcoal-950 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-charcoal-700"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Find Matching Travellers</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== TAB: MATCHING TRAVELLERS ==================== */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="glass-panel p-4 rounded-xl border border-charcoal-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-brand-400">Target Request:</span>
                <div className="text-base font-bold text-white">
                  {selectedRequestForMatch ? selectedRequestForMatch.product_name : 'Select a request from "My Requests" to view route matches'}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('my_requests')}
                className="text-xs text-brand-400 hover:underline"
              >
                Change Request
              </button>
            </div>

            {loadingMatches ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 rounded-full border-4 border-charcoal-700 border-t-brand-500 animate-spin" />
              </div>
            ) : matchedTravellers.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-sm font-mono text-charcoal-400 uppercase">
                  {matchedTravellers.length} Compatible Travellers Found on Route
                </h4>

                {matchedTravellers.map((match, idx) => (
                  <div key={idx} className="glass-panel p-6 rounded-2xl border border-charcoal-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
                          {match.journey?.traveller?.first_name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {match.journey?.traveller?.first_name || match.journey?.traveller?.username}
                            </span>
                            {match.journey?.traveller_is_verified && (
                              <span className="flex items-center gap-1 text-[11px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full font-mono">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verified ID</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-charcoal-400 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{match.journey?.traveller_rating || 5.0} Rating</span>
                          </span>
                        </div>
                      </div>

                      {/* Route Details */}
                      <div className="text-xs text-charcoal-300">
                        Route: <span className="text-white font-semibold">{match.journey?.origin_city}</span> ➔ <span className="text-white font-semibold">{match.journey?.destination_city}</span> ({match.journey?.travel_mode})
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                        {match.factors?.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-300">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="px-3 py-1 rounded-xl bg-brand-500/20 text-brand-300 font-mono font-bold text-sm">
                        {match.match_score}% Match Score
                      </div>
                      <span className="text-xs text-charcoal-400">
                        Detour: {match.estimated_detour_km} km
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-panel rounded-2xl border border-charcoal-800">
                <p className="text-charcoal-400 text-sm">No active journeys currently matched with this route corridor.</p>
                <p className="text-xs text-charcoal-500 mt-1">Travellers regularly publish new journeys. You will be notified when one appears.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: DELIVERY TRACKING & OTP ==================== */}
        {activeTab === 'deliveries' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Delivery Orders & Live Tracking</h3>

            {deliveries.length > 0 ? (
              deliveries.map(del => (
                <div key={del.id} className="glass-panel p-6 rounded-3xl border border-charcoal-800 space-y-6">
                  
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-charcoal-800 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-brand-400">{del.tracking_code}</span>
                        <span className="text-xs text-charcoal-400">Created: {new Date(del.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mt-1">{del.request?.product_name}</h4>
                    </div>

                    {/* Requester's Secure Confirmation OTP */}
                    {del.requester_otp && del.status !== 'DELIVERED' && (
                      <div className="p-3 rounded-2xl bg-brand-500/20 border border-brand-500 text-center sm:text-right">
                        <span className="text-[10px] uppercase font-mono text-brand-300 block font-bold">
                          Handover Confirmation OTP
                        </span>
                        <span className="text-3xl font-extrabold text-white tracking-widest font-mono">
                          {del.requester_otp}
                        </span>
                        <span className="text-[10px] text-charcoal-300 block">
                          Provide this to traveller upon receiving item
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 9 Stages Progress Pipeline */}
                  <div>
                    <span className="text-xs font-mono uppercase text-charcoal-400 block mb-3">9-Stage Delivery Progress</span>
                    <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-center text-[10px] font-mono">
                      {[
                        { name: 'Created', done: true },
                        { name: 'Matched', done: true },
                        { name: 'Accepted', done: ['ACCEPTED', 'COLLECTED', 'IN_TRANSIT', 'ARRIVED', 'READY_FOR_HANDOVER', 'DELIVERED'].includes(del.status) },
                        { name: 'Collected', done: ['COLLECTED', 'IN_TRANSIT', 'ARRIVED', 'READY_FOR_HANDOVER', 'DELIVERED'].includes(del.status) },
                        { name: 'In Transit', done: ['IN_TRANSIT', 'ARRIVED', 'READY_FOR_HANDOVER', 'DELIVERED'].includes(del.status) },
                        { name: 'Arrived', done: ['ARRIVED', 'READY_FOR_HANDOVER', 'DELIVERED'].includes(del.status) },
                        { name: 'Handover', done: ['READY_FOR_HANDOVER', 'DELIVERED'].includes(del.status) },
                        { name: 'OTP Confirmed', done: del.status === 'DELIVERED' },
                        { name: 'Completed', done: del.status === 'DELIVERED' }
                      ].map((stage, idx) => (
                        <div key={idx} className={`p-2 rounded-lg border ${
                          stage.done ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-bold' : 'bg-charcoal-900 border-charcoal-800 text-charcoal-500'
                        }`}>
                          {stage.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Traveller details and Status History */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-charcoal-800 text-xs">
                    <div>
                      <span className="text-charcoal-400 block mb-1">Assigned Traveller:</span>
                      <span className="text-white font-semibold text-sm">{del.traveller?.first_name || del.traveller?.username}</span>
                      <div className="text-charcoal-400 mt-1">Reward to be released: ₹{del.agreed_reward}</div>
                    </div>

                    <div>
                      <span className="text-charcoal-400 block mb-1">Recent Status Activity:</span>
                      {del.status_history?.slice(0, 2).map((h, i) => (
                        <div key={i} className="text-charcoal-300">
                          • {h.status}: {h.notes}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center py-12 glass-panel rounded-2xl border border-charcoal-800">
                <p className="text-charcoal-400 text-sm">No delivery orders currently placed.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: PAYMENTS & ESCROW ==================== */}
        {activeTab === 'payments' && (
          <div className="max-w-3xl glass-panel p-8 rounded-3xl border border-charcoal-800 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">RouteMate Escrow & Payment Protection</h3>
              <p className="text-xs text-charcoal-400 mt-1 font-mono">
                Integrated with Razorpay. Funds are locked securely in escrow until delivery is verified via OTP.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
              <div className="flex items-center gap-2 text-brand-400 text-sm font-semibold">
                <ShieldCheck className="w-5 h-5" />
                <span>Zero Risk for Requester and Traveller</span>
              </div>
              <p className="text-xs text-charcoal-300 leading-relaxed">
                When a traveller accepts your request, your product budget and agreed reward are held in escrow. The traveller is guaranteed payment upon delivery, and you are 100% protected because payment cannot be released until you provide your OTP.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Escrow Payment History</h4>
              {deliveries.filter(d => d.status === 'DELIVERED').length > 0 ? (
                deliveries.filter(d => d.status === 'DELIVERED').map(del => (
                  <div key={del.id} className="p-3 rounded-xl bg-charcoal-850 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{del.request?.product_name}</div>
                      <div className="text-charcoal-400 font-mono">Order {del.tracking_code}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-400 font-mono">₹{del.agreed_reward} Released</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Completed & Verified</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-charcoal-400 py-3">No settled payments yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: NOTIFICATIONS ==================== */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl space-y-3">
            <h3 className="text-lg font-bold text-white mb-4">Platform Notifications</h3>
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkNotification(n.id)}
                className={`p-4 rounded-2xl border transition-colors cursor-pointer ${
                  n.is_read ? 'bg-charcoal-900/60 border-charcoal-800/60 text-charcoal-400' : 'glass-panel border-brand-500/40 text-white shadow-emerald-glow'
                }`}
              >
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

export default RequesterDashboard;

