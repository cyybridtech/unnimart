const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'unimart.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'seller', 'buyer')) DEFAULT 'buyer',
    status TEXT CHECK(status IN ('active', 'pending', 'suspended')) DEFAULT 'active',
    phone TEXT,
    dorm TEXT,
    joined_date TEXT DEFAULT (DATE('now')),
    balance REAL DEFAULT 0.0,
    avatar_url TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    is_preorder INTEGER DEFAULT 0,
    preorder_deadline TEXT,
    stock INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (DATETIME('now')),
    sales_count INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
    rating REAL DEFAULT 5.0,
    sku TEXT UNIQUE,
    FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS seller_profiles (
    user_id INTEGER PRIMARY KEY,
    business_name TEXT NOT NULL,
    description TEXT,
    rating REAL DEFAULT 5.0,
    verified INTEGER DEFAULT 0,
    category TEXT,
    bank_account TEXT,
    banner_url TEXT,
    tags TEXT, -- JSON array
    plan_id TEXT DEFAULT 'basic',
    subscription_status TEXT DEFAULT 'active',
    subscription_expiry TEXT,
    subscription_auto_renew INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'preparing', 'shipped', 'completed', 'cancelled')) DEFAULT 'pending',
    order_type TEXT CHECK(order_type IN ('regular', 'preorder')) DEFAULT 'regular',
    shipping_address TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME('now')),
    FOREIGN KEY (buyer_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    date TEXT DEFAULT (DATE('now')),
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'order', 'system', 'approval'
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (DATETIME('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );
`);

module.exports = db;
