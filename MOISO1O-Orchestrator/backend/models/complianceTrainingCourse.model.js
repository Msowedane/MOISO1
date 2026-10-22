const mongoose = require('mongoose');

const complianceTrainingCourseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 4000, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

complianceTrainingCourseSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.models.ComplianceTrainingCourse
    || mongoose.model('ComplianceTrainingCourse', complianceTrainingCourseSchema);
