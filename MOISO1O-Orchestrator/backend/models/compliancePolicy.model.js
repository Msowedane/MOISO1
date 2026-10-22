const mongoose = require('mongoose');

const compliancePolicySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 180 },
    category: { type: String, trim: true, maxlength: 80, default: 'General' },
    version: { type: String, required: true, trim: true, maxlength: 40 },
    content: { type: String, required: true, trim: true, maxlength: 50000 },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        index: true,
    },
    publishedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

compliancePolicySchema.index({ title: 1, version: 1 }, { unique: true });

module.exports = mongoose.models.CompliancePolicy
    || mongoose.model('CompliancePolicy', compliancePolicySchema);
