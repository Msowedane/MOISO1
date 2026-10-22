
const IpBlacklist = require('../models/IpBalcklistModel');
const net = require('net');

/**
 * Validate IPv4 and IPv6 addresses.
 */
const isValidIp = (ip) => {
    if (typeof ip !== 'string' || !ip.trim()) {
        return false;
    }
    const trimmedIp = ip.trim();
    return net.isIP(trimmedIp) !== 0;
};

/**
 * @route GET /
 * @access Private
 */
const list = async (req, res) => {
    try {
        const entries = await IpBlacklist.find({ active: true })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: entries
        });
    } catch (error) {
        console.error('List IP blacklist error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch IP blacklist',
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined
        });
    }
};

/**
 * @route POST /
 * @access Private
 */
const add = async (req, res) => {
    try {
        const { ip, reason, note } = req.body;
        if (typeof ip !== 'string' || !isValidIp(ip)) {
            return res.status(400).json({
                success: false,
                message: 'A valid IPv4 or IPv6 address is required'
            });
        }
        if (typeof reason !== 'string' || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'A reason is required'
            });
        }

        if (note !== undefined && note !== null && typeof note !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Note must be a string'
            });
        }

        const normalizedIp = ip.trim();
        const existing = await IpBlacklist.findOne({
            ip: normalizedIp,
            active: true
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This IP is already blacklisted'
            });
        }

        const adminName = req.admin?.name ||
            [
                req.admin?.firstName,
                req.admin?.lastName
            ].filter(Boolean).join(' ') ||
            req.admin?.email ||
            'Admin';

        const entry = await IpBlacklist.create({
            ip: normalizedIp,
            reason: reason.trim(),
            note: (note || '').trim(),
            addedByName: adminName,
            active: true
        });

        await IpBlacklist.invalidateCache();
        return res.status(201).json({
            success: true,
            message: `IP ${normalizedIp} blacklisted`,
            data: entry
        });
    } catch (error) {
        console.error('Add IP blacklist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add IP to blacklist',
            error:
                process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @route DELETE /:id
 * @access Private (manageSettings)
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await IpBlacklist.findById(id);
        if (!entry || !entry.active) {
            return res.status(404).json({
                success: false,
                message: 'Blacklist entry not found'
            });
        }
        entry.active = false;
        await entry.save();
        await IpBlacklist.invalidateCache();
        return res.status(200).json({
            success: true,
            message: `IP ${entry.ip} removed from blacklist`
        });
    } catch (error) {
        console.error('Remove IP blacklist error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove IP from blacklist',
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined
        });
    }
};

module.exports = {
    remove,
    list,
    add
};
