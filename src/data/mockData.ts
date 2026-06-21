export interface Review {
  id: number;
  user_id: number;
  username: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'seller' | 'buyer';
  status: 'active' | 'pending' | 'suspended';
  phone?: string;
  dorm?: string;
  joined_date: string;
  balance: number;
  avatar_url?: string;
  password_hash: string;
}

export interface Product {
  id: number;
  seller_id: number;
  seller_name: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image_url: string;
  is_preorder: boolean;
  preorder_deadline?: string;
  stock: number;
  created_at: string;
  sales_count: number;
  status: 'active' | 'inactive';
  rating: number;
  reviews: Review[];
  sku: string;
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  buyer_id: number;
  buyer_name: string;
  seller_id: number;
  seller_name: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'preparing' | 'shipped' | 'completed' | 'cancelled';
  order_type: 'regular' | 'preorder';
  shipping_address: string;
  contact_phone: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'annually';
  features: string[];
  max_listings: number;
}

export interface SellerSubscription {
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled';
  expiry_date: string;
  auto_renew: boolean;
}

export interface SellerProfile {
  user_id: number;
  business_name: string;
  description: string;
  rating: number;
  verified: boolean;
  category: string;
  bank_account?: string;
  banner_url?: string;
  tags?: string[];
  subscription?: SellerSubscription;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Campus Starter',
    price: 9.99,
    billing_cycle: 'monthly',
    features: ['Up to 5 Listings', 'Standard Support', 'Basic Analytics'],
    max_listings: 5
  },
  {
    id: 'pro',
    name: 'Entrepreneur Pro',
    price: 24.99,
    billing_cycle: 'monthly',
    features: ['Unlimited Listings', 'Priority Fulfillments', 'Advanced Analytics', 'Verified Badge'],
    max_listings: 100
  },
  {
    id: 'enterprise',
    name: 'Nexus Enterprise',
    price: 199.99,
    billing_cycle: 'annually',
    features: ['Cross-Campus Promotion', 'Dedicated Account Manager', 'Custom API Access', '0% Transaction Fees'],
    max_listings: 9999
  }
];

export const APP_FEATURES = [
  {
    category: 'Core Commerce',
    features: [
      { name: 'Multi-Role Architecture', desc: 'Distinct workflows for Admin, Seller, and Buyer.' },
      { name: 'ACID Transactions', desc: 'Secure MySQL-simulated checkouts with inventory locking.' },
      { name: 'Pre-order Engine', desc: 'Capital-first crowdfunding for student creations.' },
      { name: 'SKU Management', desc: 'Professional tracking for unique product variants.' }
    ]
  },
  {
    category: 'Entrepreneur Tools',
    features: [
      { name: 'Business Dashboard', desc: 'Real-time revenue analytics via Recharts.' },
      { name: 'Subscription Model', desc: 'Tiered SaaS plans for recurring platform revenue.' },
      { name: 'Inventory Health', desc: 'Stock level monitoring and SKU status control.' },
      { name: 'Fulfillment Pipeline', desc: '4-stage order lifecycle management.' }
    ]
  },
  {
    category: 'Developer Experience (DX)',
    features: [
      { name: 'SQL Sandbox', desc: 'Live raw SQL execution on mock relational tables.' },
      { name: 'API Log Stream', desc: 'Real-time debugging console for network requests.' },
      { name: 'Architecture Visualizer', desc: '3-tier system mapping and logic flow.' },
      { name: 'Backend Code Export', desc: 'Production-ready Node.js/Express/MySQL source code.' }
    ]
  }
];

export interface ApiLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  status: number;
  latency: number;
  requestBody?: string;
  responseBody?: string;
  sqlQuery?: string;
}

// Initial seed data
export const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'alex_lead_admin',
    email: 'alex.admin@university.edu',
    role: 'admin',
    status: 'active',
    phone: '+1 (555) 100-2000',
    dorm: 'Admin Hall Suite 10',
    joined_date: '2025-09-01',
    balance: 1450.25,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    password_hash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' // password123
  },
  {
    id: 2,
    username: 'sarah_bags',
    email: 'sarah.k@university.edu',
    role: 'seller',
    status: 'active',
    phone: '+1 (555) 321-4567',
    dorm: 'Banneker Hall Room 402',
    joined_date: '2025-09-10',
    balance: 840.00,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    password_hash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' // password123
  },
  {
    id: 3,
    username: 'campus_bites',
    email: 'marcus.food@university.edu',
    role: 'seller',
    status: 'active',
    phone: '+1 (555) 789-0123',
    dorm: 'Quad Dorm Room 112',
    joined_date: '2025-09-15',
    balance: 485.50,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    password_hash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' // password123
  },
  {
    id: 4,
    username: 'vintage_threadz',
    email: 'chloe.apparel@university.edu',
    role: 'seller',
    status: 'active',
    phone: '+1 (555) 456-7890',
    dorm: 'Hillside Hall Room 305',
    joined_date: '2025-09-18',
    balance: 920.00,
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    password_hash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' // password123
  },
  {
    id: 5,
    username: 'jordan_buyer',
    email: 'jordan.smith@university.edu',
    role: 'buyer',
    status: 'active',
    phone: '+1 (555) 234-5678',
    dorm: 'East Tower Room 819',
    joined_date: '2025-10-01',
    balance: 500.00,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    password_hash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' // password123
  }
];

export const INITIAL_SELLER_PROFILES: SellerProfile[] = [
  {
    user_id: 2,
    business_name: 'EcoCarry Canvas & Bags',
    description: 'Handmade sustainable canvas tote bags, laptop sleeves, and drawstring bags perfect for campus life. Made from 100% recycled cotton.',
    rating: 4.8,
    verified: true,
    category: 'Bags & Accessories',
    bank_account: 'US-99-CHAS-123456789',
    banner_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80',
    tags: ['Sustainable', 'Handmade', 'Dorm-Ready']
  },
  {
    user_id: 3,
    business_name: 'Dorm Bites & Sweet Treats',
    description: 'Freshly baked midnight cookies and gourmet brownies baked in the Quad. Order by 8 PM for same-night dorm delivery!',
    rating: 4.9,
    verified: true,
    category: 'Food & Snacks',
    bank_account: 'US-88-WELL-987654321',
    banner_url: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=1200&auto=format&fit=crop&q=80',
    tags: ['Baking', 'Late Night', 'Sweet']
  },
  {
    user_id: 4,
    business_name: 'Vintage & Thrifted Threadz',
    description: 'Curated college vintage wear, upcycled streetwear, and custom embroidery for the aesthetic student.',
    rating: 4.7,
    verified: true,
    category: 'Clothing & Fashion',
    bank_account: 'US-77-CITI-456123789',
    banner_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80',
    tags: ['Vintage', 'Sustainable', 'Streetwear']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 101,
    seller_id: 2,
    seller_name: 'EcoCarry Canvas & Bags',
    name: 'Classic Campus Canvas Tote Bag',
    price: 15.00,
    category: 'Bags & Accessories',
    description: 'Spacious canvas tote bag with double stitching, featuring a reinforced bottom and interior zipper pocket.',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
    is_preorder: false,
    stock: 24,
    created_at: '2025-10-05 14:30:00',
    sales_count: 38,
    status: 'active',
    rating: 4.7,
    sku: 'ECO-TOTE-01',
    reviews: [
      { id: 1, user_id: 5, username: 'jordan_buyer', rating: 5, comment: 'Amazing quality! Fits all my books.', date: '2026-01-15' }
    ]
  },
  {
    id: 102,
    seller_id: 2,
    seller_name: 'EcoCarry Canvas & Bags',
    name: 'Minimalist Padded Laptop Sleeve',
    price: 22.00,
    category: 'Bags & Accessories',
    description: 'Padded neoprene sleeve with dual brass zippers. Water-resistant lining.',
    image_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&auto=format&fit=crop&q=80',
    is_preorder: true,
    preorder_deadline: '2026-03-10 23:59:59',
    stock: 50,
    created_at: '2025-10-12 09:15:00',
    sales_count: 12,
    status: 'active',
    rating: 4.9,
    sku: 'ECO-LAP-02',
    reviews: []
  },
  {
    id: 103,
    seller_id: 3,
    seller_name: 'Dorm Bites & Sweet Treats',
    name: 'Midnight Brownie Box (6 Pieces)',
    price: 12.00,
    category: 'Food & Snacks',
    description: 'Six ultra-fudgy chocolate brownies with crispy edges and gooey centers.',
    image_url: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=500&auto=format&fit=crop&q=80',
    is_preorder: false,
    stock: 8,
    created_at: '2025-10-15 12:00:00',
    sales_count: 84,
    status: 'active',
    rating: 4.8,
    sku: 'BITE-BRW-03',
    reviews: []
  },
  {
    id: 104,
    seller_id: 4,
    seller_name: 'Vintage & Thrifted Threadz',
    name: 'Vintage University Oversized Hoodie',
    price: 35.00,
    category: 'Clothing & Fashion',
    description: 'Authentic 90s vintage washed-out college hoodie. Perfectly distressed cuffs.',
    image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80',
    is_preorder: false,
    stock: 1,
    created_at: '2025-10-20 16:45:00',
    sales_count: 0,
    status: 'active',
    rating: 4.5,
    sku: 'VINT-HUD-04',
    reviews: []
  },
  {
    id: 105,
    seller_id: 4,
    seller_name: 'Vintage & Thrifted Threadz',
    name: 'Custom Embroidered Denim Jacket',
    price: 65.00,
    category: 'Clothing & Fashion',
    description: 'Pre-order a customized vintage denim jacket. You supply your size and theme.',
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=80',
    is_preorder: true,
    preorder_deadline: '2026-03-15 18:00:00',
    stock: 15,
    created_at: '2025-10-22 11:00:00',
    sales_count: 5,
    status: 'active',
    rating: 5.0,
    sku: 'VINT-DEN-05',
    reviews: []
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1001,
    buyer_id: 5,
    buyer_name: 'jordan_buyer',
    seller_id: 3,
    seller_name: 'Dorm Bites & Sweet Treats',
    items: [{ product_id: 103, product_name: 'Midnight Brownie Box (6 Pieces)', price: 12.00, quantity: 1 }],
    total_amount: 12.00,
    status: 'completed',
    order_type: 'regular',
    shipping_address: 'East Tower, Room 819',
    contact_phone: '+1 (555) 234-5678',
    created_at: '2026-02-10 22:15:00'
  }
];

export const BACKEND_CODE_SNIPPETS = {
  dbSchema: `// config/db.js
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'unimart_pro',
  waitForConnections: true,
  connectionLimit: 20
});
module.exports = pool;`,
  serverJs: `// server.js
const express = require('express');
const app = express();
app.use(express.json());
// Standard Enterprise Middleware setup...
app.listen(5000, () => console.log('Nexus Node.js Server Cluster Active'));`,
  authController: `// routes/auth.js
// Advanced JWT + Bcrypt Auth Implementation`,
  productController: `// routes/products.js
// Multi-threaded Product Querying`,
  orderController: `// routes/orders.js
// ACID Transactional logic for peer-to-peer commerce`
};
