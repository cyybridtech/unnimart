const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

// Signup
router.post('/register', async (req, res) => {
  const { username, email, password, role, phone, dorm } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = role === 'seller' ? 'pending' : 'active';

    const info = db.prepare(`
      INSERT INTO users (username, email, password_hash, role, status, phone, dorm, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(username, email, hashedPassword, role, status, phone, dorm, `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`);

    const userId = info.lastInsertRowid;

    if (role === 'seller') {
      db.prepare(`
        INSERT INTO seller_profiles (user_id, business_name, description, category)
        VALUES (?, ?, ?, ?)
      `).run(userId, `${username}'s Shop`, '', '');
    }

    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account is suspended' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Don't send password hash
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Profile
const authenticateToken = require('../middleware/auth');
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, email, role, status, phone, dorm, joined_date, balance, avatar_url FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
