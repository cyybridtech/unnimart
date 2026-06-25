const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

// Get all active products
router.get('/', (req, res) => {
  const {
    category,
    search,
    preordersOnly,
    minPrice,
    maxPrice,
    minRating,
    inStock
  } = req.query;

  let query = `
    SELECT p.*, u.username as seller_name
    FROM products p
    JOIN users u ON p.seller_id = u.id
    WHERE p.status = 'active'
  `;
  const params = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (preordersOnly === 'true') {
    query += ' AND is_preorder = 1';
  }

  if (minPrice) {
    query += ' AND price >= ?';
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(parseFloat(maxPrice));
  }

  if (minRating) {
    query += ' AND rating >= ?';
    params.push(parseFloat(minRating));
  }

  if (inStock === 'true') {
    query += ' AND stock > 0';
  }

  try {
    const products = db.prepare(query).all(...params);

    // Add reviews for each product
    const productsWithReviews = products.map(p => {
      const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ?').all(p.id);
      return { ...p, reviews: reviews || [] };
    });

    res.json(productsWithReviews);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

// Add a product (Sellers only)
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only sellers can add products' });
  }

  const { name, price, category, description, image_url, is_preorder, preorder_deadline, stock, sku } = req.body;

  try {
    const info = db.prepare(`
      INSERT INTO products (seller_id, name, price, category, description, image_url, is_preorder, preorder_deadline, stock, sku)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, name, price, category, description, image_url, is_preorder ? 1 : 0, preorder_deadline, stock, sku);

    res.status(201).json({ id: info.lastInsertRowid, message: 'Product added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
});

// Update product status
router.patch('/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const productId = req.params.id;

  try {
    const product = db.prepare('SELECT seller_id FROM products WHERE id = ?').get(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    db.prepare('UPDATE products SET status = ? WHERE id = ?').run(status, productId);
    res.json({ message: 'Product status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product status' });
  }
});

module.exports = router;
