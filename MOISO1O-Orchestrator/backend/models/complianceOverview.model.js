const mongoose = require('mongoose');

const complianceOverviewSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    kyStatus: { type: String, required: true, trim: true },
    amlStatus: { type: String, required: true, trim: true },
    sanctionsStatus: { type: String, required: true, trim: true },
    pepStatus: { type: String, required: true, trim: true },
    riskLevel: { type: String, required: true, trim: true },
    overallStatus: { type: String, required: true, trim: true, index: true },
    lastReviewedAt: { type: Date, default: null },
    nextReviewAt: { type: Date, default: null },
    reviewedBy: { type: String, trim: true, default: '' },
    remarks: { type: String, trim: true, default: '' },
}, {
    timestamps: true,
});

module.exports = mongoose.models.complianceOverview
    || mongoose.model('complianceOverview', complianceOverviewSchema);
