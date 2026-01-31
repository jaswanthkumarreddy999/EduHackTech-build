/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 */

// Helper to remove trailing slashes from URL
const getBaseUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return url.replace(/\/+$/, ''); // Remove trailing slashes
};

const API_CONFIG = {
    // Base URL - can be changed via environment variable (trailing slashes removed)
    baseUrl: getBaseUrl(),

    // Timeout for requests (in ms)
    timeout: 10000,

    // Endpoints
    endpoints: {
        // Auth
        auth: {
            checkEmail: '/auth/check-email',
            sendOtp: '/auth/send-otp',
            login: '/auth/login-otp',
            register: '/auth/register',
        },
        // Courses
        courses: {
            list: '/courses',
            single: (id) => `/courses/${id}`,
            adminList: '/courses/admin/all',
            adminCreate: '/courses/admin',
            adminUpdate: (id) => `/courses/admin/${id}`,
            adminDelete: (id) => `/courses/admin/${id}`,
            // Content
            getContent: (id) => `/courses/${id}/content`,
            updateContent: (id) => `/courses/admin/${id}/content`,
        },
        // Events
        // Events
        events: {
            list: '/events',
            single: (id) => `/events/${id}`,
            adminList: '/events/admin/all',
            create: '/events',
            update: (id) => `/events/${id}`,
            delete: (id) => `/events/${id}`,
            register: (id) => `/events/${id}/register`,
            registrations: (id) => `/events/${id}/registrations`,
        },
        // Notifications
        notifications: {
            list: '/notifications',
            markRead: (id) => `/notifications/${id}/read`,
            markAllRead: '/notifications/read-all',
            delete: (id) => `/notifications/${id}`,
            create: '/notifications',
        },
    },
};

export default API_CONFIG;
