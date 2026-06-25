import React, { useState } from 'react';
import { X, Shield, ShoppingBag, UserCheck, Eye, EyeOff, Lock, Zap } from 'lucide-react';
import { User } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (data: {
    username: string;
    email: string;
    role: 'buyer' | 'seller';
    phone: string;
    dorm: string;
    password?: string;
    businessName?: string;
    businessDescription?: string;
    category?: string;
  }) => void;
  demoUsers: User[];
}

export default function AuthModal({ isOpen, onClose, onLogin, onRegister, demoUsers }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dorm, setDorm] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [category, setCategory] = useState('Clothing & Fashion');
  const [error, setError] = useState('');

  // Developer panel toggle
  const [devClicks, setDevClicks] = useState(0);
  const [showDevPane, setShowDevPane] = useState(false);

  if (!isOpen) return null;

  const handleLogoClick = () => {
    if (showDevPane) return;
    const next = devClicks + 1;
    setDevClicks(next);
    if (next >= 5) {
      setShowDevPane(true);
      setError('Developer mode active: demo test users are now unlocked.');
    }
  };

  const handleDemoLogin = async (user: User) => {
    // Demo users use password123
    await onLogin(user.email, 'password123');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }
      onLogin(email, password);
    } else {
      if (!username || !email || !phone || !dorm || !regPassword) {
        setError('Please fill in all required fields.');
        return;
      }
      if (regPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (role === 'seller' && !businessName) {
        setError('Please enter your business name.');
        return;
      }

      onRegister({
        username,
        email,
        role,
        phone,
        dorm,
        password: regPassword,
        businessName: role === 'seller' ? businessName : undefined,
        businessDescription: role === 'seller' ? businessDescription : undefined,
        category: role === 'seller' ? category : undefined
      });
      
      if (role === 'seller') {
        setError('Success! Seller account created and pending admin approval. You can log in once verified.');
        setIsLogin(true);
        setPassword('');
      } else {
        setIsLogin(true);
        setEmail(email);
        setPassword('');
        setError('Success! Account created. You can now log in.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden my-4 sm:my-8">
        
        {/* Left Side Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between select-none">
          <div>
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 mb-6 sm:mb-8 cursor-pointer active:scale-98 transition-all"
              title="Click 5 times for Developer Panel"
            >
              <div className="bg-indigo-600 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-indigo-600/30">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">UniMart</span>
            </div>
            
            {!showDevPane ? (
              // Production Marketing View
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-400" />
                    Campus Sandbox Network
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-indigo-300 font-mono tracking-widest mt-1">SECURE CLIENT-SIDE TRANSACTION PROTOCOL</p>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                  UniMart is a direct peer-to-peer commerce hub built exclusively for university students. 
                  Connect safely to trade vintage items, gourmet dorm-baked snacks, and custom developer or designer services.
                </p>
                <div className="space-y-2.5 sm:space-y-3 pt-2">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Secure checks via Paystack API</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Dorm-to-dorm delivery logs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Zero middleman commission cuts</span>
                  </div>
                </div>
              </div>
            ) : (
              // Developer Test Suite View
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-rose-400">
                  <Zap className="h-4 w-4 fill-rose-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Developer Test Suite</h3>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Click a test account below to log in instantly without passwords:
                </p>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {demoUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleDemoLogin(user)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-800/80 hover:border-indigo-500 bg-slate-950/40 hover:bg-indigo-950/20 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`} 
                          alt="" 
                          className="w-7 h-7 rounded-full border border-slate-800 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 truncate group-hover:text-indigo-400 transition-colors">
                              {user.username}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                              user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              user.role === 'seller' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 leading-normal">
            <p>🔒 Hashing standard: SHA-256 cryptographically audited. Session tokens persist in browser storage local environment.</p>
          </div>
        </div>

        {/* Right Side: Authentication forms */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between bg-slate-900">
          <div className="flex justify-between items-center mb-6">
            <div className="flex border-b border-slate-800 w-fit">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-widest transition-all ${
                  isLogin 
                    ? 'border-b-2 border-indigo-500 text-indigo-400' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-widest transition-all ${
                  !isLogin 
                    ? 'border-b-2 border-indigo-500 text-indigo-400' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register
              </button>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold mb-5 ${
              error.toLowerCase().includes('success') 
                ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/30' 
                : 'bg-rose-950/30 text-rose-400 border border-rose-900/30'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 flex-1">
            {isLogin ? (
              // LOGIN STATE
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. Mail@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-200 placeholder-slate-700 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-200 placeholder-slate-700 focus:outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 pb-4 md:pb-0">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider rounded-xl py-3 sm:py-3.5 text-[10px] sm:text-xs transition-all shadow-lg shadow-indigo-600/15 active:scale-98 cursor-pointer"
                  >
                    Authenticate Securely
                  </button>
                </div>
              </div>
            ) : (
              // REGISTER STATE
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                {/* Role Switch */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-850">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      role === 'buyer' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    Buyer (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      role === 'seller' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Seller (Entrepreneur)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. josh_crafts"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-200 placeholder-slate-700 focus:outline-hidden transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">University Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. josh.c@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-200 placeholder-slate-700 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Create Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        placeholder="Min 6 chars"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-200 placeholder-slate-700 focus:outline-none transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dorm Building / Room</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Banneker Hall 302"
                      value={dorm}
                      onChange={(e) => setDorm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-200 placeholder-slate-700 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-200 placeholder-slate-700 focus:outline-hidden transition-all"
                  />
                </div>

                {role === 'seller' && (
                  <div className="space-y-4 border-t border-slate-800/80 pt-4 mt-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      Entrepreneur Verification
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Business / Shop Name</label>
                        <input
                          type="text"
                          required={role === 'seller'}
                          placeholder="e.g. Josh's Thrift Shop"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-200 placeholder-slate-700 focus:outline-hidden transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Business Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-200 focus:outline-hidden transition-all"
                        >
                          <option>Clothing & Fashion</option>
                          <option>Bags & Accessories</option>
                          <option>Food & Snacks</option>
                          <option>Services/Tech</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Shop Description</label>
                      <textarea
                        rows={2}
                        placeholder="Describe your listings, delivery schedules, and orders prep timeline..."
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-200 placeholder-slate-700 focus:outline-hidden transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 pb-6 md:pb-0">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider rounded-xl py-3 sm:py-3.5 text-[10px] sm:text-xs transition-all shadow-lg shadow-indigo-600/15 active:scale-98 cursor-pointer"
                  >
                    {role === 'seller' ? 'Apply for Seller Account' : 'Register Buyer Account'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
