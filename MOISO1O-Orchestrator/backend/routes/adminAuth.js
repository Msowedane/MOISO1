const express = require("express");
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { loginAdmin, refreshAdminToken } = require("../controllers/adminAuthController");
// const { verifyAdminBypassPasscode } = require('../controllers/adminIpBypassController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { checkAdminIpAccess } = require('../middleware/adminIpAccess');
const { generateBackUpCodes, get2FAStatus, setup2FA, verify2FA, disabled2FA, verifyTOTPLogin } = require('../controllers/admin2FAController')
const { verifyAdminBypassPasscode } = require('../controllers/adminIpBypassController')
const bypassPasscodeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many bypass passcode attempts. Please try again later.',
        code: 'BYPASS_RATE_LIMITED',
    },
});

router.get('/check-ip', checkAdminIpAccess, (req, res) => {
    return res.status(200).json({
        success: true,
        authorized: true,
        message: req.adminIpWhitelistUnconfigured
            ? 'Admin IP whitelist is not configured; access is allowed'
            : req.adminIpLocalDevelopment
                ? 'Local development access allowed'
                : req.adminIpBypass
                ? 'IP bypass authorized'
                : 'Your IP address is authorized',
        code: req.adminIpWhitelistUnconfigured
            ? 'IP_WHITELIST_NOT_CONFIGURED'
            : req.adminIpLocalDevelopment
                ? 'IP_LOCAL_DEVELOPMENT'
                : req.adminIpBypass
                ? 'IP_BYPASS_AUTHORIZED'
                : 'IP_AUTHORIZED',
    });
});
router.post('/verifybypassPasscode', verifyAdminBypassPasscode)
router.post('/login/staff', checkAdminIpAccess,)
router.post('/bypass-passcode', bypassPasscodeLimiter, verifyAdminBypassPasscode);
router.post("/login", checkAdminIpAccess, loginAdmin);
router.post('/refresh-token', refreshAdminToken)
router.post('/backupcodes', authenticateAdmin, generateBackUpCodes)
router.get('/2fa/status', authenticateAdmin, get2FAStatus)
router.post('/2fa/setup', authenticateAdmin, setup2FA)
router.post('/verify2FA', authenticateAdmin, verify2FA)
router.post('/2fa/disable', authenticateAdmin, disabled2FA)
router.post('/verifytotplogin', authenticateAdmin, verifyTOTPLogin)
module.exports = router;