// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const {createContact} = require('../controllers/contactController');

router.post('/contactUs', createContact);

module.exports = router;
