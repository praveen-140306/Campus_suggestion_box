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

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/auth', authRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('MongoDB Connected');
    // Only listen if not running on Vercel
    if (process.env.NODE_ENV !== 'production') {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
}).catch(err => {
    console.error('MongoDB Connection Error:', err);
});

module.exports = app;
