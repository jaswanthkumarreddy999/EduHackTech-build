const express = require('express');
const router = express.Router();
const {
    createChallenge,
    getChallenges,
    getChallenge,
    updateChallenge,
    deleteChallenge
} = require('./challenge.controller');

const { protect, authorize } = require('../../middlewares/authMiddleware');

// Public routes
router.get('/', getChallenges);
router.get('/:id', getChallenge);

// Protected routes (Admin, Organizers/instructors? For now Admin/Instructor)
// Assuming 'admin' and 'instructor' can create challenges. Adjust roles as needed.
router.post('/', protect, authorize('admin', 'instructor'), createChallenge);
router.put('/:id', protect, authorize('admin', 'instructor'), updateChallenge);
router.delete('/:id', protect, authorize('admin', 'instructor'), deleteChallenge);

module.exports = router;
