const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    connectRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConnectRequest',
        default: null
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Unique conversation per pair (sorted to avoid duplicates)
conversationSchema.index({ participants: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
