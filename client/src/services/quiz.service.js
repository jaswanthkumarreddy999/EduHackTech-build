// client/src/services/quiz.service.js
import API_CONFIG from './api.config';

const { baseUrl } = API_CONFIG;

/**
 * Get quiz for taking (without correct answers)
 */
export const getQuiz = async (courseId, moduleId, lessonId, token) => {
    const response = await fetch(`${baseUrl}/quiz/${courseId}/${moduleId}/${lessonId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch quiz');
    }

    return response.json();
};

/**
 * Submit quiz answers
 */
export const submitQuiz = async (courseId, moduleId, lessonId, answers, timeTaken, token) => {
    const response = await fetch(`${baseUrl}/quiz/${courseId}/${moduleId}/${lessonId}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers, timeTaken }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit quiz');
    }

    return response.json();
};

/**
 * Get quiz result for a lesson
 */
export const getQuizResult = async (courseId, moduleId, lessonId, token) => {
    const response = await fetch(`${baseUrl}/quiz/${courseId}/${moduleId}/${lessonId}/result`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null; // No attempt yet
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch result');
    }

    return response.json();
};
