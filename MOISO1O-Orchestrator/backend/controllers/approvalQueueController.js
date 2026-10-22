const mongoose = require('mongoose');
const { directRatesModel, directFeesModel } = require('../models/overviewModel');
const SystemExchangeRate = require('../models/systemExchangeRateModel');

const records = {
    directRates: { model: directRatesModel, label: 'Direct rate' },
    directFees: { model: directFeesModel, label: 'Direct fee' },
};

const listPending = async (_req, res) => {
    try {
        const [rates, fees, systemRates] = await Promise.all([
            directRatesModel.find({ status: 'Pending Approval' }).sort({ createdAt: -1 }).lean(),
            directFeesModel.find({ status: 'Pending Approval' }).sort({ createdAt: -1 }).lean(),
            SystemExchangeRate.find({
                $or: [
                    { status: 'Pending Approval' },
                    { pendingChange: { $exists: true } },
                ],
            }).sort({ updatedAt: -1 }).lean(),
        ]);
        return res.status(200).json({
            success: true,
            data: [
                ...rates.map(record => ({ ...record, type: 'directRates' })),
                ...fees.map(record => ({ ...record, type: 'directFees' })),
                ...systemRates.map(record => ({
                    ...record,
                    type: 'systemRates',
                    previousStatus: record.status || 'Active',
                    status: 'Pending Approval',
                    requestedChange: record.pendingChange || {
                        sourceCurrency: record.sourceCurrency,
                        destinationCurrency: record.destinationCurrency,
                        rate: record.rate,
                        status: 'Active',
                    },
                })),
            ],
        });
    } catch (error) {
        console.error('List approval queue error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch approval queue' });
    }
};

const decide = async (req, res) => {
    const { type, id } = req.params;
    const recordType = type === 'systemRates'
        ? { model: SystemExchangeRate, label: 'System exchange rate' }
        : records[type];
    if (!recordType) return res.status(400).json({ success: false, message: 'type must be directRates or directFees' });
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: `A valid ${recordType.label} ID is required` });
    }
    const action = req.body?.action;
    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ success: false, message: 'action must be approve or reject' });
    }
    try {
        if (type === 'systemRates') {
            const record = await SystemExchangeRate.findById(id);
            if (!record || (record.status !== 'Pending Approval' && !record.pendingChange)) {
                return res.status(record ? 409 : 404).json({
                    success: false,
                    message: record ? 'Only system rate changes pending approval can be reviewed' : 'System exchange rate not found',
                });
            }
            if (record.pendingChange) {
                if (action === 'approve') {
                    const change = record.pendingChange;
                    const pairConflict = await SystemExchangeRate.findOne({
                        sourceCurrency: change.sourceCurrency,
                        destinationCurrency: change.destinationCurrency,
                        _id: { $ne: record._id },
                        status: 'Active',
                    }).lean();
                    if (pairConflict && change.status === 'Active') {
                        return res.status(409).json({ success: false, message: 'Another active rate already exists for this currency pair' });
                    }
                    record.sourceCurrency = change.sourceCurrency;
                    record.destinationCurrency = change.destinationCurrency;
                    record.rate = change.rate;
                    record.status = change.status;
                }
                record.pendingChange = undefined;
            } else {
                record.status = action === 'approve' ? 'Active' : 'Draft';
            }
            await record.save();
            return res.status(200).json({
                success: true,
                message: `System exchange rate ${action === 'approve' ? 'approved' : 'rejected'}`,
                data: record,
            });
        }
        const record = await recordType.model.findOneAndUpdate(
            { _id: id, status: 'Pending Approval' },
            { $set: { status: action === 'approve' ? 'Active' : 'Draft' } },
            { new: true, runValidators: true },
        );
        if (!record) {
            const exists = await recordType.model.exists({ _id: id });
            return res.status(exists ? 409 : 404).json({
                success: false,
                message: exists ? 'Only records pending approval can be reviewed' : `${recordType.label} not found`,
            });
        }
        return res.status(200).json({
            success: true,
            message: `${recordType.label} ${action === 'approve' ? 'approved' : 'rejected'}`,
            data: record,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Another system rate already exists for this currency pair' });
        }
        console.error('Review approval queue record error:', error);
        return res.status(500).json({ success: false, message: 'Failed to review approval queue record' });
    }
};

module.exports = { listPending, decide };
