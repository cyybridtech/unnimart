import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Clock, 
  Star, 
  Info, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight,
  Zap,
  MessageSquare
} from 'lucide-react';
import { Product, SellerProfile } from '../data/mockData';

interface MarketplaceProps {
  products: Product[];
  sellerProfiles: SellerProfile[];
  onAddToCart: (product: Product) => void;
  currentUserRole: string | undefined;
  onOpenAuth: () => void;
}

export default function Marketplace({ products, sellerProfiles, onAddToCart, currentUserRole, onOpenAuth }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPreordersOnly, setShowPreordersOnly] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const productsRef = { current: null as HTMLDivElement | null };

  const categories = ['All', 'Clothing & Fashion', 'Bags & Accessories', 'Food & Snacks', 'Services/Tech'];

  const filteredProducts = products.filter(product => {
    if (product.status !== 'active') return false;
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.seller_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPreorder = !showPreordersOnly || product.is_preorder;
    return matchesCategory && matchesSearch && matchesPreorder;
  });

  const getSellerInfo = (sellerId: number) => sellerProfiles.find(s => s.user_id === sellerId);

  return (
    <div className="space-y-10">
      {/* Hero Section - High End Branding */}
      <section className="relative h-[420px] rounded-[2rem] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover" 
            alt="Campus" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>
        
        <div className="relative h-full flex flex-col justify-center px-10 sm:px-16 max-w-3xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold tracking-widest uppercase"
          >
            <Zap className="h-3 w-3 fill-indigo-400" />
            Empowering Campus Innovation
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black text-white leading-[1.1]"
          >
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400">
              Campus Commerce.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-300 max-w-lg leading-relaxed"
          >
            UniMart is a premium infrastructure for university entrepreneurs. 
            Discover curated vintage, custom designs, and gourmet treats—all delivered direct to your dorm.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <button
              onClick={() => {
                document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-slate-950 px-8 py-3.5 rounded-2xl font-bold text-sm hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              Explore Collections <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenAuth}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer"
            >
              Become a Seller
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modern Filter Toolbar */}
      <div className="sticky top-20 z-30 bg-slate-950/80 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-4 flex flex-col lg:flex-row gap-6 items-center shadow-2xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by product, seller, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-slate-800 hidden lg:block" />

        <div className="flex items-center gap-4 px-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-1 ${showPreordersOnly ? 'bg-indigo-600' : 'bg-slate-800'}`}>
              <motion.div 
                animate={{ x: showPreordersOnly ? 16 : 0 }}
                className="w-4 h-4 bg-white rounded-full shadow-md"
              />
              <input 
                type="checkbox" 
                className="hidden" 
                checked={showPreordersOnly}
                onChange={() => setShowPreordersOnly(!showPreordersOnly)}
              />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors whitespace-nowrap">Pre-order Only</span>
          </label>
          <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Product Discovery Grid */}
      <div id="product-grid" ref={(el) => { productsRef.current = el; }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, idx) => {
            const seller = getSellerInfo(product.seller_id);
            return (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_40px_-10px_rgba(79,70,229,0.3)] transition-all duration-500"
              >
                {/* Visual Status Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <span className="bg-slate-950/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                    {product.category}
                  </span>
                  {product.is_preorder && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xl">
                      <Clock className="h-3 w-3 fill-slate-950" />
                      PRE-ORDERING
                    </span>
                  )}
                </div>

                {/* SKU Badge */}
                <span className="absolute top-4 right-4 z-10 bg-indigo-600/90 backdrop-blur-md text-[10px] font-mono text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  {product.sku}
                </span>

                {/* Image Container */}
                <div 
                  className="aspect-square relative overflow-hidden cursor-zoom-in"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <button className="w-full bg-white text-slate-950 py-3 rounded-2xl font-bold text-sm shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-center gap-2">
                      View Technical Specs <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">{product.seller_name}</span>
                        {seller?.verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{product.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-4 w-4 fill-amber-400" />
                      <span className="font-bold">{product.rating}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{product.reviews.length} reviews</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="font-medium">{product.sales_count} sold</span>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pricing (USD)</span>
                      <div className="text-2xl font-black text-white font-mono">${product.price.toFixed(2)}</div>
                    </div>

                    {/* Show add-to-cart for buyers AND unauthenticated users (they'll be redirected to login) */}
                    {currentUserRole !== 'admin' && currentUserRole !== 'seller' ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-[1.2rem] shadow-lg shadow-indigo-600/20 active:scale-90 transition-all cursor-pointer"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="bg-slate-800 text-slate-500 p-4 rounded-[1.2rem] opacity-50 cursor-not-allowed"
                        title="Switch to Buyer role to purchase"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Technical Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg"
            />
            
            <motion.div
              layoutId={`product-${selectedProduct.id}`}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="md:w-[45%] h-[300px] md:h-auto relative bg-slate-950">
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 left-6 p-2 bg-slate-950/60 backdrop-blur-md rounded-full text-white hover:bg-slate-800 transition-colors"
                >
                  < ChevronRight className="h-5 w-5 rotate-180" />
                </button>
              </div>

              <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      {selectedProduct.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">ID: {selectedProduct.sku}</span>
                  </div>
                  <h2 className="text-4xl font-black text-white">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Star className="h-4 w-4 fill-amber-400" />
                      {selectedProduct.rating} (Verified Reviews)
                    </div>
                    <span className="text-slate-500">•</span>
                    <div className="text-indigo-400">By {selectedProduct.seller_name}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Specifications</h4>
                  <p className="text-slate-300 leading-relaxed text-sm">{selectedProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Availability</span>
                    <div className="text-sm font-bold text-white">
                      {selectedProduct.is_preorder ? 'Pre-order Campaign' : `${selectedProduct.stock} Units in Dorm Stock`}
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Fulfillment</span>
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 fill-emerald-400" />
                      Same-Day Delivery
                    </div>
                  </div>
                </div>

                {/* Reviews Summary Simulation */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest border-l-2 border-amber-500 pl-3">Community Feedback</h4>
                  <div className="space-y-3">
                    {selectedProduct.reviews.length > 0 ? selectedProduct.reviews.map(review => (
                      <div key={review.id} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">@{review.username}</span>
                          <div className="flex text-amber-500"><Star className="h-3 w-3 fill-amber-500" /></div>
                        </div>
                        <p className="text-xs text-slate-400 italic">"{review.comment}"</p>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-500 italic">No public audits yet. Be the first to review!</p>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="text-3xl font-black text-white font-mono">${selectedProduct.price.toFixed(2)}</div>
                  <button 
                    onClick={() => { onAddToCart(selectedProduct); setSelectedProduct(null); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    Add to System Cart <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
