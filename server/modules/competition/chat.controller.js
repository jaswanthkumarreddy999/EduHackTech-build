const Conversation = require('./conversation.model');
const Message = require('./message.model');
const ConnectRequest = require('./connectRequest.model');

// Helper: mark all messages in conversation as read (for recipient)
const markConversationAsRead = async (conversationId, userId) => {
    await Message.updateMany(
        { conversation: conversationId, sender: { $ne: userId }, readAt: null },
        { $set: { readAt: new Date() } }
    );
};

// Helper: get or create conversation between two users (must be connected)
const getOrCreateConv = async (userId, otherUserId) => {
    const participants = [userId, otherUserId].sort();
    let conv = await Conversation.findOne({ participants });
    if (conv) return conv;

    const connectRequest = await ConnectRequest.findOne({
        $or: [
            { from: userId, to: otherUserId, status: 'accepted' },
            { from: otherUserId, to: userId, status: 'accepted' }
        ]
    });

    if (!connectRequest) {
        const err = new Error('You must be connected to chat');
        err.statusCode = 403;
        throw err;
    }

    conv = await Conversation.create({
        participants,
        connectRequest: connectRequest._id
    });
    return conv;
};

// @desc    Get or create conversation with another user
// @route   POST /api/chat/conversation
// @access  Private
exports.getOrCreateConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.body;

        if (!otherUserId || otherUserId === userId) {
            return res.status(400).json({ success: false, message: 'Invalid user' });
        }

        const conv = await getOrCreateConv(userId, otherUserId);
        const populated = await Conversation.findById(conv._id)
            .populate('participants', 'name email avatar')
            .lean();

        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({ success: false, message: error.message });
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversation/:id/messages
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const markRead = req.query.markRead !== 'false';

        const conv = await Conversation.findById(id);
        if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
        if (!conv.participants.some(p => p.toString() === userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (markRead) {
            await markConversationAsRead(id, userId);
        }

        const messages = await Message.find({ conversation: id })
            .populate('sender', 'name avatar')
            .sort({ createdAt: 1 })
            .lean();

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId, text } = req.body;

        if (!conversationId || !text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Conversation and text required' });
        }

        const conv = await Conversation.findById(conversationId);
        if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
        if (!conv.participants.some(p => p.toString() === userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: userId,
            text: text.trim().slice(0, 2000)
        });

        await Conversation.findByIdAndUpdate(conversationId, { lastMessageAt: Date.now() });

        const populated = await Message.findById(message._id)
            .populate('sender', 'name avatar')
            .lean();

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const myConvs = await Conversation.find({ participants: userId }).select('_id').lean();
        const convIds = myConvs.map(c => c._id);

        const unreadMessages = await Message.find({
            conversation: { $in: convIds },
            sender: { $ne: userId },
            readAt: null
        }).select('conversation sender').lean();

        const byConversation = {};
        const byUser = {};
        unreadMessages.forEach(m => {
            const convKey = m.conversation.toString();
            const senderId = m.sender?.toString?.() || String(m.sender);
            if (!byConversation[convKey]) byConversation[convKey] = { conversationId: convKey, otherUserId: senderId, count: 0 };
            byConversation[convKey].count += 1;
            byUser[senderId] = (byUser[senderId] || 0) + 1;
        });

        const count = unreadMessages.length;
        res.status(200).json({
            success: true,
            count,
            byConversation: Object.values(byConversation),
            byUser
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark conversation as read
// @route   PUT /api/chat/conversation/:id/read
// @access  Private
exports.markConversationRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const conv = await Conversation.findById(id);
        if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
        if (!conv.participants.some(p => p.toString() === userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await markConversationAsRead(id, userId);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user's conversations (for chat list)
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const convs = await Conversation.find({ participants: userId })
            .populate('participants', 'name email avatar')
            .sort({ lastMessageAt: -1 })
            .lean();

        const formatted = convs.map(c => {
            const other = c.participants.find(p => p && p._id && p._id.toString() !== userId);
            return { ...c, otherParticipant: other };
        });

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
