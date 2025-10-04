const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { authenticateToken, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = 3000;

// Replace with your MongoDB credentials
const MONGODB_URI = "mongodb+srv://sunjeetkajla:Sk88112299.@testcluster.m8fpqgj.mongodb.net/?retryWrites=true&w=majority&appName=TestCluster";

app.use(express.json());
app.use(express.static('public'));

let db, userModel, productModel, orderModel;

// MongoDB connection
MongoClient.connect(MONGODB_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db('ecommerce');
    userModel = new User(db);
    productModel = new Product(db);
    orderModel = new Order(db);
    
    // Seed products
    productModel.seedProducts();
  })
  .catch(error => console.error('MongoDB connection error:', error));

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await userModel.create({ name, email, password: hashedPassword });
    
    const token = jwt.sign({ userId: result.insertedId, email }, JWT_SECRET);
    res.json({ token, user: { id: result.insertedId, name, email } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await userModel.findByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    const products = await productModel.getAll({ category }, search);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Order routes
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, total, shippingAddress } = req.body;
    const order = await orderModel.create({
      userId: req.user.userId,
      items,
      total,
      shippingAddress
    });
    res.json({ orderId: order.insertedId, message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await orderModel.findByUserId(req.user.userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
