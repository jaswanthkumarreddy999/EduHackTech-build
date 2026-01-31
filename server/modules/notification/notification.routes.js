// server/modules/notification/notification.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/authMiddleware');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
} = require('./notification.controller');

// All routes require authentication
router.use(protect);

// User routes
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Admin route for creating notifications
router.post('/', authorize('admin'), createNotification);

module.exports = router;
