import { Users, ShieldCheck, DollarSign, ShoppingBag, UserMinus, UserCheck, Check, X, Settings, Key, RefreshCw, Database } from 'lucide-react';
import { User, SellerProfile, Product, Order } from '../data/mockData';
import { useState } from 'react';

interface AdminPanelProps {
  users: User[];
  sellerProfiles: SellerProfile[];
  products: Product[];
  orders: Order[];
  onApproveSeller: (userId: number) => void;
  onRejectSeller: (userId: number) => void;
  onToggleUserStatus: (userId: number, currentStatus: User['status']) => void;
  onResetDatabase: () => void;
  onLoadDemoData: () => void;
  paystackKey: string;
  onUpdatePaystackKey: (newKey: string) => void;
}

export default function AdminPanel({
  users,
  sellerProfiles,
  products,
  orders,
  onApproveSeller,
  onRejectSeller,
  onToggleUserStatus,
  onResetDatabase,
  onLoadDemoData,
  paystackKey,
  onUpdatePaystackKey,
}: AdminPanelProps) {
  const [localKey, setLocalKey] = useState(paystackKey);
  // Stats
  const totalSalesVolume = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingSellers = users.filter((u) => u.role === 'seller' && u.status === 'pending');
  const activeSellers = users.filter((u) => u.role === 'seller' && u.status === 'active');
  const activeBuyers = users.filter((u) => u.role === 'buyer');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const getSellerProfile = (userId: number): SellerProfile | undefined =>
    sellerProfiles.find((sp) => sp.user_id === userId);


  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-red-500" />
          Super Admin Control Panel
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Head Lead & Senior Software Engineer console. Approve student entrepreneurs, moderate accounts, and monitor platform health.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-red-500/10 p-3 rounded-xl text-red-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Total Campus Users</span>
            <span className="font-mono text-lg font-black text-white">{users.length}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              {activeSellers.length} Sellers | {activeBuyers.length} Buyers
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Total Sales Volume</span>
            <span className="font-mono text-lg font-black text-white">${totalSalesVolume.toFixed(2)}</span>
            <span className="text-[9px] text-emerald-400 block mt-0.5">Through peer network</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Completed Orders</span>
            <span className="font-mono text-lg font-black text-white">{completedOrders.length}</span>
            <span className="text-[9px] text-indigo-400 block mt-0.5">of {orders.length} total orders</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Active Listings</span>
            <span className="font-mono text-lg font-black text-white">{products.length}</span>
            <span className="text-[9px] text-purple-400 block mt-0.5">
              {products.filter((p) => p.is_preorder).length} Pre-order initiatives
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Approvals + User Table */}
        <div className="lg:col-span-8 space-y-6">

          {/* Pending Approvals */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Pending Entrepreneur Approvals ({pendingSellers.length})
                </h3>
                <p className="text-[10px] text-slate-400">Review student business proposals and verify their shops.</p>
              </div>
              <span className="text-[10px] font-mono text-amber-500 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/30">
                PENDING REQUESTS
              </span>
            </div>

            {pendingSellers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2 bg-emerald-950/40 p-1.5 rounded-full" />
                <p className="text-xs font-semibold">No pending applications!</p>
                <p className="text-[10px] text-slate-600 mt-0.5">All seller applications have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSellers.map((seller) => {
                  const profile = getSellerProfile(seller.id);
                  return (
                    <div key={seller.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={seller.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${seller.username}`}
                            alt={seller.username}
                            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-200">
                              {seller.username}{' '}
                              <span className="font-mono text-[10px] text-slate-500">({seller.email})</span>
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              📍 Dorm: {seller.dorm} | 📞 Phone: {seller.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => onRejectSeller(seller.id)}
                            className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-900/30 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <X className="h-3 w-3" /> Decline
                          </button>
                          <button
                            onClick={() => onApproveSeller(seller.id)}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/35 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve & Verify
                          </button>
                        </div>
                      </div>

                      {profile && (
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <p className="font-semibold text-amber-400">Shop: {profile.business_name}</p>
                          <p className="text-[11px] text-slate-400 mt-1">Category: {profile.category}</p>
                          <p className="text-[11px] text-slate-300 italic mt-1 leading-normal">"{profile.description}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Directory */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Campus User Directory</h3>
                <p className="text-[10px] text-slate-400">Manage database entries for all platform participants.</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800">
                TABLE: users
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-2.5 px-2">ID</th>
                    <th className="py-2.5 px-2">User / Role</th>
                    <th className="py-2.5 px-2">Contact Details</th>
                    <th className="py-2.5 px-2 text-right">Balance</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/30 transition-colors">
                      <td className="py-3 px-2 font-mono text-[10px] text-slate-500">{u.id}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={u.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`}
                            alt=""
                            className="w-6 h-6 rounded-full border border-slate-800 object-cover"
                          />
                          <div>
                            <p className="text-slate-200 font-semibold">{u.username}</p>
                            <span
                              className={`text-[8px] font-bold uppercase px-1 rounded ${
                                u.role === 'admin'
                                  ? 'bg-red-500/20 text-red-400'
                                  : u.role === 'seller'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[10px] text-slate-400 space-y-0.5">
                        <p>{u.email}</p>
                        <p className="text-slate-500">📍 {u.dorm}</p>
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-slate-200">
                        ${u.balance.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-900/20'
                              : u.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-900/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-900/20'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {u.role !== 'admin' ? (
                          <button
                            onClick={() => onToggleUserStatus(u.id, u.status)}
                            className={`p-1 rounded hover:bg-slate-800 text-xs transition-all cursor-pointer ${
                              u.status === 'active'
                                ? 'text-rose-400 hover:text-rose-300'
                                : 'text-emerald-400 hover:text-emerald-300'
                            }`}
                            title={u.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                          >
                            {u.status === 'active' ? (
                              <UserMinus className="h-3.5 w-3.5 mx-auto" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5 mx-auto" />
                            )}
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-600 font-bold">Immutable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right: Platform Status */}
        <div className="lg:col-span-4 space-y-6">

          {/* Platform Health */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Platform Health</h3>
              <p className="text-[10px] text-slate-400">Live system status and service indicators.</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400">MySQL Connection Pool</span>
                <span className="text-emerald-400 font-bold font-mono">10 / 10 Active</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400">JWT Token Expiry</span>
                <span className="text-slate-300 font-mono">24 Hours</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400">Dorm Delivery Boundaries</span>
                <span className="text-emerald-400 font-bold font-mono">Active (All Campus)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400">Platform Fee Policy</span>
                <span className="text-indigo-400 font-bold font-mono">Zero Fee</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400">Paystack Gateway</span>
                <span className="text-emerald-400 font-bold font-mono">Online</span>
              </div>
            </div>
          </div>

          {/* Operations & System Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-indigo-400" />
              Ecosystem Control & Keys
            </h3>
            
            {/* Paystack Public Key Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onUpdatePaystackKey(localKey);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Paystack Public Key (Client-Side)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-8 pr-3 py-2 text-[11px] text-slate-350 focus:border-indigo-500 focus:outline-hidden font-mono"
                    placeholder="pk_test_..."
                  />
                  <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-650" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-2 rounded-xl transition-all cursor-pointer"
              >
                Save Paystack Key
              </button>
            </form>

            <div className="border-t border-slate-800 my-4" />

            {/* DB Purge / Seed Tools */}
            <div className="space-y-2.5">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Database Sandbox Maintenance
              </label>
              
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset the database? This will purge all items, orders, and registrations, leaving only the secure admin pre-seeded user. This action cannot be undone.")) {
                    onResetDatabase();
                  }
                }}
                className="w-full bg-rose-500/10 hover:bg-rose-600 text-rose-450 hover:text-white border border-rose-950 text-[10px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset DB to Production Slate
              </button>

              <button
                onClick={onLoadDemoData}
                className="w-full bg-emerald-500/10 hover:bg-emerald-600 text-emerald-450 hover:text-white border border-emerald-950 text-[10px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Database className="h-3.5 w-3.5" />
                Load Demo Mock Dataset
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
