const { randomBytes } = require('crypto');
const mongoose = require('mongoose');
const EddCase = require('../models/eddCase.model');
const TrainingCourse = require('../models/complianceTrainingCourse.model');
const TrainingAssignment = require('../models/complianceTrainingAssignment.model');
const Policy = require('../models/compliancePolicy.model');
const PolicyAcknowledgement = require('../models/compliancePolicyAcknowledgement.model');
const Admin = require('../models/adminModel');
const { getComplianceOverview } = require('../services/complianceOverviewServices');

const CASE_STATUSES = ['Open', 'Under Review', 'Info Requested', 'Escalated', 'Approved', 'Rejected', 'Closed', 'Expired'];
const TRAINING_STATUSES = ['assigned', 'in_progress', 'completed'];
const POLICY_STATUSES = ['draft', 'published', 'archived'];

function sendError(res, error, message) {
    if (error?.name === 'ValidationError' || error?.name === 'CastError') {
        return res.status(400).json({ status: 'error', message: error.message });
    }
    if (error?.code === 11000) {
        return res.status(409).json({ status: 'error', message: 'A record with these details already exists.' });
    }
    console.error(message, error);
    return res.status(500).json({ status: 'error', message });
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getOverview(req, res) {
    try {
        const data = await getComplianceOverview();
        return res.status(200).json({
            status: 'success',
            message: 'Compliance overview loaded successfully.',
            data,
        });
    } catch (error) {
        return sendError(res, error, 'Unable to load compliance overview.');
    }
}

async function listEddCases(req, res) {
    try {
        const { status, search } = req.query;
        if (status && status !== 'All statuses' && !CASE_STATUSES.includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Unsupported EDD case status.' });
        }
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 100, 1), 200);
        const filter = {};
        if (status && status !== 'All statuses') filter.status = status;
        if (typeof search === 'string' && search.trim()) {
            const query = new RegExp(escapeRegExp(search.trim()), 'i');
            filter.$or = [{ caseReference: query }, { customerName: query }, { customerId: query }];
        }
        const [data, total] = await Promise.all([
            EddCase.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            EddCase.countDocuments(filter),
        ]);
        return res.status(200).json({
            status: 'success',
            message: 'EDD cases loaded successfully.',
            data: data.map((item) => ({ ...item, id: item._id.toString() })),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return sendError(res, error, 'Unable to load EDD cases.');
    }
}

async function createEddCase(req, res) {
    try {
        const { customerName, customerId = '', caseReference, trigger = 'Manual', riskLevel = 'Medium', notes = '' } = req.body || {};
        if (typeof customerName !== 'string' || !customerName.trim()) {
            return res.status(400).json({ status: 'error', message: 'Customer name is required.' });
        }
        const reference = typeof caseReference === 'string' && caseReference.trim()
            ? caseReference.trim()
            : `EDD-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`;
        const record = await EddCase.create({
            caseReference: reference,
            customerName,
            customerId,
            trigger,
            riskLevel,
            notes,
            createdBy: req.admin._id,
            lastUpdatedBy: req.admin._id,
        });
        return res.status(201).json({
            status: 'success',
            message: 'EDD case created successfully.',
            data: { ...record.toObject(), id: record._id.toString() },
        });
    } catch (error) {
        return sendError(res, error, 'Unable to create EDD case.');
    }
}

async function updateEddCase(req, res) {
    try {
        const { status, notes, riskLevel } = req.body || {};
        const updates = {};
        if (status !== undefined) {
            if (!CASE_STATUSES.includes(status)) {
                return res.status(400).json({ status: 'error', message: 'Unsupported EDD case status.' });
            }
            updates.status = status;
            if (['Under Review', 'Approved', 'Rejected', 'Closed'].includes(status)) {
                updates.lastReviewedAt = new Date();
            }
        }
        if (notes !== undefined) updates.notes = notes;
        if (riskLevel !== undefined) updates.riskLevel = riskLevel;
        if (!Object.keys(updates).length) {
            return res.status(400).json({ status: 'error', message: 'Provide a status, risk level, or notes update.' });
        }
        updates.lastUpdatedBy = req.admin._id;
        const record = await EddCase.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        }).lean();
        if (!record) return res.status(404).json({ status: 'error', message: 'EDD case not found.' });
        return res.status(200).json({
            status: 'success',
            message: 'EDD case updated successfully.',
            data: { ...record, id: record._id.toString() },
        });
    } catch (error) {
        return sendError(res, error, 'Unable to update EDD case.');
    }
}

async function listTraining(req, res) {
    try {
        const [courses, assignments, staff] = await Promise.all([
            TrainingCourse.find().sort({ createdAt: -1 }).lean(),
            TrainingAssignment.find().populate('courseId', 'title description')
                .populate('adminId', 'email role').sort({ createdAt: -1 }).lean(),
            Admin.find({ isActive: { $ne: false } }).select('_id email role').sort({ email: 1 }).lean(),
        ]);
        const assignmentsWithStatus = assignments.map((assignment) => {
            const overdue = assignment.status !== 'completed'
                && assignment.dueAt
                && new Date(assignment.dueAt).getTime() < Date.now();
            return {
                ...assignment,
                id: assignment._id.toString(),
                course: assignment.courseId,
                staff: assignment.adminId,
                effectiveStatus: overdue ? 'overdue' : assignment.status,
            };
        });
        return res.status(200).json({
            status: 'success',
            message: 'Compliance training loaded successfully.',
            data: {
                courses: courses.map((course) => ({ ...course, id: course._id.toString() })),
                assignments: assignmentsWithStatus,
                staff: staff.map((admin) => ({ id: admin._id.toString(), email: admin.email, role: admin.role })),
            },
        });
    } catch (error) {
        return sendError(res, error, 'Unable to load compliance training.');
    }
}

async function createTrainingCourse(req, res) {
    try {
        const { title, description = '' } = req.body || {};
        if (typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({ status: 'error', message: 'Course title is required.' });
        }
        const course = await TrainingCourse.create({ title: title.trim(), description, createdBy: req.admin._id });
        return res.status(201).json({
            status: 'success',
            message: 'Training course created successfully.',
            data: { ...course.toObject(), id: course._id.toString() },
        });
    } catch (error) {
        return sendError(res, error, 'Unable to create training course.');
    }
}

async function createTrainingAssignment(req, res) {
    try {
        const { courseId, adminId, dueAt } = req.body || {};
        if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(adminId)) {
            return res.status(400).json({ status: 'error', message: 'A valid course and staff member are required.' });
        }
        const dueDate = dueAt ? new Date(dueAt) : null;
        if (dueAt && Number.isNaN(dueDate.getTime())) {
            return res.status(400).json({ status: 'error', message: 'Due date is invalid.' });
        }
        const [course, staff] = await Promise.all([
            TrainingCourse.findById(courseId).select('_id'),
            Admin.findOne({ _id: adminId, isActive: { $ne: false } }).select('_id email'),
        ]);
        if (!course || !staff) {
            return res.status(404).json({ status: 'error', message: 'Course or active staff member not found.' });
        }
        const assignment = await TrainingAssignment.create({
            courseId: course._id,
            adminId: staff._id,
            staffEmail: staff.email,
            dueAt: dueDate,
            assignedBy: req.admin._id,
        });
        return res.status(201).json({
            status: 'success',
            message: 'Training assigned successfully.',
            data: { ...assignment.toObject(), id: assignment._id.toString() },
        });
    } catch (error) {
        return sendError(res, error, 'Unable to assign training.');
    }
}

async function updateTrainingAssignment(req, res) {
    try {
        const { status } = req.body || {};
        if (!TRAINING_STATUSES.includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Unsupported training status.' });
        }
        const assignment = await TrainingAssignment.findByIdAndUpdate(req.params.id, {
            status,
            completedAt: status === 'completed' ? new Date() : null,
        }, { new: true, runValidators: true }).lean();
        if (!assignment) {
            return res.status(404).json({ status: 'error', message: 'Training assignment not found.' });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Training status updated successfully.',
            data: { ...assignment, id: assignment._id.toString() },
        });
    } catch (error) {
        return sendError(res, error, 'Unable to update training status.');
    }
}

async function listPolicies(req, res) {
    try {
        const policies = await Policy.find().sort({ updatedAt: -1 }).lean();
        const policyIds = policies.map((policy) => policy._id);
        const activeAdmins = await Admin.find({ isActive: { $ne: false } }).select('_id').lean();
        const activeAdminIds = activeAdmins.map((admin) => admin._id);
        const [acknowledgementCounts, myAcknowledgements] = policyIds.length
            ? await Promise.all([
                PolicyAcknowledgement.aggregate([
                    { $match: { policyId: { $in: policyIds }, adminId: { $in: activeAdminIds } } },
                    { $group: { _id: '$policyId', count: { $sum: 1 } } },
                ]),
                PolicyAcknowledgement.find({
                    policyId: { $in: policyIds },
                    adminId: req.admin._id,
                }).select('policyId').lean(),
            ])
            : [[], []];
        const countByPolicyId = new Map(acknowledgementCounts.map((item) => [item._id.toString(), item.count]));
        const acknowledgedIds = new Set(myAcknowledgements.map((item) => item.policyId.toString()));
        return res.status(200).json({
            status: 'success',
            message: 'Compliance policies loaded successfully.',
            data: policies.map((policy) => ({
                ...policy,
                id: policy._id.toString(),
                acknowledgementCount: countByPolicyId.get(policy._id.toString()) || 0,
                activeStaffCount: activeAdminIds.length,
                acknowledgedByMe: acknowledgedIds.has(policy._id.toString()),
            })),
        });
    } catch (error) {
        return sendError(res, error, 'Unable to load compliance policies.');
    }
}

async function createPolicy(req, res) {
    try {
        const { title, category = 'General', version, content } = req.body || {};
        if (typeof title !== 'string' || !title.trim()
            || typeof version !== 'string' || !version.trim()
            || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Policy title, version, and content are required.',
            });
        }
        const policy = await Policy.create({
            title,
            category,
            version,
            content,
            status: 'draft',
            createdBy: req.admin._id,
        });
        return res.status(201).json({
            status: 'success',
            message: 'Policy draft created successfully.',
            data: { ...policy.toObject(), id: policy._id.toString() },
        });
    } catch (error) {
        return sendError(res, error, 'Unable to create policy.');
    }
}

async function updatePolicyStatus(req, res) {
    try {
        const { status } = req.body || {};
        if (!POLICY_STATUSES.includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Unsupported policy status.' });
        }
        const policy = await Policy.findById(req.params.id);
        if (!policy) return res.status(404).json({ status: 'error', message: 'Policy not found.' });
        const transitions = { draft: ['published', 'archived'], published: ['archived'], archived: [] };
        if (!transitions[policy.status].includes(status)) {
            return res.status(409).json({
                status: 'error',
                message: `A ${policy.status} policy cannot be changed to ${status}.`,
            });
        }
        policy.status = status;
        if (status === 'published') policy.publishedAt = new Date();
        await policy.save();
        return res.status(200).json({
            status: 'success',
            message: `Policy ${status} successfully.`,
            data: { ...policy.toObject(), id: policy._id.toString() },
        });
    } catch (error) {
        return sendError(res, error, 'Unable to update policy status.');
    }
}

async function acknowledgePolicy(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ status: 'error', message: 'Policy id is invalid.' });
        }
        const policy = await Policy.findOne({ _id: req.params.id, status: 'published' });
        if (!policy) {
            return res.status(404).json({ status: 'error', message: 'Published policy not found.' });
        }
        const acknowledgement = await PolicyAcknowledgement.findOneAndUpdate(
            { policyId: policy._id, adminId: req.admin._id },
            { $setOnInsert: { policyVersion: policy.version, acknowledgedAt: new Date() } },
            { new: true, upsert: true, runValidators: true },
        );
        return res.status(200).json({
            status: 'success',
            message: 'Policy acknowledgement recorded.',
            data: acknowledgement,
        });
    } catch (error) {
        return sendError(res, error, 'Unable to record policy acknowledgement.');
    }
}

module.exports = {
    getOverview,
    listEddCases,
    createEddCase,
    updateEddCase,
    listTraining,
    createTrainingCourse,
    createTrainingAssignment,
    updateTrainingAssignment,
    listPolicies,
    createPolicy,
    updatePolicyStatus,
    acknowledgePolicy,
};
