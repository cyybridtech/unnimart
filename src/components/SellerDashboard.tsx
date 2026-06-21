import { useState, useMemo, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  ShoppingBag, 
  TrendingUp, 
  Plus, 
  LayoutDashboard, 
  Box, 
  Truck, 
  Star, 
  Activity,
  Database,
  CreditCard,
  FileText,
  Award,
  CheckCircle2
} from 'lucide-react';
import { Product, Order, type User, SUBSCRIPTION_PLANS, APP_FEATURES, SellerProfile } from '../data/mockData';

interface SellerDashboardProps {
  products: Product[];
  orders: Order[];
  currentUser: User;
  sellerProfile?: SellerProfile;
  onAddProduct: (productData: Omit<Product, 'id' | 'seller_id' | 'seller_name' | 'sales_count' | 'created_at'>) => void;
  onUpdateProductStatus: (productId: number, status: 'active' | 'inactive') => void;
  onUpdateOrderStatus: (orderId: number, newStatus: Order['status']) => void;
  onUpgradeSubscription: (planId: string) => void;
  onCancelOrder: (orderId: number) => void;
}

export default function SellerDashboard({
  products,
  orders,
  currentUser,
  sellerProfile,
  onAddProduct,
  onUpdateProductStatus,
  onUpdateOrderStatus,
  onUpgradeSubscription,
  onCancelOrder
}: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'subscription' | 'docs'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter global data
  const sellerProducts = useMemo(() => products.filter(p => p.seller_id === currentUser.id), [products, currentUser.id]);
  const sellerOrders = useMemo(() => orders.filter(o => o.seller_id === currentUser.id), [orders, currentUser.id]);

  // Analytics Simulation
  const chartData = [
    { name: 'Mon', revenue: 120, sales: 8 },
    { name: 'Tue', revenue: 300, sales: 15 },
    { name: 'Wed', revenue: 200, sales: 10 },
    { name: 'Thu', revenue: 450, sales: 22 },
    { name: 'Fri', revenue: 600, sales: 30 },
    { name: 'Sat', revenue: 550, sales: 25 },
    { name: 'Sun', revenue: 800, sales: 40 },
  ];

  const totalRevenue = sellerOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const netEarnings = totalRevenue;

  // Add Product Form Logic (Now with SKU and Rating)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Clothing & Fashion',
    description: '',
    imageUrl: '',
    isPreorder: false,
    preorderDeadline: '',
    stock: '10'
  });

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAddProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      image_url: formData.imageUrl,
      is_preorder: formData.isPreorder,
      preorder_deadline: formData.isPreorder ? formData.preorderDeadline : undefined,
      stock: parseInt(formData.stock),
      status: 'active',
      rating: 5.0,
      reviews: [],
      sku: `${formData.category.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`
    });
    setFormData({ name: '', price: '', category: 'Clothing & Fashion', description: '', imageUrl: '', isPreorder: false, preorderDeadline: '', stock: '10' });
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Side Navigation - Shopify Style */}
      <aside className="w-full lg:w-64 space-y-2 mb-6 lg:mb-0">
        <div className="p-5 sm:p-6 bg-slate-900 border border-white/5 rounded-[2rem] space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tighter">Nexus OS</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Seller Engine</p>
            </div>
          </div>

          <nav className="grid grid-cols-2 sm:grid-cols-1 lg:block gap-2 sm:space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <Activity className="h-4 w-4" /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <Box className="h-4 w-4" /> Inventory
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <Truck className="h-4 w-4" /> Fulfillment
            </button>
            <button 
              onClick={() => setActiveTab('subscription')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'subscription' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <CreditCard className="h-4 w-4" /> Subscription
            </button>
            <button 
              onClick={() => setActiveTab('docs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'docs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <FileText className="h-4 w-4" /> System Docs
            </button>
          </nav>

          <div className="pt-6 border-t border-white/5">
            <button 
              onClick={() => setShowAddForm(true)}
              className="w-full bg-white text-slate-950 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>
        </div>

        {/* System Health Widget */}
        <div className="hidden sm:block p-6 bg-slate-900 border border-white/5 rounded-[2rem] space-y-4">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Database className="h-3 w-3" /> Relational Status
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">MySQL Pool</span>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Cache Layer</span>
              <span className="text-emerald-400 font-bold">L1 Hit</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Command Center */}
      <main className="flex-1 space-y-8">
        
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-slate-900 border border-white/5 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="h-24 w-24" />
                </div>
                <div className="relative z-10 space-y-1.5 sm:space-y-2">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Revenue Audit</span>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono">${totalRevenue.toFixed(2)}</div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[9px] sm:text-[10px] text-emerald-400 font-bold">
                    <span>Net Payout: ${netEarnings.toFixed(2)}</span>
                    <span className="text-slate-500 hidden sm:inline">(100% — Zero Fees)</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShoppingBag className="h-24 w-24" />
                </div>
                <div className="relative z-10 space-y-1.5 sm:space-y-2">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Order Volume</span>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono">{sellerOrders.length}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Peer-to-peer fulfillments</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Star className="h-24 w-24" />
                </div>
                <div className="relative z-10 space-y-1.5 sm:space-y-2">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Shop Rating</span>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono">{sellerProfile?.rating?.toFixed(2) ?? '5.00'}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium line-clamp-1">{sellerProfile?.verified ? 'Verified Active' : 'Verification Pending'}</div>
                </div>
              </div>
            </div>

            {/* Analytics Chart */}
            <div className="bg-slate-900 border border-white/5 p-6 sm:p-8 rounded-[2rem]">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tighter">Revenue Trends</h3>
                  <p className="text-xs text-slate-500">Live feed from sales_logs table</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-indigo-600 rounded-lg text-[10px] font-bold text-white">7 Days</button>
                  <button className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400">30 Days</button>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'inventory' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tighter">Inventory Core</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 italic">Managing {sellerProducts.length} unique SKU variants</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/20">
                    <th className="px-6 sm:px-8 py-4 sm:py-5">Product SKU</th>
                    <th className="px-6 sm:px-8 py-4 sm:py-5">Inventory Status</th>
                    <th className="px-6 sm:px-8 py-4 sm:py-5">Sales Performance</th>
                    <th className="px-6 sm:px-8 py-4 sm:py-5">Price Model</th>
                    <th className="px-6 sm:px-8 py-4 sm:py-5 text-right">State Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sellerProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img src={p.image_url} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <div className="text-xs font-bold text-white">{p.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">{p.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <div className={`text-[10px] font-black uppercase ${p.stock < 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {p.is_preorder ? 'Pre-order Cycle' : `${p.stock} Units In Stock`}
                          </div>
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: p.is_preorder ? '100%' : `${Math.min(100, (p.stock/20)*100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-xs font-bold text-slate-300">{p.sales_count} Transactions</div>
                        <div className="text-[10px] text-slate-500">Gross: ${(p.sales_count * p.price).toFixed(2)}</div>
                      </td>
                      <td className="px-8 py-5 font-mono text-xs text-white">${p.price.toFixed(2)}</td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => onUpdateProductStatus(p.id, p.status === 'active' ? 'inactive' : 'active')}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {p.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
            {sellerOrders.length === 0 ? (
              <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-12 sm:p-20 text-center space-y-4">
                <ShoppingBag className="h-10 sm:h-12 w-10 sm:w-12 text-slate-700 mx-auto" />
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tighter">Awaiting Transactions</h3>
                <p className="text-[11px] sm:text-sm text-slate-500 max-w-xs mx-auto">Once buyers checkout, their transactional logs will appear here for fulfillment.</p>
              </div>
            ) : (
              sellerOrders.map(order => (
                <div key={order.id} className="bg-slate-900 border border-white/5 rounded-[2rem] p-6 sm:p-8 hover:border-indigo-500/30 transition-all group">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Order ID: #{order.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Customer</span>
                          <div className="text-xs font-bold text-white">@{order.buyer_name}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Location</span>
                          <div className="text-xs font-bold text-white line-clamp-1">{order.shipping_address}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Method</span>
                          <div className="text-xs font-bold text-white capitalize">{order.order_type}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Payout</span>
                          <div className="text-xs font-bold text-emerald-400 font-mono">${order.total_amount.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 self-end md:self-center">
                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button 
                          onClick={() => {
                            const statuses: Order['status'][] = ['pending', 'preparing', 'shipped', 'completed'];
                            const nextIdx = statuses.indexOf(order.status) + 1;
                            if (nextIdx < statuses.length) onUpdateOrderStatus(order.id, statuses[nextIdx]);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-xl shadow-indigo-600/20 transition-all cursor-pointer"
                        >
                          Next Stage: {
                            order.status === 'pending' ? 'Prepare' : 
                            order.status === 'preparing' ? 'Ship' : 'Deliver'
                          }
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => onCancelOrder(order.id)}
                          className="text-[10px] text-rose-500 font-bold hover:underline"
                        >
                          Decline Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'subscription' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-8 sm:p-10 flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-8">
              <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                  <Award className="h-3 w-3" /> Recurring Revenue Model
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">Your Nexus Subscription</h2>
                <p className="text-slate-400 max-w-md text-xs sm:text-sm leading-relaxed mx-auto lg:mx-0">
                  UniMart has transitioned to a subscription-based platform. Choose a plan that fits your growth stage. No more platform fees for Pro and Enterprise members!
                </p>
              </div>
              <div className="bg-slate-950 border border-white/10 p-6 sm:p-8 rounded-[2rem] text-center space-y-2 w-full lg:w-auto lg:min-w-[240px]">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Plan</span>
                <div className="text-2xl font-black text-white capitalize">{sellerProfile?.subscription?.plan_id || 'Free Tier'}</div>
                <div className="text-[11px] text-emerald-400 font-bold">Status: {sellerProfile?.subscription?.status || 'Active'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map(plan => (
                <div key={plan.id} className={`bg-slate-900 border ${sellerProfile?.subscription?.plan_id === plan.id ? 'border-indigo-500 shadow-lg shadow-indigo-600/10' : 'border-white/5'} p-8 rounded-[2.5rem] flex flex-col justify-between group`}>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-white">{plan.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white font-mono">${plan.price}</span>
                        <span className="text-xs text-slate-500 font-bold">/{plan.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                          <CheckCircle2 className="h-4 w-4 text-indigo-500" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    onClick={() => onUpgradeSubscription(plan.id)}
                    disabled={sellerProfile?.subscription?.plan_id === plan.id}
                    className={`mt-10 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      sellerProfile?.subscription?.plan_id === plan.id 
                      ? 'bg-indigo-600/20 text-indigo-400 cursor-not-allowed' 
                      : 'bg-white text-slate-950 hover:scale-105 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {sellerProfile?.subscription?.plan_id === plan.id ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'docs' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-indigo-600 p-10 rounded-[2.5rem] space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-20"><FileText className="h-40 w-40" /></div>
              <h2 className="text-3xl font-black text-white">Platform System Documentation</h2>
              <p className="text-indigo-100 max-w-xl text-sm leading-relaxed relative z-10">
                A comprehensive guide to the features, functions, and architecture of the UniMart Hub. Built for Chief Senior Software Engineers and platform stakeholders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {APP_FEATURES.map((cat, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-4">{cat.category}</h3>
                  <div className="space-y-6">
                    {cat.features.map((f, fi) => (
                      <div key={fi} className="space-y-1">
                        <div className="text-sm font-bold text-white">{f.name}</div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </main>

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg" onClick={() => setShowAddForm(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Register New SKU</h3>
                <p className="text-xs text-slate-500">Relational record for products & seller_profiles</p>
              </div>
              <button onClick={() => {
                setFormData({ name: '', price: '', category: 'Clothing & Fashion', description: '', imageUrl: '', isPreorder: false, preorderDeadline: '', stock: '10' });
                setShowAddForm(false);
              }} className="text-slate-500 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Title</label>
                  <input required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500" placeholder="e.g. Vintage Denim" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (USD)</label>
                  <input required type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <textarea required rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500" placeholder="Technical specifications..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Clothing & Fashion</option>
                    <option>Bags & Accessories</option>
                    <option>Food & Snacks</option>
                    <option>Services/Tech</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Units</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thumbnail Image URL</label>
                <input required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>

              <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white">Pre-order Initiative</span>
                  <p className="text-[10px] text-slate-500">Collect capital before production cycle</p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={formData.isPreorder} onChange={e => setFormData({...formData, isPreorder: e.target.checked})} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => {
                  setFormData({ name: '', price: '', category: 'Clothing & Fashion', description: '', imageUrl: '', isPreorder: false, preorderDeadline: '', stock: '10' });
                  setShowAddForm(false);
                }} className="px-6 py-3 rounded-xl text-xs font-bold text-slate-400">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-xs shadow-xl shadow-indigo-600/20">Commit Transaction</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
