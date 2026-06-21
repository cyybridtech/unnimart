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
  MessageSquare,
  Heart
} from 'lucide-react';
import { type Product, SellerProfile } from '../data/mockData';
import { api } from '../services/api';

interface MarketplaceProps {
  products: Product[];
  sellerProfiles: SellerProfile[];
  onAddToCart: (product: Product) => void;
  currentUserRole: string | undefined;
  onOpenAuth: () => void;
  wishlist: number[];
  onToggleWishlist: (productId: number) => void;
}

export default function Marketplace({ products, sellerProfiles, onAddToCart, currentUserRole, onOpenAuth, wishlist, onToggleWishlist }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPreordersOnly, setShowPreordersOnly] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  // Faceted Filter State
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState<number>(0);
  const [showInStockOnly, setShowInStockOnly] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = ['All', 'Clothing & Fashion', 'Bags & Accessories', 'Food & Snacks', 'Services/Tech'];

  const filteredProducts = products.filter(product => {
    if (product.status !== 'active') return false;
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.seller_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPreorder = !showPreordersOnly || product.is_preorder;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesRating = product.rating >= minRating;
    const matchesStock = !showInStockOnly || product.stock > 0;

    return matchesCategory && matchesSearch && matchesPreorder && matchesPrice && matchesRating && matchesStock;
  });

  const getSellerInfo = (sellerId: number) => sellerProfiles.find(s => s.user_id === sellerId);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await api.post('/features/reviews', {
        product_id: selectedProduct.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setReviewForm({ rating: 5, comment: '' });
      // We'd ideally refresh the product here
    } catch (err) {
      console.error('Review failed', err);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative h-[480px] rounded-[3rem] overflow-hidden group">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&auto=format&fit=crop&q=80"
            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
            alt="Campus" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight/60 to-transparent" />
        </div>
        
        <div className="relative h-full flex flex-col justify-center px-12 sm:px-20 max-w-4xl space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyber-indigo/10 border border-cyber-indigo/20 text-cyber-cyan text-[10px] font-black tracking-[0.2em] uppercase"
          >
            <Zap className="h-3 w-3 fill-cyber-cyan" />
            The Nex-Gen Infrastructure
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl sm:text-7xl font-black text-white leading-[0.9] tracking-tighter"
          >
            UNIMART <br />
            <span className="text-gradient">
              PRODUCTION.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-xl leading-relaxed font-medium"
          >
            Experience the definitive campus marketplace. Secure, lightning-fast, and powered by elite student entrepreneurs.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <button className="bg-white text-midnight px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyber-cyan transition-colors shadow-2xl">
              Get Started
            </button>
            <button className="glass-card px-10 py-4 rounded-2xl font-black text-xs text-white uppercase tracking-widest">
              View Showcase
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modern Filter Toolbar */}
      <div className="sticky top-20 z-30 space-y-4">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-4 flex flex-col lg:flex-row gap-6 items-center shadow-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by product or seller..."
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

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-3 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${isFilterOpen ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
          >
            <Filter className="h-4 w-4" />
            Advanced
          </button>
        </div>

        {/* Faceted Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[1.5rem] overflow-hidden"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price Range (USD)</h4>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={e => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs"
                    />
                    <span className="text-slate-600">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Minimum Rating</h4>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setMinRating(star)}
                        className={`p-1.5 rounded-lg border transition-all ${minRating >= star ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                      >
                        <Star className={`h-4 w-4 ${minRating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                    <button onClick={() => setMinRating(0)} className="text-[10px] text-slate-500 ml-2 hover:text-white">Clear</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Availability</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={showInStockOnly}
                        onChange={() => setShowInStockOnly(!showInStockOnly)}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white">In Stock Only</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Specials</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={showPreordersOnly}
                        onChange={() => setShowPreordersOnly(!showPreordersOnly)}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white">Pre-orders</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Discovery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, idx) => {
            const isWishlisted = wishlist.includes(product.id);
            return (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group relative glass-card rounded-[2.5rem] overflow-hidden neon-border"
              >
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <span className="bg-slate-950/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                    {product.category}
                  </span>
                </div>

                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md border transition-all ${
                    isWishlisted ? 'bg-rose-500 border-rose-400 text-white' : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

                <div className="aspect-square relative overflow-hidden cursor-zoom-in" onClick={() => setSelectedProduct(product)}>
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">{product.seller_name}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{product.name}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-4 w-4 fill-amber-400" />
                      <span className="font-bold">{product.rating}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>{product.sales_count} sold</span>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="text-2xl font-black text-white font-mono tracking-tighter">${product.price.toFixed(2)}</div>
                    {currentUserRole !== 'admin' && currentUserRole !== 'seller' ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        className="bg-cyber-indigo hover:bg-cyber-indigo/80 text-white p-4 rounded-2xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] active:scale-90 transition-all cursor-pointer"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold uppercase italic">Seller View</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg" />
            <motion.div layoutId={`product-${selectedProduct.id}`} className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
              <div className="md:w-[45%] h-[300px] md:h-auto bg-slate-950">
                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8">
                <div>
                  <h2 className="text-4xl font-black text-white">{selectedProduct.name}</h2>
                  <p className="text-slate-400 mt-4">{selectedProduct.description}</p>
                </div>

                {/* Review Form */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Leave a Review</h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewForm({...reviewForm, rating: star})}>
                          <Star className={`h-5 w-5 ${star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm"
                      placeholder="Share your experience..."
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                    />
                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Submit Review</button>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Reviews</h4>
                  <div className="space-y-3">
                    {(selectedProduct.reviews || []).map((review: any) => (
                      <div key={review.id} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white">@{review.username}</span>
                          <span className="text-[10px] text-slate-500">{review.date}</span>
                        </div>
                        <div className="flex mb-2">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />)}
                        </div>
                        <p className="text-xs text-slate-400">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
