// client/src/services/notification.service.js
import API_CONFIG from './api.config';

const { baseUrl, endpoints } = API_CONFIG;

/**
 * Fetch user's notifications
 */
export const getNotifications = async (token) => {
    const response = await fetch(`${baseUrl}${endpoints.notifications.list}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch notifications');
    }

    return response.json();
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (id, token) => {
    const response = await fetch(`${baseUrl}${endpoints.notifications.markRead(id)}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to mark notification as read');
    }

    return response.json();
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (token) => {
    const response = await fetch(`${baseUrl}${endpoints.notifications.markAllRead}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
    }

    return response.json();
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id, token) => {
    const response = await fetch(`${baseUrl}${endpoints.notifications.delete(id)}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete notification');
    }

    return response.json();
};

/**
 * Format timestamp to relative time (e.g., "2 min ago")
 */
export const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
        return 'Just now';
    } else if (diffMin < 60) {
        return `${diffMin} min ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
};
