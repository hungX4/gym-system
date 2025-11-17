// routes/users.js
const express = require('express');
const router = express.Router();
const { auth, isCoach } = require('../middleware/auth');
const { getProfile,
    updateProfile,
    getPublicProfileById } = require('../controller/userController');

// profile
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/profile/:id', getPublicProfileById)
module.exports = router;
