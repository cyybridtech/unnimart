const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

// --- Wishlist ---

router.get('/wishlist', authenticateToken, (req, res) => {
  try {
    const items = db.prepare(`
      SELECT p.* FROM products p
      JOIN wishlist w ON p.id = w.product_id
      WHERE w.user_id = ?
    `).all(req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

router.post('/wishlist/:productId', authenticateToken, (req, res) => {
  try {
    db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)').run(req.user.id, req.params.productId);
    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    res.status(400).json({ message: 'Already in wishlist or error' });
  }
});

router.delete('/wishlist/:productId', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

// --- Reviews ---

router.post('/reviews', authenticateToken, (req, res) => {
  const { product_id, rating, comment } = req.body;
  try {
    db.prepare(`
      INSERT INTO reviews (product_id, user_id, username, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(product_id, req.user.id, req.user.username, rating, comment);

    // Update product rating average
    const stats = db.prepare('SELECT AVG(rating) as avgRating FROM reviews WHERE product_id = ?').get(product_id);
    db.prepare('UPDATE products SET rating = ? WHERE id = ?').run(stats.avgRating, product_id);

    res.status(201).json({ message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting review' });
  }
});

// --- Notifications ---

router.get('/notifications', authenticateToken, (req, res) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

router.patch('/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

module.exports = router;
