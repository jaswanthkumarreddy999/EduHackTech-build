import { get, post, put, del } from './api.client';

const BASE_URL = '/events';

/**
 * Get public events
 */
export const getEvents = async () => {
    try {
        const response = await get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch events:', error);
        return [];
    }
};

/**
 * Get single event
 */
export const getEvent = async (id) => {
    try {
        const response = await get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch event:', error);
        return null;
    }
};

/**
 * Create event
 */
export const createEvent = async (eventData, token) => {
    const response = await post(BASE_URL, eventData, token);
    return response.data;
};

/**
 * Update event
 */
export const updateEvent = async (id, eventData, token) => {
    const response = await put(`${BASE_URL}/${id}`, eventData, token);
    return response.data;
};

/**
 * Delete event
 */
export const deleteEvent = async (id, token) => {
    await del(`${BASE_URL}/${id}`, token);
    return true;
};

/**
 * Register for event
 */
export const registerForEvent = async (id, teamData, token) => {
    const response = await post(`${BASE_URL}/${id}/register`, teamData, token);
    return response.data;
};

/**
 * Get event registrations (Organizer/Admin)
 */
export const getEventRegistrations = async (id, token) => {
    const response = await get(`${BASE_URL}/${id}/registrations`, token);
    return response.data;
};

/**
 * Get all events for Admin
 */
export const getAdminEvents = async (token) => {
    const response = await get(`${BASE_URL}/admin/all`, token);
    return response.data;
};

/**
 * Check if user is registered for event
 */
export const checkUserRegistration = async (id, token) => {
    const response = await get(`${BASE_URL}/${id}/check-registration`, token);
    return response;
};

/**
 * Delete/Cancel a registration (Admin/Organizer)
 */
export const deleteRegistration = async (eventId, regId, token) => {
    await del(`${BASE_URL}/${eventId}/registrations/${regId}`, token);
    return true;
};

/**
 * Get events created by current user (Organizer)
 */
export const getMyEvents = async (token) => {
    const response = await get(`${BASE_URL}/my-events`, token);
    return response.data;
};

/**
 * Update registration status (Organizer/Admin)
 */
export const updateRegistrationStatus = async (eventId, regId, status, token) => {
    const response = await put(`${BASE_URL}/${eventId}/registrations/${regId}/status`, { status }, token);
    return response.data;
};

/**
 * Review problem statement (Admin/Organizer)
 */
export const reviewProblemStatement = async (eventId, regId, status, remarks, token) => {
    const response = await put(`${BASE_URL}/${eventId}/registrations/${regId}/review-problem`, { status, remarks }, token);
    return response.data;
};

/**
 * Resubmit problem statement after rejection (User)
 */
export const resubmitProblemStatement = async (eventId, problemStatement, token) => {
    const response = await put(`${BASE_URL}/${eventId}/resubmit-problem`, { problemStatement }, token);
    return response.data;
};

/**
 * Complete payment (User)
 */
export const completePayment = async (eventId, token) => {
    const response = await put(`${BASE_URL}/${eventId}/complete-payment`, {}, token);
    return response.data;
};

/**
 * Get user's registrations
 */
export const getMyRegistrations = async (token) => {
    const response = await get(`${BASE_URL}/my-registrations`, token);
    return response.data;
};
