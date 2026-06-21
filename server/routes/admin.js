const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get all users
router.get('/users', authenticateToken, isAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, email, role, status, phone, dorm, joined_date, balance FROM users').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Approve seller
router.post('/sellers/:id/approve', authenticateToken, isAdmin, (req, res) => {
  const userId = req.params.id;
  try {
    const transaction = db.transaction(() => {
      db.prepare('UPDATE users SET status = "active" WHERE id = ?').run(userId);
      db.prepare('UPDATE seller_profiles SET verified = 1 WHERE user_id = ?').run(userId);
    });
    transaction();

    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `).run(userId, 'Account Approved', 'Your seller account has been approved. Welcome to UniMart!', 'approval');

    res.json({ message: 'Seller approved' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving seller' });
  }
});

// Toggle user status
router.patch('/users/:id/status', authenticateToken, isAdmin, (req, res) => {
  const { status } = req.body;
  try {
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'User status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status' });
  }
});

module.exports = router;
