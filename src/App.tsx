import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Product,
  Order,
  SellerProfile,
  ApiLog,
  INITIAL_USERS,
  INITIAL_SELLER_PROFILES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  SUBSCRIPTION_PLANS,
} from './data/mockData';

import Header from './components/Header';
import Marketplace from './components/Marketplace';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import SystemConsole from './components/SystemConsole';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth, PRODUCTION_ADMIN_USER } from './context/AuthContext';
import { initializePaystackPayment } from './services/paystackService';
import { Database, ShieldAlert, CheckCircle, HelpCircle, Loader2, ShieldX, Lock } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Mock SQL Engine — parses simple SELECT / UPDATE statements against live state
// ─────────────────────────────────────────────────────────────────────────────
function parseSqlQuery(
  sql: string,
  state: { users: User[]; products: Product[]; orders: Order[]; sellerProfiles: SellerProfile[] },
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
): { success: boolean; message: string; rows?: Record<string, unknown>[] } {
  const trimmed = sql.trim().replace(/;\s*$/, '');
  const upper = trimmed.toUpperCase();

  const tableMap: Record<string, unknown[]> = {
    users: state.users,
    products: state.products,
    orders: state.orders,
    seller_profiles: state.sellerProfiles,
  };

  try {
    // ── SELECT ────────────────────────────────────────────────────────────────
    if (upper.startsWith('SELECT')) {
      const fromMatch = trimmed.match(/FROM\s+(\w+)/i);
      if (!fromMatch) return { success: false, message: 'Syntax Error: Missing FROM clause.' };

      const tableName = fromMatch[1].toLowerCase();
      const rawData = tableMap[tableName];
      if (!rawData) return { success: false, message: `Error: Table '${tableName}' not found in unimart_db.` };

      // Apply WHERE condition
      const whereMatch = trimmed.match(/WHERE\s+(.+)/i);
      let filtered = rawData as Record<string, unknown>[];

      if (whereMatch) {
        const cond = whereMatch[1].trim();
        const eqMatch = cond.match(/^(\w+)\s*=\s*'?([^']+)'?$/i);
        const gtMatch = cond.match(/^(\w+)\s*>\s*(\d+(?:\.\d+)?)$/i);
        const ltMatch = cond.match(/^(\w+)\s*<\s*(\d+(?:\.\d+)?)$/i);
        const likeMatch = cond.match(/^(\w+)\s+LIKE\s+'%?([^%']+)%?'$/i);

        if (eqMatch) {
          const [, col, val] = eqMatch;
          const numVal = parseFloat(val);
          filtered = filtered.filter((r) => {
            if (val === '1' || val.toLowerCase() === 'true') return r[col] === true || r[col] === 1;
            if (val === '0' || val.toLowerCase() === 'false') return r[col] === false || r[col] === 0;
            if (!isNaN(numVal)) return Number(r[col]) === numVal;
            return String(r[col]).toLowerCase() === val.toLowerCase();
          });
        } else if (gtMatch) {
          const [, col, val] = gtMatch;
          filtered = filtered.filter((r) => Number(r[col]) > parseFloat(val));
        } else if (ltMatch) {
          const [, col, val] = ltMatch;
          filtered = filtered.filter((r) => Number(r[col]) < parseFloat(val));
        } else if (likeMatch) {
          const [, col, val] = likeMatch;
          filtered = filtered.filter((r) => String(r[col]).toLowerCase().includes(val.toLowerCase()));
        }
      }

      // Parse column list
      const colsMatch = trimmed.match(/SELECT\s+(.+?)\s+FROM/i);
      let rows: Record<string, unknown>[];

      if (colsMatch && colsMatch[1].trim() !== '*') {
        const cols = colsMatch[1].split(',').map((c) => c.trim());
        rows = filtered.map((r) => {
          const obj: Record<string, unknown> = {};
          cols.forEach((c) => { obj[c] = r[c]; });
          return obj;
        });
      } else {
        // Flatten — exclude deep nested objects for readability
        rows = filtered.map((r) => {
          const obj: Record<string, unknown> = {};
          Object.entries(r).forEach(([k, v]) => {
            if (Array.isArray(v)) obj[k] = `[${v.length} records]`;
            else if (v !== null && typeof v === 'object') obj[k] = JSON.stringify(v);
            else obj[k] = v;
          });
          return obj;
        });
      }

      return { success: true, message: `${rows.length} row(s) in set (0.00 sec)`, rows };
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    if (upper.startsWith('UPDATE')) {
      const tableMatch = trimmed.match(/UPDATE\s+(\w+)\s+SET/i);
      if (!tableMatch) return { success: false, message: 'Syntax Error: Invalid UPDATE statement.' };

      const tableName = tableMatch[1].toLowerCase();
      const setMatch = trimmed.match(/SET\s+(.+?)\s+WHERE/i);
      const whereMatch = trimmed.match(/WHERE\s+(.+)/i);

      if (!setMatch) return { success: false, message: 'Syntax Error: Missing SET clause.' };
      if (!whereMatch) return { success: false, message: 'Safety: UPDATE without WHERE is blocked.' };

      const setPart = setMatch[1].trim();
      const wherePart = whereMatch[1].trim();

      const whereEq = wherePart.match(/^(\w+)\s*=\s*'?([^']+)'?$/i);
      if (!whereEq) return { success: false, message: 'Syntax Error: Invalid WHERE clause.' };
      const [, whereCol, whereVal] = whereEq;

      // Patterns: col = val | col = col + val | col = col - val
      const addMatch = setPart.match(/^(\w+)\s*=\s*\w+\s*\+\s*(\d+(?:\.\d+)?)$/i);
      const subMatch = setPart.match(/^(\w+)\s*=\s*\w+\s*-\s*(\d+(?:\.\d+)?)$/i);
      const setEq    = setPart.match(/^(\w+)\s*=\s*'?([^']+)'?$/i);

      if (tableName === 'users') {
        let affectedRows = 0;
        setUsers((prev) =>
          prev.map((u) => {
            const rowVal = String((u as unknown as Record<string, unknown>)[whereCol]);
            if (rowVal.toLowerCase() !== whereVal.toLowerCase()) return u;
            affectedRows++;
            if (addMatch) {
              const [, col, amount] = addMatch;
              return { ...u, [col]: Number((u as unknown as Record<string, unknown>)[col]) + parseFloat(amount) };
            }
            if (subMatch) {
              const [, col, amount] = subMatch;
              return { ...u, [col]: Number((u as unknown as Record<string, unknown>)[col]) - parseFloat(amount) };
            }
            if (setEq) {
              const [, col, val] = setEq;
              const parsed = parseFloat(val);
              return { ...u, [col]: isNaN(parsed) ? val : parsed };
            }
            return u;
          })
        );
        return { success: true, message: `Query OK, ${affectedRows} row(s) affected (0.01 sec)` };
      }

      return { success: false, message: `Note: Sandbox UPDATE is only available on the 'users' table. SELECT works on all tables.` };
    }

    return { success: false, message: `Error: Unsupported statement. Supported: SELECT, UPDATE.` };
  } catch (err) {
    return { success: false, message: `Runtime Error: ${String(err)}` };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────
function UniMartApp() {
  const { user, login, loginAsDemo, logout, signup, isLoading: authLoading } = useAuth();

  // Database State — initialized from localStorage with clean production fallback
  const [users, setUsers] = useState<User[]>(() =>
    JSON.parse(localStorage.getItem('unimart_users') || JSON.stringify([PRODUCTION_ADMIN_USER]))
  );
  const [products, setProducts] = useState<Product[]>(() =>
    JSON.parse(localStorage.getItem('unimart_products') || '[]')
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    JSON.parse(localStorage.getItem('unimart_orders') || '[]')
  );
  const [sellerProfiles, setSellerProfiles] = useState<SellerProfile[]>(() =>
    JSON.parse(localStorage.getItem('unimart_seller_profiles') || '[]')
  );

  const [paystackKey, setPaystackKey] = useState<string>(() =>
    localStorage.getItem('unimart_paystack_key') || 'pk_test_yours_here'
  );

  const [cart, setCart] = useState<{ product_id: number; product_name: string; price: number; quantity: number }[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('marketplace');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Keep localStorage in sync — called manually on each mutation for real-time persistence
  const persistUsers = (updated: User[]) => {
    localStorage.setItem('unimart_users', JSON.stringify(updated));
  };
  const persistProducts = (updated: Product[]) => {
    localStorage.setItem('unimart_products', JSON.stringify(updated));
  };
  const persistOrders = (updated: Order[]) => {
    localStorage.setItem('unimart_orders', JSON.stringify(updated));
  };
  const persistSellerProfiles = (updated: SellerProfile[]) => {
    localStorage.setItem('unimart_seller_profiles', JSON.stringify(updated));
  };

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

    // Capture cart snapshot at checkout time to avoid stale closure in async callback
    const cartSnapshot = [...cart];
    const subtotal = cartSnapshot.reduce((s, i) => s + i.price * i.quantity, 0);

    showToast('Initializing secure payment gateway...', 'info');

    initializePaystackPayment({
      publicKey: paystackKey,
      email: user.email,
      amount: subtotal,
      metadata: { cart: cartSnapshot, shipping: address },
      onSuccess: (reference) => {
        finalizeOrder(address, phone, subtotal, reference, cartSnapshot);
      },
      onCancel: () => {
        showToast('Payment cancelled by user.', 'error');
      },
    });
  };

  const finalizeOrder = (
    address: string,
    phone: string,
    subtotal: number,
    reference: string,
    cartSnapshot: typeof cart
  ) => {
    const firstProduct = products.find((p) => p.id === cartSnapshot[0]?.product_id);
    if (!firstProduct || !user) return;

    // Decrement stock and increment sales_count atomically
    setProducts((prev) => {
      const updated = prev.map((p) => {
        const item = cartSnapshot.find((i) => i.product_id === p.id);
        if (item) return { ...p, stock: Math.max(0, p.stock - item.quantity), sales_count: p.sales_count + item.quantity };
        return p;
      });
      persistProducts(updated);
      return updated;
    });

    // Generate a collision-safe order ID
    const orderId = Date.now();

    const newOrder: Order = {
      id: orderId,
      buyer_id: user.id,
      buyer_name: user.username,
      seller_id: firstProduct.seller_id,
      seller_name: firstProduct.seller_name,
      items: cartSnapshot,
      total_amount: subtotal,
      status: 'pending',
      order_type: 'regular',
      shipping_address: address,
      contact_phone: phone,
      created_at: new Date().toISOString(),
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      persistOrders(updated);
      return updated;
    });

    setCart([]);
    showToast(`Order #${orderId} confirmed! Ref: ${reference}`, 'success');

    addLog({
      method: 'POST',
      path: '/api/v1/checkout/verify',
      status: 200,
      requestBody: JSON.stringify({ reference }),
      sqlQuery: `INSERT INTO orders (...) VALUES (...); UPDATE products SET stock = stock - n, sales_count = sales_count + n;`,
    });
  };

  // ── Subscription Upgrade ─────────────────────────────────────────────────────

  const handleUpgradeSubscription = (planId: string) => {
    if (!user) return;
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) return;

    showToast(`Redirecting to Paystack for ${plan.name} payment...`, 'info');

    initializePaystackPayment({
      publicKey: paystackKey,
      email: user.email,
      amount: plan.price,
      metadata: { upgrade: planId },
      onSuccess: (ref) => {
        setSellerProfiles((prev) => {
          const updated = prev.map((s) => {
            if (s.user_id !== user.id) return s;
            return {
              ...s,
              subscription: {
                plan_id: planId,
                status: 'active' as const,
                expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                auto_renew: true,
              },
            };
          });
          persistSellerProfiles(updated);
          return updated;
        });
        showToast(`Subscription upgraded to ${plan.name}! Ref: ${ref}`, 'success');
        addLog({
          method: 'POST',
          path: '/api/v1/subs/upgrade',
          status: 200,
          sqlQuery: `UPDATE seller_profiles SET plan = '${planId}', status = 'active' WHERE user_id = ${user.id};`,
        });
      },
      onCancel: () => showToast('Subscription upgrade cancelled.', 'error'),
    });
  };

  // ── Admin Actions ────────────────────────────────────────────────────────────

  const handleApproveSeller = (userId: number) => {
    // 1. Activate the user account
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, status: 'active' as const } : u));
      persistUsers(updated);
      return updated;
    });
    // 2. Mark their seller profile as verified
    setSellerProfiles((prev) => {
      const updated = prev.map((s) => (s.user_id === userId ? { ...s, verified: true } : s));
      persistSellerProfiles(updated);
      return updated;
    });
    addLog({
      method: 'PUT',
      path: `/api/v1/admin/sellers/${userId}/approve`,
      status: 200,
      sqlQuery: `UPDATE users SET status = 'active' WHERE id = ${userId}; UPDATE seller_profiles SET verified = 1 WHERE user_id = ${userId};`,
    });
    showToast('Seller approved and verified successfully.', 'success');
  };

  const handleRejectSeller = (userId: number) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' as const } : u));
      persistUsers(updated);
      return updated;
    });
    addLog({
      method: 'PUT',
      path: `/api/v1/admin/sellers/${userId}/reject`,
      status: 200,
      sqlQuery: `UPDATE users SET status = 'suspended' WHERE id = ${userId};`,
    });
    showToast('Seller application rejected. Account suspended.', 'error');
  };

  const handleToggleUserStatus = (userId: number, currentStatus: User['status']) => {
    const next = currentStatus === 'active' ? 'suspended' : 'active';
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, status: next as User['status'] } : u));
      persistUsers(updated);
      return updated;
    });
    addLog({
      method: 'PATCH',
      path: `/api/v1/admin/users/${userId}/status`,
      status: 200,
      sqlQuery: `UPDATE users SET status = '${next}' WHERE id = ${userId};`,
    });
  };

  const handleResetDatabase = () => {
    localStorage.removeItem('unimart_users');
    localStorage.removeItem('unimart_products');
    localStorage.removeItem('unimart_orders');
    localStorage.removeItem('unimart_seller_profiles');
    localStorage.removeItem('unimart_session');
    
    // Set to clean production state
    const cleanUsers = [PRODUCTION_ADMIN_USER];
    setUsers(cleanUsers);
    setProducts([]);
    setOrders([]);
    setSellerProfiles([]);
    setCart([]);
    
    localStorage.setItem('unimart_users', JSON.stringify(cleanUsers));
    localStorage.setItem('unimart_products', JSON.stringify([]));
    localStorage.setItem('unimart_orders', JSON.stringify([]));
    localStorage.setItem('unimart_seller_profiles', JSON.stringify([]));
    
    showToast('Database purged and reset to clean production state!', 'info');
    logout();
    setCurrentTab('marketplace');
  };

  const handleLoadDemoData = () => {
    // Inject all demo mock data
    setUsers(INITIAL_USERS);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setSellerProfiles(INITIAL_SELLER_PROFILES);
    
    localStorage.setItem('unimart_users', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('unimart_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('unimart_orders', JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem('unimart_seller_profiles', JSON.stringify(INITIAL_SELLER_PROFILES));
    
    showToast('Demo mock data successfully seeded in database!', 'success');
    logout();
    setCurrentTab('marketplace');
  };

  const handleUpdatePaystackKey = (newKey: string) => {
    setPaystackKey(newKey);
    localStorage.setItem('unimart_paystack_key', newKey);
    showToast('Paystack configuration updated.', 'success');
  };

  // ── Role Quick Switcher (Demo) ────────────────────────────────────────────────

  const handleChangeRole = (role: 'admin' | 'seller' | 'buyer') => {
    const demoMap: Record<string, string> = {
      admin: 'alex_lead_admin',
      seller: 'sarah_bags',
      buyer: 'jordan_buyer',
    };
    const demoUser = users.find((u) => u.username === demoMap[role]);
    if (demoUser) {
      loginAsDemo(demoUser);
      setCurrentTab('marketplace');
      showToast(`Switched session → ${demoUser.username} (${role})`, 'info');
    }
  };

  // ── Product Actions ──────────────────────────────────────────────────────────

  const handleAddProduct = (productData: Omit<Product, 'id' | 'seller_id' | 'seller_name' | 'sales_count' | 'created_at'>) => {
    if (!user) return;
    const newProduct: Product = {
      ...productData,
      id: Date.now(),
      seller_id: user.id,
      seller_name: user.username,
      sales_count: 0,
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      persistProducts(updated);
      return updated;
    });
    addLog({
      method: 'POST',
      path: '/api/v1/products',
      status: 201,
      sqlQuery: `INSERT INTO products (name, price, seller_id, ...) VALUES ('${productData.name}', ${productData.price}, ${user.id}, ...);`,
    });
  };

  const handleUpdateProductStatus = (productId: number, status: 'active' | 'inactive') => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? { ...p, status } : p));
      persistProducts(updated);
      return updated;
    });
    addLog({
      method: 'PATCH',
      path: `/api/v1/products/${productId}`,
      status: 200,
      sqlQuery: `UPDATE products SET status = '${status}' WHERE id = ${productId};`,
    });
  };

  const handleUpdateOrderStatus = (orderId: number, newStatus: Order['status']) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      persistOrders(updated);
      return updated;
    });
    addLog({
      method: 'PATCH',
      path: `/api/v1/orders/${orderId}`,
      status: 200,
      sqlQuery: `UPDATE orders SET status = '${newStatus}' WHERE id = ${orderId};`,
    });
  };

  // ── SQL Sandbox Executor ─────────────────────────────────────────────────────

  const executeRawSql = (sql: string): { success: boolean; message: string; rows?: Record<string, unknown>[] } => {
    const result = parseSqlQuery(sql, { users, products, orders, sellerProfiles }, setUsers);
    addLog({
      method: 'POST',
      path: '/api/v1/console/sql',
      status: result.success ? 200 : 400,
      requestBody: sql,
      responseBody: result.message,
    });
    return result;
  };

  // ── Auth Loading Screen ──────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Authenticating Nexus Session...</p>
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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <Header
        currentUser={user}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onCheckout={handleCheckout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={logout}
        onChangeRole={handleChangeRole}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">

        {currentTab === 'marketplace' && (
          <Marketplace
            products={products}
            sellerProfiles={sellerProfiles}
            onAddToCart={handleAddToCart}
            currentUserRole={user?.role}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
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
                onUpgradeSubscription={handleUpgradeSubscription}
              />
            ) : (
              <AccessDenied
                message={
                  !user
                    ? 'Please log in as a seller or admin to access the Seller Hub.'
                    : 'Your account does not have seller privileges. Apply for a seller account from the register page.'
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
                onLoadDemoData={handleLoadDemoData}
                paystackKey={paystackKey}
                onUpdatePaystackKey={handleUpdatePaystackKey}
              />
            ) : (
              <AccessDenied
                message={
                  !user
                    ? 'Please log in as an admin to access the Control Panel.'
                    : 'You do not have administrative privileges. This section is restricted to platform admins only.'
                }
              />
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
            onExecuteRawSql={executeRawSql}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/50 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl text-indigo-400 border border-white/5">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-white font-black uppercase tracking-tighter">UniMart Production Nexus</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest">
                Paystack Gateway Integrated • JWT Secure Session • Zero Platform Fees
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldX className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-slate-500">No platform fees — 100% of your earnings go to you.</span>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 right-10 z-[100]"
          >
            <div
              className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border ${
                toast.type === 'error'
                  ? 'bg-rose-950 border-rose-800 text-rose-400'
                  : 'bg-slate-900 border-white/10 text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : toast.type === 'error' ? (
                <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
              ) : (
                <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0" />
              )}
              <span className="text-xs font-bold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
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
            if (data.role === 'seller') {
              showToast('Application submitted! An admin must approve your seller account.', 'info');
            } else {
              showToast('Account created successfully! You are now logged in.', 'success');
            }
            setIsAuthOpen(false);
          }
        }}
        demoUsers={users.filter((u) => ['alex_lead_admin', 'sarah_bags', 'jordan_buyer'].includes(u.username))}
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
