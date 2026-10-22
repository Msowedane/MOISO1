const mongoose = require('mongoose');
const { directRatesModel, directFeesModel } = require('../models/overviewModel');

const RATE_FIELDS = [
    'rateCode',
    'rateName',
    'productType',
    'value',
    'unit',
    'effectiveFrom',
    'effectiveTo',
    'status',
];

const FEE_FIELDS = [
    'feeCode',
    'feeName',
    'servicesType',
    'feeType',
    'amount',
    'currency',
    'minTransactionAmount',
    'maxTransactionAmount',
    'effectiveFrom',
    'effectiveTo',
    'status',
];

const VALID_STATUSES = ['Draft', 'Pending Approval', 'Active', 'Inactive'];

const validateEffectivePeriod = record => {
    if (record.effectiveFrom && record.effectiveTo && record.effectiveFrom > record.effectiveTo) {
        return 'effectiveTo must be on or after effectiveFrom';
    }
    return null;
};

const isValidDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const normalizePayload = (body, fields, { partial = false, numericFields = [] } = {}) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'A JSON object is required' };
    }

    const payload = {};
    for (const field of fields) {
        const value = body[field];
        if (value === undefined) {
            if (!partial) {
                return { error: `${field} is required` };
            }
            continue;
        }

        if (numericFields.includes(field)) {
            if (
                (typeof value !== 'number' && typeof value !== 'string') ||
                (typeof value === 'string' && value.trim() === '')
            ) {
                return { error: `${field} must be a non-negative number` };
            }
            const number = typeof value === 'number' ? value : Number(value);
            if (!Number.isFinite(number) || number < 0) {
                return { error: `${field} must be a non-negative number` };
            }
            payload[field] = number;
        } else if (typeof value !== 'string' || !value.trim()) {
            return { error: `${field} must be a non-empty string` };
        } else {
            payload[field] = value.trim();
        }
    }

    if (payload.status !== undefined && !VALID_STATUSES.includes(payload.status)) {
        return { error: `status must be one of: ${VALID_STATUSES.join(', ')}` };
    }

    for (const field of ['effectiveFrom', 'effectiveTo']) {
        const date = payload[field] ?? (partial ? undefined : body[field]);
        if (date !== undefined && !isValidDate(date)) {
            return { error: `${field} must be a valid date in YYYY-MM-DD format` };
        }
    }

    const effectiveFrom = payload.effectiveFrom ?? (partial ? undefined : body.effectiveFrom);
    const effectiveTo = payload.effectiveTo ?? (partial ? undefined : body.effectiveTo);
    if (effectiveFrom && effectiveTo && effectiveFrom > effectiveTo) {
        return { error: 'effectiveTo must be on or after effectiveFrom' };
    }

    if (payload.currency !== undefined) {
        payload.currency = payload.currency.toUpperCase();
    }

    return { payload };
};

const createHandlers = ({
    model,
    fields,
    numericFields = [],
    label,
    validateRecord = validateEffectivePeriod,
}) => ({
    list: async (req, res) => {
        try {
            const entries = await model.find().sort({ createdAt: -1 }).lean();
            return res.status(200).json({ success: true, data: entries });
        } catch (error) {
            console.error(`List ${label} error:`, error);
            return res.status(500).json({ success: false, message: `Failed to fetch ${label}` });
        }
    },
    create: async (req, res) => {
        try {
            const { payload, error } = normalizePayload(req.body, fields, { numericFields });
            if (error) {
                return res.status(400).json({ success: false, message: error });
            }
            if (payload.status === 'Active') {
                return res.status(400).json({
                    success: false,
                    message: 'Records must be submitted for approval before they can become active',
                });
            }
            const recordError = validateRecord(payload);
            if (recordError) {
                return res.status(400).json({ success: false, message: recordError });
            }

            const entry = await model.create(payload);
            return res.status(201).json({
                success: true,
                message: `${label} created`,
                data: entry,
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: error.message });
            }
            console.error(`Create ${label} error:`, error);
            return res.status(500).json({ success: false, message: `Failed to create ${label}` });
        }
    },
    update: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ success: false, message: `A valid ${label} ID is required` });
            }

            const { payload, error } = normalizePayload(req.body, fields, { partial: true, numericFields });
            if (error) {
                return res.status(400).json({ success: false, message: error });
            }
            if (Object.keys(payload).length === 0) {
                return res.status(400).json({ success: false, message: 'At least one field is required to update' });
            }

            const currentEntry = await model.findById(req.params.id).lean();
            if (!currentEntry) {
                return res.status(404).json({ success: false, message: `${label} not found` });
            }
            if (payload.status === 'Active') {
                return res.status(400).json({
                    success: false,
                    message: 'Use the approval queue to activate a record',
                });
            }
            if (currentEntry.status === 'Pending Approval' &&
                payload.status !== undefined &&
                payload.status !== 'Pending Approval') {
                return res.status(400).json({
                    success: false,
                    message: 'Pending approval records can only change status through the approval queue',
                });
            }
            const recordError = validateRecord({ ...currentEntry, ...payload });
            if (recordError) {
                return res.status(400).json({ success: false, message: recordError });
            }

            const entry = await model.findOneAndUpdate(
                { _id: req.params.id, status: currentEntry.status },
                { $set: payload },
                { new: true, runValidators: true },
            );
            if (!entry) {
                const exists = await model.exists({ _id: req.params.id });
                return res.status(exists ? 409 : 404).json({
                    success: false,
                    message: exists ? 'Record status changed; reload before updating' : `${label} not found`,
                });
            }

            return res.status(200).json({
                success: true,
                message: `${label} updated`,
                data: entry,
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: error.message });
            }
            console.error(`Update ${label} error:`, error);
            return res.status(500).json({ success: false, message: `Failed to update ${label}` });
        }
    },
    remove: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ success: false, message: `A valid ${label} ID is required` });
            }

            const currentEntry = await model.findById(req.params.id).lean();
            if (!currentEntry) {
                return res.status(404).json({ success: false, message: `${label} not found` });
            }
            if (currentEntry.status === 'Pending Approval') {
                return res.status(400).json({
                    success: false,
                    message: 'Pending approval records cannot be deleted before review',
                });
            }
            const entry = await model.findOneAndDelete({
                _id: req.params.id,
                status: { $ne: 'Pending Approval' },
            });
            if (!entry) {
                const exists = await model.exists({ _id: req.params.id });
                return res.status(exists ? 400 : 404).json({
                    success: false,
                    message: exists
                        ? 'Pending approval records cannot be deleted before review'
                        : `${label} not found`,
                });
            }
            return res.status(200).json({ success: true, message: `${label} deleted`, data: entry });
        } catch (error) {
            console.error(`Delete ${label} error:`, error);
            return res.status(500).json({ success: false, message: `Failed to delete ${label}` });
        }
    },
});

const directRates = createHandlers({
    model: directRatesModel,
    fields: RATE_FIELDS,
    numericFields: ['value'],
    label: 'Direct rate',
});

const directFees = createHandlers({
    model: directFeesModel,
    fields: FEE_FIELDS,
    numericFields: ['amount', 'minTransactionAmount', 'maxTransactionAmount'],
    label: 'Direct fee',
    validateRecord: fee => validateEffectivePeriod(fee) ||
        (fee.maxTransactionAmount < fee.minTransactionAmount
            ? 'maxTransactionAmount must be greater than or equal to minTransactionAmount'
            : null),
});

module.exports = { directRates, directFees, normalizePayload };
