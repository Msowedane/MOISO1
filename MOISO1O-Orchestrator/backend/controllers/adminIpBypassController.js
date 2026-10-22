const bcrypt = require('bcryptjs');
const BypassPasscodeSettings = require('../models/BypassPasscodeSettings');
const IpBypassToken = require('../models/IpBypassToken');
const { getClientIp } = require('../middleware/adminIpAccess');

const verifyAdminBypassPasscode = async (req, res) => {
    const { passcode } = req.body || {};

    if (typeof passcode !== 'string' || !passcode.trim() || passcode.length > 256) {
        return res.status(400).json({
            success: false,
            message: 'A valid bypass passcode is required',
            code: 'INVALID_BYPASS_PASSCODE',
        });
    }

    try {
        const passcodeHash = await BypassPasscodeSettings.getPasscodeHash();
        if (!passcodeHash) {
            return res.status(503).json({
                success: false,
                message: 'Admin IP bypass is not configured',
                code: 'BYPASS_NOT_CONFIGURED',
            });
        }

        if (!(await bcrypt.compare(passcode, passcodeHash))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid bypass passcode',
                code: 'INVALID_BYPASS_PASSCODE',
            });
        }

        const clientIp = getClientIp(req);
        if (!clientIp) {
            return res.status(400).json({
                success: false,
                message: 'Unable to determine client IP address',
                code: 'CLIENT_IP_UNAVAILABLE',
            });
        }

        const configuredExpiryHours = Number.parseInt(
            process.env.IP_BYPASS_TOKEN_EXPIRY,
            10
        );
        const expiryHours = Number.isInteger(configuredExpiryHours) &&
            configuredExpiryHours > 0
            ? configuredExpiryHours
            : 1;
        const { token, expiresAt } = await IpBypassToken.createToken(
            clientIp,
            'admin',
            expiryHours
        );

        return res.status(200).json({
            success: true,
            message: 'IP bypass authorized. Use the token to continue to admin login.',
            data: {
                bypassToken: token,
                expiresAt,
                expiresInSeconds: expiryHours * 60 * 60,
            },
        });
    } catch (error) {
        console.error('Admin IP bypass verification failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to verify admin IP bypass passcode',
            code: 'BYPASS_VERIFICATION_FAILED',
        });
    }
};

module.exports = { verifyAdminBypassPasscode };
