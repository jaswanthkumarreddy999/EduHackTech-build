// server/modules/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/authMiddleware');

// Import the functions we just created
const {
    register,
    loginWithOtp,
    checkEmail,
    sendOtp,
    getProfile,
    updateProfile
} = require('./auth.controller');

// Public routes
router.post('/register', register);
router.post('/login-otp', loginWithOtp);
router.post('/check-email', checkEmail);
router.post('/send-otp', sendOtp);

// Protected routes (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;