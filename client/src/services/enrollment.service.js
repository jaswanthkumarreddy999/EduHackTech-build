/**
 * Enrollment Service
 * Handles all enrollment-related API operations
 */

import { get, post, put, del } from './api.client';
import API_CONFIG from './api.config';

const BASE = '/enrollments';

/**
 * Enroll in a course
 * @param {string} courseId - Course ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Enrollment record
 */
export const enrollInCourse = async (courseId, token) => {
    const response = await post(`${BASE}/${courseId}`, {}, token);
    return response.data;
};

/**
 * Get user's enrollments
 * @param {string} token - Auth token
 * @returns {Promise<Array>} List of enrollments
 */
export const getMyEnrollments = async (token) => {
    try {
        const response = await get(`${BASE}/my`, token);
        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch enrollments:', error);
        return [];
    }
};

/**
 * Check if user is enrolled in a course
 * @param {string} courseId - Course ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} { enrolled: boolean, data: enrollment }
 */
export const checkEnrollment = async (courseId, token) => {
    try {
        const response = await get(`${BASE}/check/${courseId}`, token);
        return response;
    } catch (error) {
        return { enrolled: false, data: null };
    }
};

/**
 * Update enrollment progress
 * @param {string} courseId - Course ID
 * @param {Object} progressData - { progress: number, completedModule: string }
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Updated enrollment
 */
export const updateProgress = async (courseId, progressData, token) => {
    const response = await put(`${BASE}/${courseId}/progress`, progressData, token);
    return response.data;
};

/**
 * Unenroll from a course
 * @param {string} courseId - Course ID
 * @param {string} token - Auth token
 * @returns {Promise<boolean>} Success status
 */
export const unenroll = async (courseId, token) => {
    await del(`${BASE}/${courseId}`, token);
    return true;
};



/**
 * Get all users enrolled in a course (Admin)
 */
export const getCourseUsers = async (courseId, token) => {
    const response = await get(`${BASE}/course/${courseId}/users`, token);
    return response.data || [];
};

/**
 * Admin unenroll a user
 */
export const kickUser = async (courseId, userId, token) => {
    await del(`${BASE}/admin/${courseId}/${userId}`, token);
    return true;
};

export default {
    enrollInCourse,
    getMyEnrollments,
    checkEnrollment,
    updateProgress,
    unenroll,
    getCourseUsers,
    kickUser,
};
