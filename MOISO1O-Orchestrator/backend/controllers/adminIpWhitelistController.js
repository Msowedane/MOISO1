const net = require('net');
const mongoose = require('mongoose');
const IpWhitelist = require('../models/ipWhitelistModel');

const validateEntry = (body, { partial = false } = {}) => {
    const { ipAddress, description, portals, isActive } = body || {};

    if (!partial || ipAddress !== undefined) {
        if (typeof ipAddress !== 'string' || net.isIP(ipAddress.trim()) === 0) {
            return 'A valid IPv4 or IPv6 address is required';
        }
    }
    if (description !== undefined && typeof description !== 'string') {
        return 'Description must be a string';
    }
    if (
        portals !== undefined &&
        (!portals ||
            typeof portals !== 'object' ||
            Array.isArray(portals) ||
            (portals.admin !== undefined && typeof portals.admin !== 'boolean') ||
            (portals.user !== undefined && typeof portals.user !== 'boolean'))
    ) {
        return 'Portals must contain boolean admin and user values';
    }
    if (isActive !== undefined && typeof isActive !== 'boolean') {
        return 'isActive must be a boolean';
    }
    return null;
};

const list = async (req, res) => {
    try {
        const entries = await IpWhitelist.find().sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, data: entries });
    } catch (error) {
        console.error('List IP whitelist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch IP whitelist',
        });
    }
};

const add = async (req, res) => {
    try {
        const { ipAddress, description, portals, isActive = true } = req.body || {};
        const validationError = validateEntry({ ...req.body, isActive });
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const entry = await IpWhitelist.create({
            ipAddress: ipAddress.trim(),
            description: description?.trim(),
            portals: portals || { admin: true, user: true },
            isActive,
        });

        return res.status(201).json({
            success: true,
            message: 'IP address added to whitelist',
            data: entry,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'This IP address is already whitelisted',
            });
        }
        console.error('Add IP whitelist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add IP to whitelist',
        });
    }
};

const update = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'A valid whitelist entry ID is required',
            });
        }

        const validationError = validateEntry(req.body, { partial: true });
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const updates = {};
        const { ipAddress, description, portals, isActive } = req.body || {};
        if (ipAddress !== undefined) updates.ipAddress = ipAddress.trim();
        if (description !== undefined) updates.description = description.trim();
        if (portals !== undefined) updates.portals = portals;
        if (isActive !== undefined) updates.isActive = isActive;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one field is required to update',
            });
        }

        const entry = await IpWhitelist.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'IP whitelist entry not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'IP whitelist entry updated',
            data: entry,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'This IP address is already whitelisted',
            });
        }
        console.error('Update IP whitelist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update IP whitelist entry',
        });
    }
};

const remove = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'A valid whitelist entry ID is required',
            });
        }

        const entry = await IpWhitelist.findByIdAndDelete(req.params.id);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'IP whitelist entry not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'IP whitelist entry deleted',
        });
    } catch (error) {
        console.error('Delete IP whitelist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete IP whitelist entry',
        });
    }
};

module.exports = { list, add, update, remove };
