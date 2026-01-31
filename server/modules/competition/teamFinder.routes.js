const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/authMiddleware');
const {
    upsertCard,
    getMyCard,
    updateActive,
    getMatches,
    sendConnect,
    respondConnect,
    getMyRequests,
    getActiveCount,
    getHackmates
} = require('./teamFinder.controller');

// Public
router.get('/active-count', getActiveCount);

// Protected
router.post('/', protect, upsertCard);
router.get('/me', protect, getMyCard);
router.patch('/active', protect, updateActive);
router.get('/matches', protect, getMatches);
router.get('/hackmates', protect, getHackmates);
router.post('/connect', protect, sendConnect);
router.put('/connect/:id', protect, respondConnect);
router.get('/requests', protect, getMyRequests);

module.exports = router;
