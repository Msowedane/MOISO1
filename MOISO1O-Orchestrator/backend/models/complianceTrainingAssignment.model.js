const mongoose = require('mongoose');

const complianceTrainingAssignmentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ComplianceTrainingCourse',
        required: true,
        index: true,
    },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    staffEmail: { type: String, required: true, lowercase: true, trim: true },
    status: {
        type: String,
        enum: ['assigned', 'in_progress', 'completed'],
        default: 'assigned',
        index: true,
    },
    dueAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

complianceTrainingAssignmentSchema.index({ courseId: 1, adminId: 1 }, { unique: true });

module.exports = mongoose.models.ComplianceTrainingAssignment
    || mongoose.model('ComplianceTrainingAssignment', complianceTrainingAssignmentSchema);
