const mongoose = require('mongoose');

const compliancePolicyAcknowledgementSchema = new mongoose.Schema({
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompliancePolicy', required: true },
    policyVersion: { type: String, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    acknowledgedAt: { type: Date, default: Date.now },
}, { timestamps: true });

compliancePolicyAcknowledgementSchema.index({ policyId: 1, adminId: 1 }, { unique: true });

module.exports = mongoose.models.CompliancePolicyAcknowledgement
    || mongoose.model('CompliancePolicyAcknowledgement', compliancePolicyAcknowledgementSchema);
