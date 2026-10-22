const mongoose = require('mongoose');
const SystemExchangeRate = require('../models/systemExchangeRateModel');

const normalizeRatePayload = (body, partial = false) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'A JSON object is required' };
    }

    const payload = {};
    for (const field of ['sourceCurrency', 'destinationCurrency']) {
        if (body[field] === undefined) {
            if (!partial) return { error: `${field} is required` };
            continue;
        }
        if (typeof body[field] !== 'string' || !/^[A-Za-z]{3}$/.test(body[field].trim())) {
            return { error: `${field} must be a three-letter currency code` };
        }
        payload[field] = body[field].trim().toUpperCase();
    }
    if (body.rate === undefined) {
        if (!partial) return { error: 'rate is required' };
    } else {
        const rate = typeof body.rate === 'number' ? body.rate : Number(body.rate);
        if ((typeof body.rate !== 'number' && typeof body.rate !== 'string') ||
            (typeof body.rate === 'string' && !body.rate.trim()) ||
            !Number.isFinite(rate) || rate <= 0) {
            return { error: 'rate must be a finite number greater than zero' };
        }
        payload.rate = rate;
    }

    return { payload };
};

const list = async (_req, res) => {
    try {
        const rates = await SystemExchangeRate.find().sort({ sourceCurrency: 1, destinationCurrency: 1 }).lean();
        return res.status(200).json({
            success: true,
            data: rates.map(rate => ({ ...rate, status: rate.status || 'Active' })),
        });
    } catch (error) {
        console.error('List system exchange rates error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch system exchange rates' });
    }
};

const create = async (req, res) => {
    const { payload, error } = normalizeRatePayload(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    try {
        const existing = await SystemExchangeRate.findOne({
            sourceCurrency: payload.sourceCurrency,
            destinationCurrency: payload.destinationCurrency,
        });
        if (existing) {
            if (existing.status === 'Pending Approval' || existing.pendingChange) {
                return res.status(409).json({ success: false, message: 'A change for this currency pair is already awaiting approval' });
            }
            existing.pendingChange = { ...payload, status: 'Active' };
            await existing.save();
            return res.status(202).json({ success: true, message: 'System exchange rate change submitted for approval', data: existing });
        }
        const rate = await SystemExchangeRate.create({ ...payload, status: 'Pending Approval' });
        return res.status(201).json({ success: true, message: 'System exchange rate submitted for approval', data: rate });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'A rate already exists for this currency pair' });
        }
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error('Create system exchange rate error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create system exchange rate' });
    }
};

const update = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'A valid system exchange rate ID is required' });
    }
    const { payload, error } = normalizeRatePayload(req.body, true);
    if (error) return res.status(400).json({ success: false, message: error });
    if (!Object.keys(payload).length) {
        return res.status(400).json({ success: false, message: 'At least one field is required to update' });
    }
    try {
        const currentRate = await SystemExchangeRate.findById(req.params.id);
        if (!currentRate) return res.status(404).json({ success: false, message: 'System exchange rate not found' });
        if (currentRate.status === 'Pending Approval' && !currentRate.pendingChange) {
            Object.assign(currentRate, payload);
        } else {
            if (currentRate.pendingChange) {
                return res.status(409).json({ success: false, message: 'This currency pair already has a change awaiting approval' });
            }
            const proposedPair = {
                sourceCurrency: payload.sourceCurrency || currentRate.sourceCurrency,
                destinationCurrency: payload.destinationCurrency || currentRate.destinationCurrency,
            };
            const conflictingRate = await SystemExchangeRate.findOne({
                ...proposedPair,
                _id: { $ne: currentRate._id },
            }).lean();
            if (conflictingRate) {
                return res.status(409).json({ success: false, message: 'A system rate already exists for the proposed currency pair' });
            }
            currentRate.pendingChange = {
                ...proposedPair,
                rate: payload.rate === undefined ? currentRate.rate : payload.rate,
                status: 'Active',
            };
        }
        await currentRate.save();
        return res.status(202).json({ success: true, message: 'System exchange rate change submitted for approval', data: currentRate });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'A rate already exists for this currency pair' });
        }
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error('Update system exchange rate error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update system exchange rate' });
    }
};

const remove = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'A valid system exchange rate ID is required' });
    }
    try {
        const rate = await SystemExchangeRate.findById(req.params.id);
        if (!rate) return res.status(404).json({ success: false, message: 'System exchange rate not found' });
        if (!rate.status || rate.status === 'Active') {
            if (rate.pendingChange) {
                return res.status(409).json({ success: false, message: 'This currency pair already has a change awaiting approval' });
            }
            rate.pendingChange = {
                sourceCurrency: rate.sourceCurrency,
                destinationCurrency: rate.destinationCurrency,
                rate: rate.rate,
                status: 'Inactive',
            };
            await rate.save();
            return res.status(202).json({ success: true, message: 'System rate deactivation submitted for approval', data: rate });
        }
        if (rate.status === 'Pending Approval' || rate.pendingChange) {
            return res.status(409).json({ success: false, message: 'A rate awaiting approval cannot be deleted' });
        }
        await rate.deleteOne();
        return res.status(200).json({ success: true, message: 'System exchange rate deleted', data: rate });
    } catch (error) {
        console.error('Delete system exchange rate error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete system exchange rate' });
    }
};

const findSystemExchangeRate = async (sourceCurrency, destinationCurrency) => (
    SystemExchangeRate.findOne({
        sourceCurrency: sourceCurrency.toUpperCase(),
        destinationCurrency: destinationCurrency.toUpperCase(),
        $or: [
            { status: 'Active' },
            { status: { $exists: false } },
        ],
    }).lean()
);

module.exports = {
    list,
    create,
    update,
    remove,
    normalizeRatePayload,
    findSystemExchangeRate,
};
