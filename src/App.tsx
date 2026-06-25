import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type User,
  Product,
  Order,
  SellerProfile,
  ApiLog,
} from './data/mockData';

import Header from './components/Header';
import Marketplace from './components/Marketplace';
import SellerDashboard from './components/SellerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import AdminPanel from './components/AdminPanel';
import SystemConsole from './components/SystemConsole';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initializePaystackPayment } from './services/paystackService';
import { api } from './services/api';
import { Database, ShieldAlert, CheckCircle, HelpCircle, Loader2, ShieldX, Lock } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────
function UniMartApp() {
  const { user, login, logout, signup, isLoading: authLoading, refreshUser } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sellerProfiles, setSellerProfiles] = useState<SellerProfile[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [paystackKey, setPaystackKey] = useState<string>(() =>
    localStorage.getItem('unimart_paystack_key') || 'pk_test_yours_here'
  );

  const [cart, setCart] = useState<{ product_id: number; product_name: string; price: number; quantity: number }[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('marketplace');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const fetchedProducts = await api.get('/products');
      setProducts(fetchedProducts);

      if (user) {
        const fetchedOrders = await api.get('/orders/my-orders');
        setOrders(fetchedOrders);

        const fetchedWishlist = await api.get('/features/wishlist');
        setWishlist(fetchedWishlist.map((p: Product) => p.id));

        const fetchedNotifications = await api.get('/features/notifications');
        setNotifications(fetchedNotifications);

        if (user.role === 'admin') {
          const fetchedUsers = await api.get('/admin/users');
          setUsers(fetchedUsers);
        }
      }
    } catch (err) {
      console.error('Error fetching data', err);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const addLog = (logData: Omit<ApiLog, 'id' | 'timestamp' | 'latency'>) => {
    setApiLogs((prev) => [
      {
        ...logData,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        latency: Math.floor(Math.random() * 50) + 20,
      },
      ...prev,
    ]);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Cart Actions ─────────────────────────────────────────────────────────────

  const handleAddToCart = (p: Product) => {
    if (!user) return setIsAuthOpen(true);
    setCart((prev) => {
      const exists = prev.find((i) => i.product_id === p.id);
      if (exists) return prev.map((i) => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product_id: p.id, product_name: p.name, price: p.price, quantity: 1 }];
    });
    showToast(`Added ${p.name} to cart.`);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  };

  // ── Checkout ──────────────────────────────────────────────────────────────────

  const handleCheckout = (address: string, phone: string) => {
    if (!user) return setIsAuthOpen(true);

    const cartSnapshot = [...cart];
    const subtotal = cartSnapshot.reduce((s, i) => s + i.price * i.quantity, 0);

    showToast('Initializing secure payment gateway...', 'info');

    initializePaystackPayment({
      publicKey: paystackKey,
      email: user.email,
      amount: subtotal,
      metadata: { cart: cartSnapshot, shipping: address },
      onSuccess: (reference) => {
        finalizeOrder(address, phone, reference, cartSnapshot);
      },
      onCancel: () => {
        showToast('Payment cancelled by user.', 'error');
      },
    });
  };

  const finalizeOrder = async (
    address: string,
    phone: string,
    reference: string,
    cartSnapshot: typeof cart
  ) => {
    try {
      await api.post('/orders/checkout', {
        cart: cartSnapshot,
        shipping_address: address,
        contact_phone: phone,
        payment_reference: reference,
      });

      setCart([]);
      showToast(`Order confirmed! Ref: ${reference}`, 'success');
      fetchData();
      refreshUser();

      addLog({
        method: 'POST',
        path: '/api/orders/checkout',
        status: 200,
        requestBody: JSON.stringify({ reference }),
      });
    } catch (err: any) {
      showToast(err.message || 'Checkout failed', 'error');
    }
  };

  // ── Admin Actions ────────────────────────────────────────────────────────────

  const handleApproveSeller = async (userId: number) => {
    try {
      await api.post(`/admin/sellers/${userId}/approve`, {});
      showToast('Seller approved successfully.', 'success');
      fetchData();
    } catch (err) {
      showToast('Error approving seller', 'error');
    }
  };

  const handleRejectSeller = async (userId: number) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: 'suspended' });
      showToast('Seller rejected.', 'error');
      fetchData();
    } catch (err) {
      showToast('Error rejecting seller', 'error');
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: User['status']) => {
    const next = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: next });
      showToast(`User status updated to ${next}`, 'info');
      fetchData();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const handleResetDatabase = () => {
    showToast('Database reset is only available via manual SQL or server redeploy in real version.', 'info');
  };

  const handleUpdatePaystackKey = (newKey: string) => {
    setPaystackKey(newKey);
    localStorage.setItem('unimart_paystack_key', newKey);
    showToast('Paystack configuration updated.', 'success');
  };

  // ── Product Actions ──────────────────────────────────────────────────────────

  const handleAddProduct = async (productData: any) => {
    try {
      await api.post('/products', productData);
      showToast('Product added successfully', 'success');
      fetchData();
    } catch (err) {
      showToast('Error adding product', 'error');
    }
  };

  const handleUpdateProductStatus = async (productId: number, status: 'active' | 'inactive') => {
    try {
      await api.patch(`/products/${productId}/status`, { status });
      showToast('Product status updated', 'success');
      fetchData();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      showToast('Order status updated', 'success');
      fetchData();
    } catch (err) {
      showToast('Error updating order status', 'error');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await api.post(`/orders/${orderId}/cancel`, {});
      showToast('Order cancelled', 'success');
      fetchData();
      refreshUser();
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed', 'error');
    }
  };

  // ── Wishlist Actions ─────────────────────────────────────────────────────────

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await api.patch(`/features/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Error marking notification read', err);
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (!user) return setIsAuthOpen(true);
    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/features/wishlist/${productId}`);
        setWishlist(prev => prev.filter(id => id !== productId));
        showToast('Removed from wishlist');
      } else {
        await api.post(`/features/wishlist/${productId}`, {});
        setWishlist(prev => [...prev, productId]);
        showToast('Added to wishlist');
      }
    } catch (err) {
      showToast('Error updating wishlist', 'error');
    }
  };

  // ── Auth Loading Screen ──────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Connecting to Nexus Server...</p>
        </div>
      </div>
    );
  }

  // ── Access Denied Component ──────────────────────────────────────────────────
  const AccessDenied = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
      <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-[2rem]">
        <Lock className="h-10 w-10 text-rose-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Access Restricted</h2>
        <p className="text-sm text-slate-400 max-w-xs">{message}</p>
      </div>
      <button
        onClick={() => setCurrentTab('marketplace')}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
      >
        Back to Marketplace
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-midnight font-sans text-slate-200 selection:bg-cyber-indigo/30 selection:text-white pb-32 md:pb-0">
      <Header
        currentUser={user}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onCheckout={handleCheckout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={logout}
        onChangeRole={() => {}} // Disabled in real mode
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">

        {currentTab === 'marketplace' && (
          <Marketplace
            products={products}
            sellerProfiles={sellerProfiles}
            onAddToCart={handleAddToCart}
            currentUserRole={user?.role}
            onOpenAuth={() => setIsAuthOpen(true)}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        )}

        {currentTab === 'buyer' && (
          <>
            {user ? (
              <BuyerDashboard
                orders={orders}
                wishlistItems={products.filter(p => wishlist.includes(p.id))}
                onTabChange={setCurrentTab}
                onCancelOrder={handleCancelOrder}
              />
            ) : (
              <AccessDenied message="Please log in to view your dashboard." />
            )}
          </>
        )}

        {currentTab === 'seller' && (
          <>
            {user && (user.role === 'seller' || user.role === 'admin') ? (
              <SellerDashboard
                products={products}
                orders={orders}
                currentUser={user}
                sellerProfile={sellerProfiles.find((s) => s.user_id === user.id)}
                onAddProduct={handleAddProduct}
                onUpdateProductStatus={handleUpdateProductStatus}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpgradeSubscription={() => {}}
                onCancelOrder={handleCancelOrder}
              />
            ) : (
              <AccessDenied
                message={
                  !user
                    ? 'Please log in as a seller or admin to access the Seller Hub.'
                    : 'Your account does not have seller privileges.'
                }
              />
            )}
          </>
        )}

        {currentTab === 'admin' && (
          <>
            {user?.role === 'admin' ? (
              <AdminPanel
                users={users}
                sellerProfiles={sellerProfiles}
                products={products}
                orders={orders}
                onApproveSeller={handleApproveSeller}
                onRejectSeller={handleRejectSeller}
                onToggleUserStatus={handleToggleUserStatus}
                onResetDatabase={handleResetDatabase}
                onLoadDemoData={() => {}}
                paystackKey={paystackKey}
                onUpdatePaystackKey={handleUpdatePaystackKey}
              />
            ) : (
              <AccessDenied message="Administrative privileges required." />
            )}
          </>
        )}

        {currentTab === 'console' && (
          <SystemConsole
            users={users}
            products={products}
            orders={orders}
            sellerProfiles={sellerProfiles}
            apiLogs={apiLogs}
            onClearLogs={() => setApiLogs([])}
            onExecuteRawSql={() => ({ success: false, message: 'Direct SQL disabled in production mode.' })}
          />
        )}
      </main>

      <footer className="border-t border-white/5 bg-slate-950/50 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl text-indigo-400 border border-white/5">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-white font-black uppercase tracking-tighter">UniMart Production Nexus</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest">
                SQLite Real-Time Engine • JWT Security • Zero Platform Fees
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldX className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-slate-500">Secure Peer-to-Peer Transactions</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 right-10 z-[100]"
          >
            <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border ${toast.type === 'error' ? 'bg-rose-950 border-rose-800 text-rose-400' : 'bg-slate-900 border-white/10 text-white'}`}>
              {toast.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> : toast.type === 'error' ? <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" /> : <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0" />}
              <span className="text-xs font-bold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={async (email, password) => {
          const success = await login(email, password);
          if (success) {
            showToast('Welcome back to the Nexus!');
            setIsAuthOpen(false);
          } else {
            showToast('Invalid credentials or account suspended.', 'error');
          }
        }}
        onRegister={async (data) => {
          const success = await signup(data);
          if (success) {
            showToast(data.role === 'seller' ? 'Application submitted!' : 'Account created successfully!', 'success');
            setIsAuthOpen(false);
          } else {
            showToast('Signup failed. Email might be taken.', 'error');
          }
        }}
        demoUsers={[]}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UniMartApp />
    </AuthProvider>
  );
}
