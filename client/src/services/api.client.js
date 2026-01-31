/**
 * API Client
 * Reusable, scalable HTTP client with standardized error handling
 */

import API_CONFIG from './api.config';

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @param {string} token - Optional auth token
 * @returns {Promise<Object>} - Response data
 */
export const apiRequest = async (endpoint, options = {}, token = null) => {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add auth token if provided
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            console.error("API Response Error Details:", data); // Log full details to console
            const errorMessage = data.error
                ? `${data.message} | Details: ${data.error}`
                : (data.message || `HTTP error! status: ${response.status}`);
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
};

/**
 * GET request helper
 */
export const get = (endpoint, token = null) =>
    apiRequest(endpoint, { method: 'GET' }, token);

/**
 * POST request helper
 */
export const post = (endpoint, body, token = null) =>
    apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }, token);

/**
 * PUT request helper
 */
export const put = (endpoint, body, token = null) =>
    apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }, token);

/**
 * DELETE request helper
 */
export const del = (endpoint, token = null) =>
    apiRequest(endpoint, { method: 'DELETE' }, token);

export default { get, post, put, del, apiRequest };
