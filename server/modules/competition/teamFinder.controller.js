const TeamFinder = require('./teamFinder.model');
const ConnectRequest = require('./connectRequest.model');
const User = require('../auth/user.model');

const ROLES = ['Frontend', 'Backend', 'Full Stack', 'ML / AI', 'UI/UX', 'Pitch / Business'];

// Complementary roles: pairs that work well together
const COMPLEMENTARY_PAIRS = [
    ['Frontend', 'Backend'],
    ['Frontend', 'UI/UX'],
    ['Backend', 'ML / AI'],
    ['Full Stack', 'UI/UX'],
    ['Full Stack', 'Pitch / Business'],
    ['Frontend', 'Pitch / Business'],
    ['Backend', 'Pitch / Business'],
    ['ML / AI', 'UI/UX']
];

function areRolesComplementary(roleA, roleB) {
    if (roleA === roleB) return false; // Same role = not complementary
    const roles = [roleA, roleB].sort();
    return COMPLEMENTARY_PAIRS.some(([a, b]) => roles[0] === a && roles[1] === b);
}

function computeMatchScore(myCard, otherCard) {
    let score = 0;

    // Same hackathon interest: +40 (max 40 if any overlap)
    const commonInterests = myCard.interests.filter(i => otherCard.interests.includes(i));
    if (commonInterests.length > 0) score += 40;

    // Complementary role: +30
    if (areRolesComplementary(myCard.role, otherCard.role) ||
        areRolesComplementary(myCard.role, otherCard.secondaryRole || '') ||
        areRolesComplementary(myCard.secondaryRole || '', otherCard.role)) {
        score += 30;
    }

    // Overlapping availability: +20 (if any overlap)
    const commonAvailability = myCard.availability.filter(a => otherCard.availability.includes(a));
    if (commonAvailability.length > 0) score += 20;

    // Similar experience: +10
    const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
    const diff = Math.abs((levelOrder[myCard.level] || 1) - (levelOrder[otherCard.level] || 1));
    if (diff === 0) score += 10;

    return score;
}

// @desc    Create or update Team Finder card
// @route   POST /api/team-finder
// @access  Private
exports.upsertCard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { role, secondaryRole, level, availability, interests, lookingFor, bio } = req.body;

        const user = await User.findById(userId).select('name');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        let card = await TeamFinder.findOne({ user: userId });

        const payload = {
            user: userId,
            name: user.name,
            role: role || 'Backend',
            secondaryRole: secondaryRole || '',
            level: level || 'Intermediate',
            availability: Array.isArray(availability) ? availability : [],
            interests: Array.isArray(interests) ? interests : [],
            lookingFor: lookingFor || 'Teammates',
            bio: (bio || '').slice(0, 140),
            active: card?.active || 'actively_looking'
        };

        if (card) {
            card = await TeamFinder.findOneAndUpdate(
                { user: userId },
                payload,
                { new: true }
            );
        } else {
            card = await TeamFinder.create(payload);
        }

        res.status(200).json({ success: true, data: card });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get my Team Finder card
// @route   GET /api/team-finder/me
// @access  Private
exports.getMyCard = async (req, res) => {
    try {
        const card = await TeamFinder.findOne({ user: req.user.id });
        if (!card) return res.status(404).json({ success: false, message: 'No card found' });
        res.status(200).json({ success: true, data: card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update active status
// @route   PATCH /api/team-finder/active
// @access  Private
exports.updateActive = async (req, res) => {
    try {
        const { active } = req.body;
        const valid = ['actively_looking', 'busy', 'not_looking'];
        if (!valid.includes(active)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const card = await TeamFinder.findOneAndUpdate(
            { user: req.user.id },
            { active, lastActiveAt: Date.now() },
            { new: true }
        );

        if (!card) return res.status(404).json({ success: false, message: 'No card found' });
        res.status(200).json({ success: true, data: card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get matches (ranked by score)
// @route   GET /api/team-finder/matches
// @access  Private
exports.getMatches = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId, q, role, interests, availability } = req.query;

        const myCard = await TeamFinder.findOne({ user: userId });
        if (!myCard) {
            return res.status(404).json({
                success: false,
                message: 'Create your Team Finder card first'
            });
        }

        if (myCard.active === 'not_looking') {
            return res.status(200).json({ success: true, data: [], count: 0 });
        }

        const query = {
            user: { $ne: userId },
            active: 'actively_looking'
        };

        const andConditions = [];
        if (q && q.trim()) {
            const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            andConditions.push({ $or: [{ name: regex }, { bio: regex }] });
        }
        if (role && role.trim()) {
            andConditions.push({
                $or: [
                    { role: role.trim() },
                    { secondaryRole: role.trim() }
                ]
            });
        }
        if (interests) {
            const interestList = interests.split(',').map(s => s.trim()).filter(Boolean);
            if (interestList.length > 0) {
                andConditions.push({ interests: { $in: interestList } });
            }
        }
        if (availability) {
            const availList = availability.split(',').map(s => s.trim()).filter(Boolean);
            if (availList.length > 0) {
                andConditions.push({ availability: { $in: availList } });
            }
        }
        if (andConditions.length > 0) {
            query.$and = andConditions;
        }

        const otherCards = await TeamFinder.find(query)
            .populate('user', 'name email avatar')
            .lean();

        const matches = otherCards.map(card => {
            const score = computeMatchScore(myCard, card);
            return { ...card, matchScore: score };
        }).filter(m => m.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        // Check connect request status for each match
        const matchUserIds = matches.map(m => m.user._id);
        const requests = await ConnectRequest.find({
            $or: [
                { from: userId, to: { $in: matchUserIds } },
                { from: { $in: matchUserIds }, to: userId }
            ]
        }).lean();

        const requestsByTo = {};
        requests.forEach(r => {
            const key = r.from.toString() === userId ? r.to.toString() : r.from.toString();
            requestsByTo[key] = {
                status: r.status,
                fromMe: r.from.toString() === userId,
                requestId: r._id.toString()
            };
        });

        const matchesWithStatus = matches.map(m => ({
            ...m,
            connectStatus: requestsByTo[m.user._id.toString()] || null
        }));

        res.status(200).json({
            success: true,
            data: matchesWithStatus,
            count: matchesWithStatus.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send connect request
// @route   POST /api/team-finder/connect
// @access  Private
exports.sendConnect = async (req, res) => {
    try {
        const from = req.user.id;
        const { to, eventId, message } = req.body;

        if (!to || to === from) {
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }

        const existing = await ConnectRequest.findOne({ from, to });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: existing.status === 'pending'
                    ? 'Request already sent'
                    : `Request was ${existing.status}`
            });
        }

        const request = await ConnectRequest.create({
            from,
            to,
            event: eventId || null,
            message: (message || '').slice(0, 200)
        });

        const populated = await ConnectRequest.findById(request._id)
            .populate('from', 'name email')
            .populate('to', 'name email')
            .lean();

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Respond to connect request (accept/reject)
// @route   PUT /api/team-finder/connect/:id
// @access  Private
exports.respondConnect = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const request = await ConnectRequest.findById(id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.to.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Already responded' });
        }

        request.status = status;
        request.respondedAt = Date.now();
        await request.save();

        const populated = await ConnectRequest.findById(request._id)
            .populate('from', 'name email')
            .populate('to', 'name email')
            .lean();

        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my connect requests (sent + received)
// @route   GET /api/team-finder/requests
// @access  Private
exports.getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await ConnectRequest.find({
            $or: [{ from: userId }, { to: userId }]
        })
            .populate('from', 'name email avatar')
            .populate('to', 'name email avatar')
            .populate('event', 'title')
            .sort({ createdAt: -1 })
            .lean();

        const formatted = requests.map(r => ({
            ...r,
            direction: r.from._id.toString() === userId ? 'sent' : 'received'
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get hackmates (connected users)
// @route   GET /api/team-finder/hackmates
// @access  Private
exports.getHackmates = async (req, res) => {
    try {
        const userId = req.user.id;

        const connections = await ConnectRequest.find({
            $or: [{ from: userId }, { to: userId }],
            status: 'accepted'
        })
            .populate('from', 'name email avatar')
            .populate('to', 'name email avatar')
            .lean();

        const hackmateUserIds = connections.map(c => {
            const fromId = c.from?._id?.toString?.() || c.from?.toString?.();
            const toId = c.to?._id?.toString?.() || c.to?.toString?.();
            return fromId === userId ? toId : fromId;
        }).filter(Boolean);

        const teamFinderCards = await TeamFinder.find({ user: { $in: hackmateUserIds } }).lean();
        const cardByUser = {};
        teamFinderCards.forEach(c => {
            cardByUser[c.user?.toString?.()] = c;
        });

        const hackmates = hackmateUserIds.map(otherId => {
            const conn = connections.find(c => {
                const fromId = String(c.from?._id || c.from);
                const toId = String(c.to?._id || c.to);
                return (fromId === userId && toId === otherId) || (toId === userId && fromId === otherId);
            });
            const otherUser = conn && (String(conn.from?._id || conn.from) === userId) ? conn.to : conn?.from;
            const card = cardByUser[otherId];
            return {
                user: otherUser,
                teamFinderCard: card || null
            };
        });

        res.status(200).json({ success: true, data: hackmates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get active count (for urgency boost)
// @route   GET /api/team-finder/active-count
// @access  Public
exports.getActiveCount = async (req, res) => {
    try {
        const count = await TeamFinder.countDocuments({ active: 'actively_looking' });
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
