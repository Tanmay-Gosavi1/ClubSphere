const mongoose = require('mongoose')

const membershipRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    requestMessage: {
        type: String,
        trim: true,
        maxlength: 500
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: 200
    },
    processedAt: {
        type: Date
    }
}, {
    timestamps: true
})

// Compound index to prevent duplicate requests
membershipRequestSchema.index({ user: 1, club: 1 }, { unique: true })

module.exports = mongoose.model("MembershipRequest", membershipRequestSchema)