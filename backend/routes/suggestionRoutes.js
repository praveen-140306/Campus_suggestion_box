const express = require('express');
const router = express.Router();
const Suggestion = require('../models/Suggestion');
const { protect, admin } = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5000000 },
});

// POST /api/suggestions (Private)
router.post('/', protect, upload.single('attachment'), async (req, res) => {
    try {
        const { name, category, message, visibility } = req.body;
        
        let attachmentUrl = null;
        if (req.file) {
            attachmentUrl = `/${req.file.path.replace(/\\\\/g, '/').replace(/\\/g, '/')}`;
        }

        const newSuggestion = new Suggestion({
            user: req.user ? req.user._id : null,
            name: req.user ? req.user.name : name,
            category,
            message,
            attachmentUrl,
            visibility: visibility === 'personal' ? 'personal' : 'public'
        });
        await newSuggestion.save();
        res.status(201).json(newSuggestion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/suggestions/me (Private/Student)
router.get('/me', protect, async (req, res) => {
    try {
        const suggestions = await Suggestion.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/suggestions/public (Public)
router.get('/public', async (req, res) => {
    try {
        const suggestions = await Suggestion.find({ visibility: { $ne: 'personal' } })
            // Sort by most upvotes, then newest
            .sort({ upvotes: -1, createdAt: -1 });
        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/suggestions (Private/Admin)
router.get('/', protect, admin, async (req, res) => {
    try {
        const suggestions = await Suggestion.find()
            // Sort by most upvotes, then newest
            .sort({ upvotes: -1, createdAt: -1 });
        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/suggestions/:id/status (Private/Admin)
router.patch('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Under Review', 'Resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const suggestion = await Suggestion.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!suggestion) {
            return res.status(404).json({ error: 'Suggestion not found' });
        }
        
        res.json(suggestion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/suggestions/:id/reply (Private/Admin)
router.patch('/:id/reply', protect, admin, async (req, res) => {
    try {
        const { adminReply } = req.body;
        
        const suggestion = await Suggestion.findByIdAndUpdate(
            req.params.id,
            { adminReply },
            { new: true }
        );
        
        if (!suggestion) {
            return res.status(404).json({ error: 'Suggestion not found' });
        }
        
        res.json(suggestion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/suggestions/:id/upvote (Private)
router.post('/:id/upvote', protect, async (req, res) => {
    try {
        const suggestion = await Suggestion.findById(req.params.id);
        
        if (!suggestion) {
            return res.status(404).json({ error: 'Suggestion not found' });
        }
        
        // Check if user has already upvoted
        const userId = req.user._id;
        const index = suggestion.upvotes.indexOf(userId);

        if (index === -1) {
            // Un-voted -> Upvote
            suggestion.upvotes.push(userId);
        } else {
            // Already Voted -> Un-vote (toggle)
            suggestion.upvotes.splice(index, 1);
        }

        await suggestion.save();
        res.json(suggestion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/suggestions/:id (Private/Admin)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Suggestion.findByIdAndDelete(req.params.id);
        res.json({ message: 'Suggestion deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
