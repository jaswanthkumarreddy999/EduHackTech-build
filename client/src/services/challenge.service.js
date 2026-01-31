import axios from 'axios';

const API_URL = 'http://localhost:5000/api/challenges';

// Create new challenge
export const createChallenge = async (challengeData, token) => {
    const response = await axios.post(API_URL, challengeData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// Get all challenges
export const getChallenges = async (eventId = null) => {
    let url = API_URL;
    if (eventId) {
        url += `?event=${eventId}`;
    }
    const response = await axios.get(url);
    return response.data;
};

// Get single challenge
export const getChallenge = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// Update challenge
export const updateChallenge = async (id, challengeData, token) => {
    const response = await axios.put(`${API_URL}/${id}`, challengeData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// Delete challenge
export const deleteChallenge = async (id, token) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
