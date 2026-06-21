import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Wallet, Layers, ShoppingBag, Trash2, ChevronDown, Plus, ShieldCheck, Terminal } from 'lucide-react';
import { User, OrderItem } from '../data/mockData';

interface HeaderProps {
  currentUser: User | null;
  currentTab: string;
  onTabChange: (tab: string) => void;
  cart: OrderItem[];
  onRemoveFromCart: (productId: number) => void;
  onCheckout: (shippingAddress: string, contactPhone: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onChangeRole: (role: 'admin' | 'seller' | 'buyer') => void;
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
}: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  const cartRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setIsCartOpen(false);
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
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('marketplace')}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight block sm:inline">UniMart</span>
              <span className="hidden sm:inline-block text-[10px] text-indigo-400 font-medium ml-1.5 px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800/40">
                CAMPUS HUB
              </span>
            </div>
          </div>

          {/* Main Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange('marketplace')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'marketplace'
                  ? 'bg-slate-800 text-white border-t-2 border-indigo-500 rounded-t-xl rounded-b-none'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              Marketplace
            </button>

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
          <div className="flex items-center gap-3">

            {/* User Session / Role Switcher */}
            {currentUser ? (
              <div className="flex items-center gap-2">

                {/* Wallet Balance */}
                <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl py-1 px-3 text-xs text-slate-300 gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-mono font-bold">${currentUser.balance.toFixed(2)}</span>
                  <button
                    onClick={() => {}}
                    title="Balance reflects your account. Payments via Paystack."
                    className="ml-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white p-0.5 rounded transition-all cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Role Quick Selector */}
                <div className="relative" ref={roleRef}>
                  <button
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        currentUser.role === 'admin'
                          ? 'bg-red-500 shadow-sm shadow-red-500'
                          : currentUser.role === 'seller'
                          ? 'bg-amber-500 shadow-sm shadow-amber-500'
                          : 'bg-emerald-500 shadow-sm shadow-emerald-500'
                      }`}
                    />
                    <span className="capitalize">{currentUser.username} ({currentUser.role})</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </button>

                  {isRoleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
                      <div className="px-3 py-1 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                        Switch Demo Session
                      </div>
                      <button
                        onClick={() => handleQuickRoleChange('admin')}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-red-950/20 hover:text-red-400 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Admin — Alex (alex_lead_admin)
                      </button>
                      <button
                        onClick={() => handleQuickRoleChange('seller')}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-amber-950/20 hover:text-amber-400 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Seller — Sarah (sarah_bags)
                      </button>
                      <button
                        onClick={() => handleQuickRoleChange('buyer')}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-emerald-950/20 hover:text-emerald-400 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Buyer — Jordan (jordan_buyer)
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-lg border-t border-white/5 flex justify-around py-3 pb-4">
        <button
          onClick={() => onTabChange('marketplace')}
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
            currentTab === 'marketplace' ? 'text-indigo-400' : 'text-slate-500'
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[9px] font-bold tracking-wider uppercase">Market</span>
        </button>
        
        {currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin') && (
          <button
            onClick={() => onTabChange('seller')}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              currentTab === 'seller' ? 'text-amber-400' : 'text-slate-500'
            }`}
          >
            <Layers className="h-5 w-5" />
            <span className="text-[9px] font-bold tracking-wider uppercase">Seller Hub</span>
          </button>
        )}

        {currentUser && currentUser.role === 'admin' && (
          <button
            onClick={() => onTabChange('admin')}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              currentTab === 'admin' ? 'text-red-400' : 'text-slate-500'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="text-[9px] font-bold tracking-wider uppercase">Admin</span>
          </button>
        )}

        <button
          onClick={() => onTabChange('console')}
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
            currentTab === 'console' ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Terminal className="h-5 w-5" />
          <span className="text-[9px] font-bold tracking-wider uppercase">Console</span>
        </button>
      </div>
    </header>
  );
}
