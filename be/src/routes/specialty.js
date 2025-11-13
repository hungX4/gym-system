const express = require('express');
const router = express.Router();
const {
    getAllSpecialties
} = require('../controller/specialtyController'); // Import controller

router.get('/specialty', getAllSpecialties); // Public, không cần auth

module.exports = router;