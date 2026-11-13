import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Package, 
  Truck, 
  CreditCard, 
  BarChart3, 
  FileText, 
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  MapPin
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [overview, setOverview] = useState({
    total_registered_users: 0,
    total_requesters: 0,
    total_travellers: 0,
    verified_travellers: 0,
    total_requests: 0,
    open_requests: 0,
    active_deliveries: 0,
    completed_deliveries: 0,
    platform_revenue: 0,
    pending_complaints: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [deliveriesList, setDeliveriesList] = useState([]);
  const [chartsData, setChartsData] = useState(null);
  const [searchUser, setSearchUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ovRes, delivRes, chartsRes] = await Promise.all([
        api.get('/analytics/admin-overview/'),
        api.get('/deliveries/'),
        api.get('/analytics/charts/')
      ]);
      setOverview(ovRes.data);
      setDeliveriesList(delivRes.data.results || delivRes.data || []);
      setChartsData(chartsRes.data);

      // Load users
      const usersRes = await api.get('/analytics/admin-users/');
      setUsersList(usersRes.data.users || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleFilterUsers = async (roleFilter) => {
    setSelectedRole(roleFilter);
    try {
      let url = '/analytics/admin-users/';
      const params = [];
      if (roleFilter) params.push(`role=${roleFilter}`);
      if (searchUser) params.push(`search=${encodeURIComponent(searchUser)}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setUsersList(res.data.users || []);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUserAction = async (userId, actionType) => {
    try {
      const res = await api.post(`/analytics/admin-users/${userId}/action/`, { action: actionType });
      setActionMsg(res.data.message);
      // Reload users list
      handleFilterUsers(selectedRole);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to perform action.');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-charcoal-900 border-r border-charcoal-800 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5 px-3 py-4 mb-6 border-b border-charcoal-800">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow">
              ADM
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">RouteMate</span>
              <span className="block text-[10px] uppercase font-mono text-purple-400">Admin Control</span>
            </div>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'overview' ? 'bg-purple-600 text-white font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'users' ? 'bg-purple-600 text-white font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Management</span>
            </button>

            <button
              onClick={() => setActiveTab('deliveries')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'deliveries' ? 'bg-purple-600 text-white font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>All Deliveries</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'analytics' ? 'bg-purple-600 text-white font-bold' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Platform Analytics</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-charcoal-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-charcoal-800 gap-4">
          <div>
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest font-semibold">Super-Admin System</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 capitalize">
              {activeTab}
            </h1>
          </div>

          <button
            onClick={loadAdminData}
            className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {actionMsg && (
          <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* ==================== TAB: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Top row metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-charcoal-400 uppercase">Registered Users</span>
                <div className="text-2xl font-extrabold text-white mt-1 font-mono">{overview.total_registered_users}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">{overview.total_requesters} Requesters • {overview.total_travellers} Travellers</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-brand-400 uppercase">Verified Travellers</span>
                <div className="text-2xl font-extrabold text-brand-400 mt-1 font-mono">{overview.verified_travellers}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">ID check approved</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-charcoal-400 uppercase">Product Requests</span>
                <div className="text-2xl font-extrabold text-white mt-1 font-mono">{overview.total_requests}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">{overview.open_requests} currently open</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-purple-400 uppercase">Deliveries</span>
                <div className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">{overview.completed_deliveries}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">{overview.active_deliveries} in active transit</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-charcoal-800">
                <span className="text-xs font-mono text-emerald-400 uppercase">Platform Revenue</span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">₹{overview.platform_revenue}</div>
                <div className="text-[11px] text-charcoal-400 mt-1">From completed escrows</div>
              </div>
            </div>

            {/* Quick action shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-charcoal-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Recent User Registrations</span>
                </h3>
                <div className="divide-y divide-charcoal-800 text-xs">
                  {usersList.slice(0, 4).map(u => (
                    <div key={u.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">{u.username}</span>
                        <span className="text-charcoal-400 text-[11px] block">{u.email}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-charcoal-800 text-charcoal-300">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-charcoal-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-400" />
                  <span>Live Deliveries Snapshot</span>
                </h3>
                <div className="divide-y divide-charcoal-800 text-xs">
                  {deliveriesList.slice(0, 4).map(d => (
                    <div key={d.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">{d.tracking_code}</span>
                        <span className="text-charcoal-400 text-[11px] block">{d.request?.product_name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-brand-500/20 text-brand-300">
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB: USER MANAGEMENT ==================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* Filter toolbar */}
            <div className="glass-panel p-4 rounded-2xl border border-charcoal-800 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFilterUsers('')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                    selectedRole === '' ? 'bg-purple-600 text-white' : 'bg-charcoal-800 text-charcoal-400'
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => handleFilterUsers('REQUESTER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                    selectedRole === 'REQUESTER' ? 'bg-purple-600 text-white' : 'bg-charcoal-800 text-charcoal-400'
                  }`}
                >
                  Requesters
                </button>
                <button
                  onClick={() => handleFilterUsers('TRAVELLER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                    selectedRole === 'TRAVELLER' ? 'bg-purple-600 text-white' : 'bg-charcoal-800 text-charcoal-400'
                  }`}
                >
                  Travellers
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search user by name/email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-xs text-white"
                />
                <button
                  onClick={() => handleFilterUsers(selectedRole)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel rounded-2xl border border-charcoal-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-charcoal-900 text-charcoal-400 uppercase font-mono border-b border-charcoal-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Identity Verification</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-charcoal-850/50">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.username}</div>
                        <div className="text-[11px] text-charcoal-400">{u.email || u.phone_number || 'No email provided'}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-charcoal-800 text-charcoal-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                          u.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.is_identity_verified ? (
                          <span className="flex items-center gap-1 text-brand-400 font-mono text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-charcoal-500 font-mono text-[11px]">Unverified</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {!u.is_identity_verified && u.role === 'TRAVELLER' && (
                          <button
                            onClick={() => handleUserAction(u.id, 'verify')}
                            className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500 hover:text-charcoal-950 font-semibold text-[11px]"
                          >
                            Verify ID
                          </button>
                        )}
                        <button
                          onClick={() => handleUserAction(u.id, 'toggle_suspend')}
                          className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] ${
                            u.is_active ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          {u.is_active ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ==================== TAB: ALL DELIVERIES ==================== */}
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-4">Complete System Deliveries ({deliveriesList.length})</h3>
            <div className="glass-panel rounded-2xl border border-charcoal-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-charcoal-900 text-charcoal-400 uppercase font-mono border-b border-charcoal-800">
                  <tr>
                    <th className="p-4">Tracking Code</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Requester</th>
                    <th className="p-4">Traveller</th>
                    <th className="p-4">Reward</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800">
                  {deliveriesList.map(d => (
                    <tr key={d.id} className="hover:bg-charcoal-850/50">
                      <td className="p-4 font-mono font-bold text-brand-400">{d.tracking_code}</td>
                      <td className="p-4 text-white font-medium">{d.request?.product_name}</td>
                      <td className="p-4 text-charcoal-300">{d.request?.requester?.username}</td>
                      <td className="p-4 text-charcoal-300">{d.traveller?.username}</td>
                      <td className="p-4 font-mono font-bold text-white">₹{d.agreed_reward}</td>
                      <td className="p-4 font-mono text-purple-300">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: PLATFORM ANALYTICS ==================== */}
        {activeTab === 'analytics' && chartsData && (
          <div className="space-y-8">
            
            {/* Top row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Category Breakdown */}
              <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
                <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-400" />
                  <span>Most Requested Categories</span>
                </h4>
                <div className="space-y-3">
                  {chartsData.category_breakdown?.map((cat, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-charcoal-300 font-mono">{cat.product_category}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 rounded-full bg-charcoal-800 overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${Math.min(100, cat.count * 25)}%` }}
                          />
                        </div>
                        <span className="font-bold text-white font-mono">{cat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Travel Corridors */}
              <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
                <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>High-Volume Travel Routes</span>
                </h4>
                <div className="space-y-3">
                  {chartsData.top_routes?.map((route, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800">
                      <div className="font-semibold text-white">
                        {route.pickup_city} ➔ {route.destination_city}
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-purple-500/20 text-purple-300 font-bold">
                        {route.count} delivery requests
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Monthly Registration Trends */}
            <div className="glass-panel p-6 rounded-2xl border border-charcoal-800">
              <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Monthly User Growth Trends</span>
              </h4>
              <div className="grid grid-cols-6 gap-2 text-center text-xs font-mono">
                {chartsData.monthly_trends?.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
                    <div className="text-charcoal-400 text-[11px]">{m.month}</div>
                    <div className="text-xl font-bold text-brand-400 mt-2">{m.registrations}</div>
                    <div className="text-[10px] text-charcoal-500 mt-1">signups</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;

