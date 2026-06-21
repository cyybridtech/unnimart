const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

// Checkout
router.post('/checkout', authenticateToken, (req, res) => {
  const { cart, shipping_address, contact_phone, payment_reference } = req.body;
  const buyerId = req.user.id;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Perform checkout in a transaction
  const transaction = db.transaction(() => {
    // 1. Create the order
    const orderInfo = db.prepare(`
      INSERT INTO orders (buyer_id, total_amount, shipping_address, contact_phone)
      VALUES (?, ?, ?, ?)
    `).run(buyerId, totalAmount, shipping_address, contact_phone);

    const orderId = orderInfo.lastInsertRowid;

    // 2. Add order items and update product stock/sales
    for (const item of cart) {
      db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?, ?)
      `).run(orderId, item.product_id, item.product_name, item.price, item.quantity);

      const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(item.product_id);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product_name}`);
      }

      db.prepare(`
        UPDATE products
        SET stock = stock - ?, sales_count = sales_count + ?
        WHERE id = ?
      `).run(item.quantity, item.quantity, item.product_id);
    }

    return orderId;
  });

  try {
    const orderId = transaction();

    // Create notifications for sellers
    const sellers = db.prepare(`
      SELECT DISTINCT p.seller_id FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `).all(orderId);

    for (const seller of sellers) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `).run(seller.seller_id, 'New Order Received', `You have a new order #${orderId}. Check your Seller Hub.`, 'order');
    }

    res.status(201).json({ id: orderId, message: 'Order placed successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get user orders
router.get('/my-orders', authenticateToken, (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    } else if (req.user.role === 'seller') {
      // Get orders that contain items from this seller
      orders = db.prepare(`
        SELECT DISTINCT o.* FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.seller_id = ?
        ORDER BY o.created_at DESC
      `).all(req.user.id);
    } else {
      orders = db.prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC').all(req.user.id);
    }

    // Add items to each order
    const ordersWithItems = orders.map(o => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      return { ...o, items };
    });

    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update order status
router.patch('/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  try {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);

    const order = db.prepare('SELECT buyer_id FROM orders WHERE id = ?').get(orderId);
    if (order) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `).run(order.buyer_id, 'Order Status Updated', `Your order #${orderId} is now: ${status}.`, 'order');
    }

    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Cancel order
router.post('/:id/cancel', authenticateToken, (req, res) => {
  const orderId = req.params.id;

  try {
    const transaction = db.transaction(() => {
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      if (!order) throw new Error('Order not found');

      // Authorization check: only buyer or admin can cancel, and only if pending
      if (order.buyer_id !== req.user.id && req.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      if (order.status !== 'pending' && req.user.role !== 'admin') {
        throw new Error('Only pending orders can be cancelled');
      }

      // Restore stock
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      for (const item of items) {
        db.prepare('UPDATE products SET stock = stock + ?, sales_count = sales_count - ? WHERE id = ?')
          .run(item.quantity, item.quantity, item.product_id);
      }

      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', orderId);
    });

    transaction();
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
