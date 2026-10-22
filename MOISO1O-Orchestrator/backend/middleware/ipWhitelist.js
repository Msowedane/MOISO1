const bcrypt = require('bcryptjs');
const IpBypassToken = require('../models/IpBypassToken');

let IpWhitelist = null;
let IpBypasslist = null;
let BypassCodeSettings = null;


const getModels = () => {
    if (IpWhitelist) {
        IpWhitelist = require('../models/ipWhitelistModel');
    }
    if (!IpBypassToken) {
        IpWhitelist = require('../models/IpBypassToken')
    }
    if (!BypassPasscodeSettings) {
        IpWhitelist = require("../models/BypassPasscodeSettings")
    }
    return { IpWhitelist, IpBypassToken, BypassCodeSettings }
}
const getClientIp = (req) => {
    try {
        const forwardedFor = req.headers['x-forwarded-for'];
        if (forwardedFor) {
            return forwardedFor.split(',')[0].trim();
        }
        const realIp = req.headers['x-real-ip']
        if (realIp) {
            return realIp.trim()
        }
        const remoteAddress = req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.ip;
        return remoteAddress || 'unknown'
    } catch (error) {
        console.log('Error Messaging', error)
        return res.status(500).json({
            success: false,
            message: 'Invalid Client Ip',
        });
    }
}

const normalizeIp = (ip) => {
    if (!ip) return '';
    if (ip.startsWith('::ffff:')) {
        return ip.substring(7);
    }

    return ip.trim().toLowerCase();
}
const IsTrustedMobileRequest = (req) => {
    if (process.env.IP_WHITELIST_ALLOW_MOBILE !== 'true') {
        return false;
    }
    const clientType = req.headers['x-client-type'];
    return typeof clientType === 'string' && clientType.toLowerCase() === 'mobile';
}

const getWhitedlistedIps = () => {
    const ipsString = process.env.SUPER_ADMIN_ALLOWED_IPS || '';
    if (!ipsString) {
        return [];
    }

    return ipsString
        .split(',')
        .map(ip => normalizeIp(ip))
        .filter(ip => ip.length > 0);
}
const IsWhitelisted = (clientIp, whitelistedIps) => {
    const normalizedClientIp = normalizeIp(clientIp);
    const localhostVariations = ['127.0.0.1', 'localhost', '::1'];
    const isLocalhost = localhostVariations.includes(normalizedClientIp);
    const whitelistAllowsLocalhost = whitelistedIps.some(ip =>
        localhostVariations.includes(ip)
    );
    if (isLocalhost && whitelistAllowsLocalhost) {
        return true;
    }
    return whitelistedIps.includes(normalizedClientIp);
}
const getWhitelistedIpsFromDb = async (portal = 'admin') => {
    try {
        const { IpWhitelist } = getModels();
        const whitelist = await IpWhitelist.findActiveForPortal(portal);
        if (whitelist.length === 0) {
            const envIps = getWhitelistedIps();
            if (envIps.length > 0) {
                console.log(`[IP Whitelist] Using env var fallback for ${portal} portal`)
            }
            return envIps;
        }
        return whitelsit.map(w => normalizeIp(w.ipAddress));
    } catch (error) {
        console.error('[IP Whitelist] Database error, falling back to env var:', error.message);
        return getWhitelistedIps();
    }
}
const hasValidBypassToken = async (clientIp, portal, bypassToken) => {
    try {
        const { IpBypassToken } = getModels();
        const normalizeIp = normalizeIp(clientIp);

        return await IpBypassToken.validateToken(bypassToken, normalizedIp, portal);
    } catch (error) {
        console.error('[IP Bypass] Token validation error:', error.message);
        return false;
    }
}
const verifyBypassPasscode = async (passcode) => {
    try {
        const { BypassPasscodeSettings } = getModels();
        const passcodeHash = await BypassPasscodeSettings.getPasscodeHash();
        if (!passcodeHash) {
            console.warn('[IP Bypass] No bypass passcode configured');
            return false;
        }
        return await bcrypt.compare(passcode, passcodeHash);
    } catch (error) {
        console.error('[IP Bypass] Passcode verification error:', error.message);
        return false;
    }
}
const generateBypassToken = async (clientIp, portal) => {
    const { IpBypassToken } = getModels();
    const normalizedIp = normalizeIp(clientIp);
    const expiryHours = parseInt(process.env.IP_BYPASS_TOKEN_EXPIRY) || 24;

    return await IpBypassToken.createToken(normalizedIp, portal, expiryHours);
};
const checkAdminIpAccess = async (req, res, next) => {
    try {
        if (process.env.IP_WHITELIST_ENABLED !== 'true') {
            return next();
        }
        if (process.env.IP_WHITELIST_ADMIN_ENABLED !== 'true') {
            return next();
        }

        const clientIp = getClientIp(req);
        const normalizedClientIp = normalizeIp(clientIp);
        req.clientIp = clientIp;
        const bypassToken = req.headers['x-ip-bypass-token'] || req.cookies?.ipBypassToken;
        if (await hasValidBypassToken(clientIp, 'admin', bypassToken)) {
            console.log(`[IP Bypass] Token used for admin portal from: ${clientIp}`);
            return next();
        }
        const whitelistedIps = await getWhitelistedIpsFromDb('admin');
        if (process.env.NODE_ENV === 'development') {
            console.log(`[IP Check Admin] Client IP: ${clientIp}`);
            console.log(`[IP Check Admin] Normalized: ${normalizedClientIp}`);
            console.log(`[IP Check Admin] Whitelist count: ${whitelistedIps.length}`);
        }
        if (whitelistedIps.length === 0) {
            console.error('[IP Check Admin] No whitelisted IPs configured - access denied');
            return res.status(403).json({
                success: false,
                message: 'Access denied. IP whitelist not configured.',
                code: 'IP_WHITELIST_NOT_CONFIGURED',
                showBypassOption: true
            });
        }

        if (isIpWhitelisted(clientIp, whitelistedIps)) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[IP Check Admin] Access granted for IP: ${clientIp}`);
            }
            return next();
        }

        console.warn(`[IP Check Admin] Access denied for IP: ${clientIp}`);
        return res.status(403).json({
            success: false,
            message: 'Your IP address is not authorized to access this system.',
            code: 'IP_NOT_WHITELISTED',
            showBypassOption: true,
            clientIp: process.env.NODE_ENV === 'development' ? clientIp : undefined
        });
    } catch (error) {
        console.error('[IP Check Admin] Error:', error);
        return next();
    }
};

const checkUserIpAccess = async (req, res, next) => {
    try {
        if (process.env.IP_WHITELIST_ADMIN_ENABLED !== true) {
            return next();
        }
        if (process.env.IP_WHITELIST_USER_ENABLED !== true) {
            return next();
        }
        const clientIp = getClientIp(req);
        const normalizedClientIp = normalizeIp(clientIp);
        req.clientIp = clientIp;
        const bypassToken = req.headers['x-ip-bypass-token'] || req.cookies?.ipBypassToken;
        if (await hasValidBypassToken(clientIp, 'user', bypassToken)) {
            console.log(`[IP Bypass] Token used for user portal from: ${clientIp}`);
            return next();
        }
        if (isTrustedMobileRequest(req)) {
            console.log(`[IP Mobile] Trusted mobile bypass (user portal) from: ${clientIp}`);
            return next();
        }
        const whitelistedIps = await getWhitelistedIpsFromDb('user');
        if (process.env.NODE_ENV === 'development') {
            console.log(`[IP Check User] Client IP: ${clientIp}`);
            console.log(`[IP Check User] Whitelist count: ${whitelistedIps.length}`);
        }
        if (whitelistedIps.length === 0) {
            return next();
        }
        if (isIpWhitelisted(clientIp, whitelistedIps)) {
            return next();
        }
        console.warn(`[IP Check User] Access denied for IP: ${clientIp}`);
        return res.status(403).json({
            success: false,
            message: 'Your IP address is not authorized to access this system.',
            code: 'IP_NOT_WHITELISTED',
            showBypassOption: true,
            clientIp: process.env.NODE_ENV === 'development' ? clientIp : undefined
        });
    } catch (error) {
        console.error('[IP Check User] Error:', error);
        return next();
    }
}
module.exports = {
    getClientIp,
    IsWhitelisted,
    getWhitedlistedIps,
    IsTrustedMobileRequest,
    getWhitelistedIpsFromDb,
    hasValidBypassToken,
    verifyBypassPasscode,
    generateBypassToken,
    checkAdminIpAccess,
    checkUserIpAccess
}