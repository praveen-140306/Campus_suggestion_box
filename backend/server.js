const path = require('path');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const suggestionRoutes = require('./routes/suggestionRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// ✅ ADD THIS (fix COOP issue)
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/auth', authRoutes);

// ✅ BETTER Mongo connection (important for Vercel)

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const db = await mongoose.connect(process.env.MONGO_URI);
  isConnected = db.connections[0].readyState;
};


// ✅ EXPORT FUNCTION for Vercel (CRITICAL)
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};