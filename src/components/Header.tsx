import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Wallet, Layers, ShoppingBag, Trash2, ChevronDown, Plus, ShieldCheck, Terminal, Bell, User, Check } from 'lucide-react';
import type { User as UserType, OrderItem } from '../data/mockData';

interface HeaderProps {
  currentUser: UserType | null;
  currentTab: string;
  onTabChange: (tab: string) => void;
  cart: OrderItem[];
  onRemoveFromCart: (productId: number) => void;
  onCheckout: (shippingAddress: string, contactPhone: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onChangeRole: (role: 'admin' | 'seller' | 'buyer') => void;
  notifications?: any[];
  onMarkNotificationRead?: (id: number) => void;
}

export default function Header({
  currentUser,
  currentTab,
  onTabChange,
  cart,
  onRemoveFromCart,
  onCheckout,
  onOpenAuth,
  onLogout,
  onChangeRole,
  notifications = [],
  onMarkNotificationRead
}: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  const cartRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setIsCartOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!shippingAddress.trim() || !contactPhone.trim()) {
      setCheckoutError('Please enter your dorm room and contact number.');
      return;
    }

    onCheckout(shippingAddress, contactPhone);
    setIsCartOpen(false);
    setShippingAddress('');
    setContactPhone('');
  };

  const handleQuickRoleChange = (role: 'admin' | 'seller' | 'buyer') => {
    onChangeRole(role);
    setIsRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-midnight/90 backdrop-blur-3xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => onTabChange('marketplace')}>
            <div className="bg-cyber-indigo p-2 rounded-xl sm:p-2.5 sm:rounded-2xl text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.6)] group-hover:scale-110 transition-all duration-500">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-black text-lg sm:text-xl text-white tracking-tighter uppercase leading-none">UniMart</span>
              <span className="hidden sm:inline-block text-[9px] sm:text-[10px] text-cyber-cyan font-bold sm:ml-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-cyber-indigo/10 border border-cyber-indigo/20 tracking-widest uppercase mt-0.5 sm:mt-0">
                Nexus
              </span>
            </div>
          </div>

          {/* Main Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onTabChange('marketplace')}
              className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                currentTab === 'marketplace'
                  ? 'bg-white/5 text-white border-b-2 border-cyber-indigo'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              Explore
            </button>

            {currentUser && currentUser.role === 'buyer' && (
              <button
                onClick={() => onTabChange('buyer')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'buyer'
                    ? 'bg-slate-800 text-white border-t-2 border-rose-500 rounded-t-xl rounded-b-none'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                My Dashboard
              </button>
            )}

            {currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin') && (
              <button
                onClick={() => onTabChange('seller')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'seller'
                    ? 'bg-slate-800 text-white border-t-2 border-amber-500 rounded-t-xl rounded-b-none'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                Seller Hub
              </button>
            )}

            {currentUser && currentUser.role === 'admin' && (
              <button
                onClick={() => onTabChange('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-slate-800 text-white border-t-2 border-red-500 rounded-t-xl rounded-b-none'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                Admin Panel
              </button>
            )}

            <button
              onClick={() => onTabChange('console')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'console'
                  ? 'bg-slate-800 text-white border-t-2 border-emerald-500 rounded-t-xl rounded-b-none'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              System Console
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Notifications - Hidden on Mobile, moved to dashboards */}
            {currentUser && (
              <div className="hidden sm:block relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-slate-300 hover:text-white transition-all relative cursor-pointer"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-cyber-indigo text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-midnight">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                    <h3 className="text-sm font-bold text-slate-200 mb-3 border-b border-slate-800 pb-2">
                      Notifications
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl border transition-all ${n.is_read ? 'bg-slate-950/40 border-transparent opacity-60' : 'bg-indigo-500/5 border-indigo-500/20'}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="text-xs font-bold text-white">{n.title}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{n.message}</p>
                              </div>
                              {!n.is_read && (
                                <button
                                  onClick={() => onMarkNotificationRead?.(n.id)}
                                  className="p-1 hover:bg-indigo-500/20 rounded-md text-indigo-400 transition-all"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-[8px] text-slate-600 mt-2 uppercase font-bold tracking-tighter">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Session / Role Switcher */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">

                {/* Wallet Balance - Compact on mobile */}
                <div className="flex items-center glass-card border border-white/5 rounded-xl sm:rounded-2xl py-1 sm:py-1.5 px-2.5 sm:px-4 text-[10px] sm:text-xs text-slate-300 gap-1.5 sm:gap-2">
                  <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-cyber-cyan" />
                  <span className="font-mono font-black text-white tracking-tighter">${currentUser.balance.toFixed(2)}</span>
                  <button
                    onClick={() => {}}
                    title="Balance reflects your account."
                    className="hidden sm:block ml-1 bg-cyber-indigo/20 hover:bg-cyber-indigo text-cyber-indigo hover:text-white p-0.5 rounded-lg transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Role Quick Selector - Compact on mobile */}
                <div className="relative" ref={roleRef}>
                  <button
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 px-2 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                  >
                    <div
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                        currentUser.role === 'admin'
                          ? 'bg-red-500 shadow-sm shadow-red-500'
                          : currentUser.role === 'seller'
                          ? 'bg-amber-500 shadow-sm shadow-amber-500'
                          : 'bg-emerald-500 shadow-sm shadow-emerald-500'
                      }`}
                    />
                    <span className="capitalize hidden sm:inline">{currentUser.username} ({currentUser.role})</span>
                    <span className="capitalize sm:hidden">{currentUser.username.charAt(0).toUpperCase()}</span>
                    <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400 shrink-0" />
                  </button>

                  {isRoleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
                      <div className="px-3 py-1 border-b border-slate-800 text-[10px] font-bold text-slate-200">
                        Account Settings
                      </div>
                      <button
                        onClick={() => { onTabChange(currentUser.role === 'buyer' ? 'buyer' : currentUser.role === 'seller' ? 'seller' : 'admin'); setIsRoleDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5" /> Profile Settings
                      </button>
                      <div className="border-t border-slate-800 my-1" />
                      <button
                        onClick={() => { onLogout(); setIsRoleDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 flex items-center gap-2 cursor-pointer"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer"
              >
                Connect Account
              </button>
            )}

            {/* Shopping Cart — visible to all users (buyers + unauthenticated) */}
            {(!currentUser || currentUser.role === 'buyer') && (
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-slate-300 hover:text-white transition-all relative cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown */}
                {isCartOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                    <h3 className="text-sm font-bold text-slate-200 mb-3 border-b border-slate-800 pb-2 flex items-center justify-between">
                      <span>My Shopping Cart</span>
                      <span className="text-xs text-indigo-400 font-medium">({cartItemCount} items)</span>
                    </h3>

                    {cart.length === 0 ? (
                      <div className="py-8 text-center">
                        <ShoppingCart className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-medium">Your cart is empty.</p>
                        <p className="text-[11px] text-slate-500 mt-1">Browse the marketplace and add items!</p>
                      </div>
                    ) : (
                      <div>
                        {/* Cart Items */}
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-4">
                          {cart.map((item) => (
                            <div key={item.product_id} className="flex items-center justify-between gap-2 text-xs">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-200 truncate">{item.product_name}</p>
                                <p className="text-[10px] text-slate-400">
                                  ${item.price.toFixed(2)} × {item.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-200 font-medium">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <button
                                  onClick={() => onRemoveFromCart(item.product_id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800 transition-all cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total — no platform fee */}
                        <div className="border-t border-slate-800 pt-3 mb-4">
                          <div className="flex justify-between text-sm font-bold text-slate-200">
                            <span>Total Due</span>
                            <span className="font-mono text-indigo-400">${cartTotal.toFixed(2)}</span>
                          </div>
                          <p className="text-[10px] text-emerald-500 mt-1 font-medium">✓ No platform fees — you pay exactly what you see.</p>
                        </div>

                        {/* Checkout Form */}
                        <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                          {checkoutError && (
                            <p className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2 rounded-lg">
                              {checkoutError}
                            </p>
                          )}

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Delivery Location (Dorm Building & Room)
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. East Tower, Room 819"
                              value={shippingAddress}
                              onChange={(e) => setShippingAddress(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-base sm:text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Contact Phone Number
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="e.g. +1 (555) 234-5678"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-base sm:text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                          >
                            Proceed to Secure Checkout
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar - Premium Glassmorphic design */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-midnight/95 backdrop-blur-2xl border-t border-white/10 flex justify-around py-3 pb-8 px-2 safe-bottom shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => onTabChange('marketplace')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer ${
            currentTab === 'marketplace' ? 'text-cyber-indigo' : 'text-slate-400'
          }`}
        >
          <div className={`p-2 rounded-xl transition-colors ${currentTab === 'marketplace' ? 'bg-cyber-indigo/20' : 'bg-transparent'}`}>
            <ShoppingBag className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase">Market</span>
        </button>
        
        {currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin') && (
          <button
            onClick={() => onTabChange('seller')}
            className={`flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer ${
              currentTab === 'seller' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${currentTab === 'seller' ? 'bg-amber-400/20' : 'bg-transparent'}`}>
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">Seller</span>
          </button>
        )}

        {currentUser && currentUser.role === 'admin' && (
          <button
            onClick={() => onTabChange('admin')}
            className={`flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer ${
              currentTab === 'admin' ? 'text-red-400' : 'text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${currentTab === 'admin' ? 'bg-red-400/20' : 'bg-transparent'}`}>
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">Admin</span>
          </button>
        )}

        {currentUser && currentUser.role === 'buyer' && (
          <button
            onClick={() => onTabChange('buyer')}
            className={`flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer ${
              currentTab === 'buyer' ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${currentTab === 'buyer' ? 'bg-rose-400/20' : 'bg-transparent'}`}>
              <User className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">Me</span>
          </button>
        )}

        <button
          onClick={() => onTabChange('console')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer ${
            currentTab === 'console' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <div className={`p-2 rounded-xl transition-colors ${currentTab === 'console' ? 'bg-emerald-400/20' : 'bg-transparent'}`}>
            <Terminal className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase">Console</span>
        </button>
      </div>
    </header>
  );
}
