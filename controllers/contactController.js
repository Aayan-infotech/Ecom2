// controllers/contactController.js
const Contact = require('../models/contactModel');

// Handle contact form submission
const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation (you can enhance this)
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        status: 400,
        error: 'All fields are required.' });
    }

    // Create new contact record
    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });

    await newContact.save();

    res.status(201).json({ 
        success: true,
        status: 201,
        message: 'Your inquiry has been submitted successfully.' });
  } catch (err) {
    res.status(500).json({ 
        success: false,
        status: 500,
        error: 'There was a problem submitting your inquiry. Please try again later.' });
  }
};

module.exports = {
    createContact
}