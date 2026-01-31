const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { protect } = require('../../middlewares/authMiddleware');

router.post('/chat', protect, aiController.chatWithPet);

module.exports = router;
