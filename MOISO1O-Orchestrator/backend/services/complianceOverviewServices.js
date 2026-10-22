const EddCase = require('../models/eddCase.model');
const TrainingAssignment = require('../models/complianceTrainingAssignment.model');
const Policy = require('../models/compliancePolicy.model');
const PolicyAcknowledgement = require('../models/compliancePolicyAcknowledgement.model');
const Admin = require('../models/adminModel');

async function getComplianceOverview() {
    const [
        totalAlerts,
        openAlerts,
        criticalAlerts,
        pendingReview,
        investigatingAlerts,
        resolvedAlerts,
        publishedPolicyIds,
        activeAdminIds,
    ] = await Promise.all([
        EddCase.countDocuments(),
        EddCase.countDocuments({ status: 'Open' }),
        EddCase.countDocuments({
            riskLevel: 'Critical',
            status: { $in: ['Open', 'Under Review', 'Info Requested', 'Escalated'] },
        }),
        EddCase.countDocuments({ status: 'Info Requested' }),
        EddCase.countDocuments({ status: { $in: ['Under Review', 'Escalated'] } }),
        EddCase.countDocuments({ status: { $in: ['Approved', 'Rejected', 'Closed', 'Expired'] } }),
        Policy.find({ status: 'published' }).select('_id').lean(),
        Admin.find({ isActive: { $ne: false } }).select('_id').lean(),
    ]);

    const policyIds = publishedPolicyIds.map((policy) => policy._id);
    const adminIds = activeAdminIds.map((admin) => admin._id);
    const [pendingTraining, acknowledgements] = await Promise.all([
        adminIds.length
            ? TrainingAssignment.countDocuments({
                adminId: { $in: adminIds },
                status: { $ne: 'completed' },
            })
            : 0,
        policyIds.length && adminIds.length
            ? PolicyAcknowledgement.countDocuments({
                policyId: { $in: policyIds },
                adminId: { $in: adminIds },
            })
            : 0,
    ]);

    return {
        totalAlerts,
        openAlerts,
        criticalAlerts,
        pendingReview,
        investigatingAlerts,
        resolvedAlerts,
        pendingTraining,
        pendingPolicyAcknowledgements: Math.max(
            policyIds.length * adminIds.length - acknowledgements,
            0,
        ),
        updatedAt: new Date().toISOString(),
    };
}

module.exports = { getComplianceOverview };
