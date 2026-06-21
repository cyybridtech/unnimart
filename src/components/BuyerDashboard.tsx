import { motion } from 'framer-motion';
import { ShoppingBag, Heart, User, Package, ArrowRight, Star } from 'lucide-react';
import { type Order, Product } from '../data/mockData';

interface BuyerDashboardProps {
  orders: Order[];
  wishlistItems: Product[];
  onTabChange: (tab: string) => void;
  onCancelOrder: (orderId: number) => void;
}

export default function BuyerDashboard({ orders, wishlistItems, onTabChange, onCancelOrder }: BuyerDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] space-y-2 neon-border">
          <span className="text-[10px] font-black text-cyber-indigo uppercase tracking-widest">Orders Placed</span>
          <div className="text-4xl font-black text-white font-mono tracking-tighter">{orders.length}</div>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] space-y-2 neon-border">
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Wishlist items</span>
          <div className="text-4xl font-black text-white font-mono tracking-tighter">{wishlistItems.length}</div>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] space-y-2 neon-border">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Reviews Written</span>
          <div className="text-4xl font-black text-white font-mono tracking-tighter">0</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <section className="glass-card rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Purchase History</h3>
            <ShoppingBag className="h-5 w-5 text-cyber-indigo" />
          </div>
          <div className="p-8 space-y-6">
            {orders.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-10">No orders yet. Ready to shop?</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-400">#{order.id}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-white font-bold">{order.items.length} items</p>
                      <p className="text-[10px] text-slate-500">{order.status.toUpperCase()}</p>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => onCancelOrder(order.id)}
                          className="text-[10px] text-rose-500 font-bold hover:underline mt-1"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                    <div className="text-lg font-black text-white font-mono">${order.total_amount.toFixed(2)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Wishlist Preview */}
        <section className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Wishlist</h3>
            <Heart className="h-5 w-5 text-rose-400" />
          </div>
          <div className="p-8 space-y-4">
            {wishlistItems.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-10">Your wishlist is empty.</p>
            ) : (
              wishlistItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-white/5 group">
                  <img src={item.image_url} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[10px] text-indigo-400 font-mono">${item.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => onTabChange('marketplace')} className="p-2 bg-slate-900 rounded-xl text-slate-500 group-hover:text-indigo-400 transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
