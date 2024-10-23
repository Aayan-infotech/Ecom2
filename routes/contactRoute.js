// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const {createContact} = require('../controllers/contactController');

// POST /api/contact
router.post('/contactUs', createContact);

module.exports = router;
