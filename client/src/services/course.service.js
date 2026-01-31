/**
 * Course Service
 * Handles all course-related API operations
 */

import { get, post, put, del } from './api.client';
import API_CONFIG from './api.config';

const { endpoints } = API_CONFIG;

/**
 * Get all published courses (public)
 * @returns {Promise<Array>} List of courses
 */
export const getCourses = async () => {
    try {
        const response = await get(endpoints.courses.list);
        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch courses:', error);
        return [];
    }
};

/**
 * Get a single course by ID
 * @param {string} id - Course ID
 * @returns {Promise<Object|null>} Course object
 */
export const getCourse = async (id) => {
    try {
        const response = await get(endpoints.courses.single(id));
        return response.data || null;
    } catch (error) {
        console.error('Failed to fetch course:', error);
        return null;
    }
};

/**
 * Get all courses for admin (includes drafts)
 * @param {string} token - Auth token
 * @returns {Promise<Array>} List of courses
 */
export const getAdminCourses = async (token) => {
    try {
        const response = await get(endpoints.courses.adminList, token);
        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch admin courses:', error);
        throw error;
    }
};

/**
 * Create a new course
 * @param {Object} courseData - Course data
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Created course
 */
export const createCourse = async (courseData, token) => {
    const response = await post(endpoints.courses.adminCreate, courseData, token);
    return response.data;
};

/**
 * Update an existing course
 * @param {string} id - Course ID
 * @param {Object} courseData - Updated course data
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Updated course
 */
export const updateCourse = async (id, courseData, token) => {
    const response = await put(endpoints.courses.adminUpdate(id), courseData, token);
    return response.data;
};

/**
 * Delete a course
 * @param {string} id - Course ID
 * @param {string} token - Auth token
 * @returns {Promise<boolean>} Success status
 */
export const deleteCourse = async (id, token) => {
    await del(endpoints.courses.adminDelete(id), token);
    return true;
};



/**
 * Get course content (Syllabus)
 */
export const getCourseContent = async (id) => {
    try {
        const response = await get(endpoints.courses.getContent(id));
        return response.data;
    } catch (error) {
        console.error('Failed to fetch content:', error);
        return null;
    }
};

/**
 * Update course content (Admin)
 */
export const updateCourseContent = async (id, contentData, token) => {
    const response = await put(endpoints.courses.updateContent(id), contentData, token);
    return response.data;
};

export default {
    getCourses,
    getCourse,
    getAdminCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseContent,
    updateCourseContent,
};
