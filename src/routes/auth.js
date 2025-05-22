const express = require('express');
const router = express.Router();
const { signup, login, forgotPassword } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword); // <-- Add this line

module.exports = router;