const Event = require('./event.model');
const Registration = require('./registration.model');
const { createNotificationForUser } = require('../notification/notification.controller');

// @desc    Get all public events (upcoming/live)
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: { $in: ['upcoming', 'live', 'past'] } })
            .populate('createdBy', 'name')
            .sort({ startDate: 1 });
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get all events (Admin - includes drafts)
// @route   GET /api/admin/events
// @access  Private/Admin
exports.getAllEventsAdmin = async (req, res) => {
    try {
        const events = await Event.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name');
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Create new event (Organizer)
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        // Default to 'upcoming' if not specified, or let validating logic handle it
        req.body.status = 'upcoming';

        const event = await Event.create(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid data', error: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check ownership or admin
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Update failed', error: error.message });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Admin)
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check ownership or admin
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();
        res.status(200).json({ success: true, message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
    }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check if already registered
        const existing = await Registration.findOne({ event: req.params.id, user: req.user.id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already registered for this event' });
        }

        // Validate required fields
        const { teamName, teamMembers, locality, problemStatement } = req.body;

        if (!teamName || !teamName.trim()) {
            return res.status(400).json({ success: false, message: 'Team name is required' });
        }

        if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one team member is required' });
        }

        // Validate problem statement for paid events
        if (event.registrationFee && event.registrationFee > 0) {
            if (!problemStatement || !problemStatement.title || !problemStatement.title.trim()) {
                return res.status(400).json({ success: false, message: 'Problem statement title is required' });
            }
            if (!problemStatement.description || !problemStatement.description.trim()) {
                return res.status(400).json({ success: false, message: 'Problem statement description is required' });
            }
        }

        // Validate team size against event limits
        const minSize = event.teamSize?.min || 1;
        const maxSize = event.teamSize?.max || 10;

        if (teamMembers.length < minSize) {
            return res.status(400).json({
                success: false,
                message: `Team must have at least ${minSize} member${minSize > 1 ? 's' : ''}`
            });
        }

        if (teamMembers.length > maxSize) {
            return res.status(400).json({
                success: false,
                message: `Team cannot have more than ${maxSize} members`
            });
        }

        // Validate each team member has required fields
        for (let i = 0; i < teamMembers.length; i++) {
            const member = teamMembers[i];
            if (!member.name || !member.name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: `Member ${i + 1}: Name is required`
                });
            }
            if (!member.email || !member.email.trim()) {
                return res.status(400).json({
                    success: false,
                    message: `Member ${i + 1}: Email is required`
                });
            }
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(member.email)) {
                return res.status(400).json({
                    success: false,
                    message: `Member ${i + 1}: Invalid email format`
                });
            }
        }

        // Ensure first member is marked as leader
        const processedMembers = teamMembers.map((member, index) => ({
            ...member,
            role: index === 0 ? 'leader' : 'member'
        }));

        // Determine payment status
        const hasFee = event.registrationFee && event.registrationFee > 0;
        const paymentStatus = hasFee ? 'pending' : 'not_required';

        const registration = await Registration.create({
            event: req.params.id,
            user: req.user.id,
            teamName: teamName.trim(),
            teamMembers: processedMembers,
            locality: locality || {},
            problemStatement: problemStatement ? {
                title: problemStatement.title?.trim() || '',
                description: problemStatement.description?.trim() || '',
                techStack: problemStatement.techStack?.trim() || '',
                status: 'pending_review'
            } : undefined,
            paymentStatus,
            paymentAmount: hasFee ? event.registrationFee : 0
        });

        // Increment participant count
        event.participantCount = (event.participantCount || 0) + 1;
        await event.save();

        // Create notification for the user
        try {
            const message = hasFee
                ? `Team "${teamName}" registered for "${event.title}". Your problem statement is under review. You can pay after approval.`
                : `Team "${teamName}" is registered for "${event.title}". Good luck!`;

            await createNotificationForUser(
                req.user.id,
                'info',
                hasFee ? 'Registration Submitted! 📝' : 'Registration Confirmed! 🎯',
                message,
                `/competition/${req.params.id}`
            );
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.status(201).json({ success: true, data: registration });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
};

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
// @access  Private (Organizer/Admin)
exports.getEventRegistrations = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check auth
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const registrations = await Registration.find({ event: req.params.id }).populate('user', 'name email');
        res.status(200).json({ success: true, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
    }
};

// @desc    Check if current user is registered for event
// @route   GET /api/events/:id/check-registration
// @access  Private
exports.checkUserRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOne({
            event: req.params.id,
            user: req.user.id
        });
        res.status(200).json({
            success: true,
            isRegistered: !!registration,
            registration: registration || null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Check failed', error: error.message });
    }
};

// @desc    Delete/Cancel a registration (Admin/Organizer)
// @route   DELETE /api/events/:id/registrations/:regId
// @access  Private (Admin/Organizer)
exports.deleteRegistration = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check auth - only admin or event creator can delete registrations
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const registration = await Registration.findById(req.params.regId);
        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        await registration.deleteOne();

        // Decrement participant count
        if (event.participantCount > 0) {
            event.participantCount -= 1;
            await event.save();
        }

        res.status(200).json({ success: true, message: 'Registration cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
    }
};

// @desc    Get events created by current user (Organizer)
// @route   GET /api/events/my-events
// @access  Private
exports.getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });

        // Get registration counts for each event
        const eventsWithStats = await Promise.all(events.map(async (event) => {
            const registrations = await Registration.find({ event: event._id });
            const pendingCount = registrations.filter(r => r.status === 'pending').length;
            const approvedCount = registrations.filter(r => r.status === 'approved').length;
            const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

            return {
                ...event.toObject(),
                stats: {
                    totalRegistrations: registrations.length,
                    pending: pendingCount,
                    approved: approvedCount,
                    rejected: rejectedCount
                }
            };
        }));

        res.status(200).json({ success: true, count: eventsWithStats.length, data: eventsWithStats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Update registration status (Organizer/Admin)
// @route   PUT /api/events/:id/registrations/:regId/status
// @access  Private (Organizer/Admin)
exports.updateRegistrationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Use: pending, approved, or rejected' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check auth - only admin or event creator can update registration status
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const registration = await Registration.findById(req.params.regId);
        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        registration.status = status;
        await registration.save();

        res.status(200).json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
};

// @desc    Get current user's event registrations
// @route   GET /api/events/my-registrations
// @access  Private
exports.getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user.id })
            .populate('event', 'title thumbnail startDate endDate status prizePool venue registrationFee')
            .sort({ registeredAt: -1 });

        res.status(200).json({ success: true, count: registrations.length, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
    }
};

// @desc    User unregisters from an event
// @route   DELETE /api/events/:id/unregister
// @access  Private
exports.unregisterFromEvent = async (req, res) => {
    try {
        const registration = await Registration.findOneAndDelete({
            event: req.params.id,
            user: req.user.id
        });

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        // Decrement participant count
        const event = await Event.findById(req.params.id);
        if (event && event.participantCount > 0) {
            event.participantCount -= 1;
            await event.save();
        }

        res.status(200).json({ success: true, message: 'Successfully unregistered from event' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unregister failed', error: error.message });
    }
};

// @desc    User updates their registration (team name)
// @route   PUT /api/events/:id/my-registration
// @access  Private
exports.updateMyRegistration = async (req, res) => {
    try {
        const { teamName } = req.body;

        const registration = await Registration.findOne({
            event: req.params.id,
            user: req.user.id
        });

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        if (teamName !== undefined) {
            registration.teamName = teamName;
        }

        await registration.save();

        res.status(200).json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
};

// @desc    Admin reviews problem statement (approve/reject)
// @route   PUT /api/events/:id/registrations/:regId/review-problem
// @access  Private (Admin/Organizer)
exports.reviewProblemStatement = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Use: approved or rejected'
            });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check auth - only admin or event creator
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const registration = await Registration.findById(req.params.regId).populate('user', 'name email');
        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        // Update problem statement status
        registration.problemStatement.status = status;
        registration.problemStatement.reviewedAt = new Date();
        registration.problemStatement.reviewedBy = req.user.id;

        if (status === 'rejected' && remarks) {
            registration.problemStatement.adminRemarks = remarks.trim();
        } else {
            registration.problemStatement.adminRemarks = '';
        }

        await registration.save();

        // Send notification to user
        try {
            if (status === 'approved') {
                await createNotificationForUser(
                    registration.user._id,
                    'success',
                    'Problem Statement Approved! ✅',
                    `Great news! Your problem statement for "${event.title}" has been approved. You can now proceed to payment.`,
                    `/competition/${req.params.id}`
                );
            } else {
                await createNotificationForUser(
                    registration.user._id,
                    'warning',
                    'Problem Statement Needs Revision ⚠️',
                    `Your problem statement for "${event.title}" needs changes. Feedback: ${remarks || 'Please improve your submission.'}`,
                    `/competition/${req.params.id}`
                );
            }
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.status(200).json({
            success: true,
            message: `Problem statement ${status}`,
            data: registration
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Review failed', error: error.message });
    }
};

// @desc    User resubmits problem statement after rejection
// @route   PUT /api/events/:id/resubmit-problem
// @access  Private
exports.resubmitProblemStatement = async (req, res) => {
    try {
        const { problemStatement } = req.body;

        if (!problemStatement || !problemStatement.title || !problemStatement.description) {
            return res.status(400).json({
                success: false,
                message: 'Problem statement title and description are required'
            });
        }

        const registration = await Registration.findOne({
            event: req.params.id,
            user: req.user.id
        });

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        if (registration.problemStatement?.status !== 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Can only resubmit rejected problem statements'
            });
        }

        registration.problemStatement = {
            title: problemStatement.title.trim(),
            description: problemStatement.description.trim(),
            techStack: problemStatement.techStack?.trim() || '',
            status: 'pending_review',
            adminRemarks: ''
        };

        await registration.save();

        res.status(200).json({
            success: true,
            message: 'Problem statement resubmitted for review',
            data: registration
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Resubmit failed', error: error.message });
    }
};

// @desc    Complete payment for registration
// @route   PUT /api/events/:id/complete-payment
// @access  Private
exports.completePayment = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const registration = await Registration.findOne({
            event: req.params.id,
            user: req.user.id
        });

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        // Check if problem statement is approved (for paid events)
        if (registration.problemStatement?.status && registration.problemStatement.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Cannot complete payment. Problem statement must be approved first.'
            });
        }

        if (registration.paymentStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Payment already completed'
            });
        }

        // Mock payment processing - in production, integrate actual payment gateway
        registration.paymentStatus = 'completed';
        registration.paymentDate = new Date();
        registration.status = 'approved';

        await registration.save();

        // Send confirmation notification
        try {
            await createNotificationForUser(
                req.user.id,
                'success',
                'Payment Successful! 🎉',
                `Your payment of ₹${registration.paymentAmount} for "${event.title}" is complete. You're all set!`,
                `/competition/${req.params.id}`
            );
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.status(200).json({
            success: true,
            message: 'Payment completed successfully',
            data: registration
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Payment failed', error: error.message });
    }
};
