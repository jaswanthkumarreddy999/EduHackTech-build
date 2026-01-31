import { get, post, put, patch } from './api.client';

const BASE = '/team-finder';

export const upsertCard = async (data, token) => {
    const res = await post(BASE, data, token);
    return res.data;
};

export const getMyCard = async (token) => {
    const res = await get(`${BASE}/me`, token);
    return res.data;
};

export const updateActive = async (active, token) => {
    const res = await patch(`${BASE}/active`, { active }, token);
    return res.data;
};

export const getMatches = async (eventId, token, params = {}) => {
    const searchParams = new URLSearchParams();
    if (eventId) searchParams.set('eventId', eventId);
    if (params.q) searchParams.set('q', params.q);
    if (params.role) searchParams.set('role', params.role);
    if (params.interests) searchParams.set('interests', params.interests);
    if (params.availability) searchParams.set('availability', params.availability);
    const query = searchParams.toString();
    const url = query ? `${BASE}/matches?${query}` : `${BASE}/matches`;
    const res = await get(url, token);
    return res;
};

export const sendConnect = async (to, eventId, message, token) => {
    const res = await post(`${BASE}/connect`, { to, eventId, message }, token);
    return res.data;
};

export const respondConnect = async (requestId, status, token) => {
    const res = await put(`${BASE}/connect/${requestId}`, { status }, token);
    return res.data;
};

export const getMyRequests = async (token) => {
    const res = await get(`${BASE}/requests`, token);
    return res.data;
};

export const getActiveCount = async () => {
    const res = await get(`${BASE}/active-count`);
    return res.count;
};

export const getHackmates = async (token) => {
    const res = await get(`${BASE}/hackmates`, token);
    return res.data;
};
