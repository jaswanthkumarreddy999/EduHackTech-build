import { get, post, put } from './api.client';

const BASE = '/chat';

export const getUnreadCount = async (token) => {
    const res = await get(`${BASE}/unread-count`, token);
    return res;
};

export const markConversationRead = async (conversationId, token) => {
    await put(`${BASE}/conversation/${conversationId}/read`, {}, token);
};

export const getOrCreateConversation = async (otherUserId, token) => {
    const res = await post(`${BASE}/conversation`, { otherUserId }, token);
    return res.data;
};

export const getMessages = async (conversationId, token) => {
    const res = await get(`${BASE}/conversation/${conversationId}/messages`, token);
    return res.data;
};

export const sendMessage = async (conversationId, text, token) => {
    const res = await post(`${BASE}/messages`, { conversationId, text }, token);
    return res.data;
};

export const getConversations = async (token) => {
    const res = await get(`${BASE}/conversations`, token);
    return res.data;
};
