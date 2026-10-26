const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const Admin = require('../models/admin')
const crypto = require('crypto')

const generateBackUpCodes = (req, res) => {
    try {
        const codes = []
        for (let i = 0; i < 8; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code)
        }
        return codes;
    } catch (error) {
        console.log('Error 2FA Controller', error.message)
        return res.stauts('2FA_001').json({
            status: false,
            message: error.message
        })
    }
}

const get2FAStatus = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('twoFactorEnabled')
        if (!admin) {
            return res.stauts(404).json({
                success: false,
                message: 'Admin not found'
            })
        }
        res.json({
            success: true,
            enabled: admin.twoFactorEnabled || false
        })
    } catch (error) {
        console.error('Get admin 2FA status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get 2FA status'
        });
    }
}
const setup2FA = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('+twoFactorSecret');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        if (admin.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is already enabled. Please disable it first to set up again.'
            });
        }
        const secret = speakeasy.generateSecret({
            name: `MOISO` Remittance Admin(${ admin.email
        })`,
            issuer: 'MOISO Remittance Admin',
            length: 20
        });
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        admin.twoFactorSecret = secret.base32;
        admin.twoFactorEnabled = false;

        await admin.save();
        console.log(`Admin 2FA setup initiated for: ${ admin.email } `)
        if (process.env.NODE_ENV === 'development') {
            console.log('\n╔════════════════════════════════════════════════════════════════╗');
            console.log('║       DEVELOPMENT MODE - ADMIN 2FA SETUP DETAILS               ║');
            console.log('╠════════════════════════════════════════════════════════════════╣');
            console.log(`║  Email: ${ admin.email.padEnd(55) }║`);
            console.log(`║  Secret: ${ secret.base32.padEnd(54) }║`);
            console.log('╚════════════════════════════════════════════════════════════════╝\n');
        }
        res.json({
            success: true,
            message: 'Scan the QR code with your authenticator app',
            secret: secret.base32,
            qrCodeUrl: qrCodeUrl
        });
    } catch (error) {
        console.error('Admin setup 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup 2FA. Please try again.'
        });
    }
}
const verify2FA = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Verification code is required'
            });
        }
        const admin = await Admin.findById(req.admin._id).select('+twoFactorSecret +twoFactorBackupCodes');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        if (!admin.twoFactorSecret) {
            return res.status(400).json({
                success: false,
                message: 'Please setup 2FA first'
            });
        }
        const verified = speakeasy.totp.verify({
            secret: admin.twoFactorSecret,
            encoding: 'base32',
            token: code.toString(),
            window: 1
        });
        if (!verified) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code. Please try again.'
            });
        }
        const backupCodes = generateBackupCodes();
        admin.twoFactorEnabled = true;
        admin.twoFactorBackupCodes = backupCodes;
        await admin.save();

        console.log(`✅ Admin 2FA enabled for: ${ admin.email } `);
        res.json({
            success: true,
            message: '2FA has been enabled successfully!',
            backupCodes: backupCodes
        });
    } catch (error) {
        console.error('Admin verify 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify 2FA code. Please try again.'
        });
    }
}

const disabled2FA = async (req, res) => {
    try {
        const { code, error } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to disable 2FA'
            });
        }
        const admin = await Admin.findById(req.admin._id).select('+password +twoFactorSecret +twoFactorBackupCodes');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }
        if (!admin.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is not enabled'
            });
        }
        if (code && admin.twoFactorSecret) {
            const backupCodeIndex = admin.twoFactorBackupCodes?.indexOf(code);
            let isValidCode = backupCodeIndex !== -1;
            if (!isValidCode) {
                // Try TOTP verification
                isValidCode = speakeasy.totp.verify({
                    secret: admin.twoFactorSecret,
                    encoding: 'base32',
                    token: code.toString(),
                    window: 1
                });
            }

            if (!isValidCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid 2FA code'
                });
            }
        }
        admin.twoFactorEnabled = false;
        admin.twoFactorSecret = undefined;
        admin.twoFactorBackupCodes = [];
        await admin.save();

        console.log(`🔓 Admin 2FA disabled for: ${ admin.email } `);

        res.json({
            success: true,
            message: '2FA has been disabled successfully'
        })
    } catch (error) {
        console.error('Admin disable 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disable 2FA. Please try again.'
        });
    }
}

const verifyTOTPLogin = async (adminId, code) => {
    try {
        const admin = await Admin.findById(adminId).select('+twoFactorSecret +twoFactorBackupCodes');

        if (!admin || !admin.twoFactorEnabled || !admin.twoFactorSecret) {
            return false;
        }

        // Check if it's a backup code
        const backupCodeIndex = admin.twoFactorBackupCodes?.indexOf(code);
        if (backupCodeIndex !== -1) {
            // Remove used backup code
            admin.twoFactorBackupCodes.splice(backupCodeIndex, 1);
            await admin.save();
            console.log(`🔑 Admin backup code used for: ${ admin.email } `);
            return true;
        }
        const verified = speakeasy.totp.verify({
            secret: admin.twoFactorSecret,
            encoding: 'base32',
            token: code.toString(),
            window: 1
        });

        return verified;
    } catch (error) {
        console.error('Admin verify TOTP for login error:', error);
        return false;
    }
}
module.exports = {
    generateBackUpCodes,
    get2FAStatus,
    setup2FA,
    verify2FA,
    disabled2FA,
    verifyTOTPLogin
}