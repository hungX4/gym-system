// routes/users.js
const express = require('express');
const router = express.Router();
const { auth, isCoach } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controller/userController');

// profile
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
