const IpWhitelist = require('../models/ipWhitelistModel');
const IpBypassToken = require('../models/IpBypassToken');

const normalizeIp = (ip) => {
    if (typeof ip !== 'string') {
        return '';
    }

    const normalizedIp = ip.trim().toLowerCase();
    return normalizedIp.startsWith('::ffff:')
        ? normalizedIp.substring(7)
        : normalizedIp;
};

const isLoopbackIp = (ip) => (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('127.')
);

const getClientIp = (req) => normalizeIp(
    req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress
);

const getAdminWhitelist = async () => {
    const databaseEntries = await IpWhitelist.find({
        isActive: true,
        'portals.admin': true,
    }).select('ipAddress').lean();

    if (databaseEntries.length > 0) {
        return databaseEntries
            .map(entry => normalizeIp(entry.ipAddress))
            .filter(Boolean);
    }

    return (process.env.SUPER_ADMIN_ALLOWED_IPS || '')
        .split(',')
        .map(normalizeIp)
        .filter(Boolean);
};

const checkAdminIpAccess = async (req, res, next) => {
    try {
        const clientIp = getClientIp(req);
        const bypassToken = req.get('x-ip-bypass-token');
        const isDevelopment = !process.env.NODE_ENV ||
            process.env.NODE_ENV === 'development';

        if (isDevelopment && isLoopbackIp(clientIp)) {
            req.adminClientIp = clientIp;
            req.adminIpLocalDevelopment = true;
            return next();
        }

        if (
            clientIp &&
            bypassToken &&
            await IpBypassToken.validateToken(bypassToken, clientIp, 'admin')
        ) {
            req.adminClientIp = clientIp;
            req.adminIpBypass = true;
            return next();
        }

        const whitelistedIps = await getAdminWhitelist();

        if (whitelistedIps.length === 0) {
            req.adminClientIp = clientIp;
            req.adminIpWhitelistUnconfigured = true;
            return next();
        }

        if (!clientIp || !whitelistedIps.includes(clientIp)) {
            return res.status(403).json({
                success: false,
                authorized: false,
                message: 'Your IP address is not authorized to access the admin portal',
                code: 'IP_NOT_WHITELISTED',
                showBypassOption: true,
                clientIp: process.env.NODE_ENV === 'development' ? clientIp : undefined,
            });
        }

        req.adminClientIp = clientIp;
        return next();
    } catch (error) {
        console.error('Admin IP whitelist check failed:', error);
        return res.status(500).json({
            success: false,
            authorized: false,
            message: 'Unable to verify admin IP access',
            code: 'IP_CHECK_FAILED',
        });
    }
};

module.exports = { checkAdminIpAccess, getClientIp };
