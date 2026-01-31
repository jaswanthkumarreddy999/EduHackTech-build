const mongoose = require('mongoose');

const connectRequestSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        default: null
    },
    message: {
        type: String,
        maxlength: 200,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    respondedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

connectRequestSchema.index({ from: 1, to: 1 }, { unique: true });
connectRequestSchema.index({ to: 1, status: 1 });

module.exports = mongoose.model('ConnectRequest', connectRequestSchema);
