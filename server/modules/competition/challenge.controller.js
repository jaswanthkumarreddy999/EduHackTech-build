const Challenge = require('./challenge.model');

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private (Admin/Organizer)
exports.createChallenge = async (req, res) => {
    try {
        const { title, description, difficulty, points, category, event, testCases } = req.body;

        const challenge = await Challenge.create({
            title,
            description,
            difficulty,
            points,
            category,
            event: event || null,
            testCases,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: challenge
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Public
exports.getChallenges = async (req, res) => {
    try {
        let query;
        if (req.query.event) {
            query = Challenge.find({ event: req.query.event });
        } else {
            query = Challenge.find();
        }

        const challenges = await query.populate('event', 'title').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: challenges.length,
            data: challenges
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single challenge
// @route   GET /api/challenges/:id
// @access  Public
exports.getChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id).populate('event', 'title');

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        res.status(200).json({
            success: true,
            data: challenge
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update challenge
// @route   PUT /api/challenges/:id
// @access  Private (Admin/Organizer)
exports.updateChallenge = async (req, res) => {
    try {
        let challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        // Check ownership or admin status (basic check)
        if (challenge.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this challenge'
            });
        }

        challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: challenge
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete challenge
// @route   DELETE /api/challenges/:id
// @access  Private (Admin/Organizer)
exports.deleteChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        // Check ownership or admin status
        if (challenge.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this challenge'
            });
        }

        await challenge.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
