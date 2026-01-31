const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/authMiddleware');
const {
    getEvents,
    getAllEventsAdmin,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    getEventRegistrations,
    checkUserRegistration,
    deleteRegistration,
    getMyEvents,
    updateRegistrationStatus,
    getMyRegistrations,
    unregisterFromEvent,
    updateMyRegistration,
    reviewProblemStatement,
    resubmitProblemStatement,
    completePayment
} = require('./event.controller');

// Public Routes
router.get('/', getEvents);

// Protected Routes
router.get('/my-events', protect, getMyEvents); // Get organizer's events
router.get('/my-registrations', protect, getMyRegistrations); // Get user's event registrations
router.get('/:id', getEvent);

// Protected Routes (User/Organizer)
router.post('/', protect, createEvent); // Create Event (Organizer)
router.put('/:id', protect, updateEvent); // Update (Organizer/Admin)
router.delete('/:id', protect, deleteEvent); // Delete (Organizer/Admin)
router.post('/:id/register', protect, registerForEvent); // Register (User)
router.delete('/:id/unregister', protect, unregisterFromEvent); // Unregister from event
router.put('/:id/my-registration', protect, updateMyRegistration); // Update user's registration
router.get('/:id/check-registration', protect, checkUserRegistration); // Check if user is registered
router.get('/:id/registrations', protect, getEventRegistrations); // View Registrations (Organizer/Admin)
router.delete('/:id/registrations/:regId', protect, deleteRegistration); // Cancel Registration (Admin/Organizer)
router.put('/:id/registrations/:regId/status', protect, updateRegistrationStatus); // Update registration status

// Problem Statement Workflow Routes
router.put('/:id/registrations/:regId/review-problem', protect, reviewProblemStatement); // Admin review
router.put('/:id/resubmit-problem', protect, resubmitProblemStatement); // User resubmits after rejection
router.put('/:id/complete-payment', protect, completePayment); // Complete payment after approval

// Admin Routes (Specific God Mode lists if needed, but getAllEventsAdmin is specialized)
router.get('/admin/all', protect, authorize('admin'), getAllEventsAdmin);

module.exports = router;
