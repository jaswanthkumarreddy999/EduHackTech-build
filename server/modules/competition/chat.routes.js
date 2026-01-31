const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/authMiddleware');
const {
    getOrCreateConversation,
    getMessages,
    sendMessage,
    getConversations,
    getUnreadCount,
    markConversationRead
} = require('./chat.controller');

router.use(protect);

router.get('/unread-count', getUnreadCount);
router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/conversation/:id/messages', getMessages);
router.put('/conversation/:id/read', markConversationRead);
router.post('/messages', sendMessage);

module.exports = router;
