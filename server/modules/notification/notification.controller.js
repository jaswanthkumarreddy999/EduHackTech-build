// server/modules/notification/notification.controller.js
const Notification = require('./notification.model');

// @desc    Get user's notifications (latest 20)
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const unreadCount = await Notification.countDocuments({
            userId: req.user.id,
            isRead: false
        });

        res.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ success: true, data: notification });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a notification (for system/admin use)
// @route   POST /api/notifications
// @access  Private (Admin or System)
exports.createNotification = async (req, res) => {
    try {
        const { userId, type, title, message, link } = req.body;

        const notification = await Notification.create({
            userId,
            type: type || 'info',
            title,
            message,
            link
        });

        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create notification for a user (helper function for internal use)
// This is not an API endpoint, but used by other parts of the system
exports.createNotificationForUser = async (userId, type, title, message, link = null) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            link
        });
        return notification;
    } catch (error) {
        console.error('Create notification helper error:', error);
        throw error;
    }
};
