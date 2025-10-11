const express = require('express');
const router = express.Router();
const { getHomePage } = require('../controller/homeController');

// Home page route
router.get('/', getHomePage);

module.exports = router;