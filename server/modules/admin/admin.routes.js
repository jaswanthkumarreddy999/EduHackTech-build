const express = require('express');
const router = express.Router();
const { getAllUsers } = require('./admin.controller');
const { protect, authorize } = require('../../middlewares/authMiddleware');

router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
