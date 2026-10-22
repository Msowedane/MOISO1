const mongoose = require('mongoose');

const eddCaseSchema = new mongoose.Schema({
    caseReference: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    customerId: { type: String, trim: true, default: '' },
    customerName: { type: String, required: true, trim: true, maxlength: 160 },
    trigger: {
        type: String,
        enum: ['Manual', 'Soft limit', 'Compliance review'],
        default: 'Manual',
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
    },
    status: {
        type: String,
        enum: ['Open', 'Under Review', 'Info Requested', 'Escalated', 'Approved', 'Rejected', 'Closed', 'Expired'],
        default: 'Open',
        index: true,
    },
    notes: { type: String, trim: true, maxlength: 4000, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    lastReviewedAt: { type: Date, default: null },
}, { timestamps: true });

eddCaseSchema.index({ createdAt: -1 });
eddCaseSchema.index({ caseReference: 'text', customerName: 'text', customerId: 'text' });

module.exports = mongoose.models.EddCase || mongoose.model('EddCase', eddCaseSchema);
