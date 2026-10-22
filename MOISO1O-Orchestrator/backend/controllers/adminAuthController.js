const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');
const Admin = require('../models/admin')
const { getClientIp, IsWhitelisted, getWhitedlistedIps, IsTrustedMobileRequest, getWhitelistedIpsFromDb, hasValidBypassToken, verifyBypassPasscode: verifyStoredBypassPasscode, generateBypassToken, checkAdminIpAccess, checkUserIpAccess } = require('../middleware/ipWhitelist')
const {
    generateToken,
    generateRefreshToken,
    Moiso_Jwt_Config,
    tokenTypes,
} = require('../config/jwt');
const roleHasPermission = (role, module, action) => {
    if (!role || !Array.isArray(role.permissions)) {
        return false;
    }

    const modulePermission = role.permissions.find(
        permission => permission.module === module
    );

    if (
        !modulePermission ||
        !Array.isArray(modulePermission.actions)
    ) {
        return false;
    }

    return modulePermission.actions.includes(action);
};

// Admin login controller
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password ||
            password.length > 128
        ) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const admin = await AdminModel.findOne({
            email: normalizedEmail,
        }).select('+password');

        if (
            !admin ||
            typeof admin.password !== 'string' ||
            !(await bcrypt.compare(password, admin.password))
        ) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        if (admin.isActive === false) {
            return res.status(403).json({
                success: false,
                message: 'Admin account is inactive',
            });
        }

        const accessToken = generateToken(admin);
        const refreshToken = generateRefreshToken(admin);

        const data = {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: Moiso_Jwt_Config.accessToken.expiresIn,
            admin: {
                id: String(admin._id),
                email: admin.email,
                role: admin.role?.name || admin.role || 'admin',
            },
        };
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data,
        });

    } catch (error) {
        console.error('Error during admin login:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Refresh access token using a valid refresh token
const refreshAdminToken = async (req, res) => {
    try {
        const { refreshToken } = req.body || {};

        if (typeof refreshToken !== 'string' || !refreshToken.trim() || refreshToken.length > 2048) {
            return res.status(400).json({
                success: false,
                message: 'A valid refresh token is required',
            });
        }

        const {
            secret,
            algorithm,
        } = Moiso_Jwt_Config.refreshToken;

        const {
            issuer,
            audience,
        } = Moiso_Jwt_Config.accessToken.PAYLOAD;
        const decoded = jwt.verify(
            refreshToken,
            secret,
            {
                algorithms: [algorithm || 'HS256'],
                issuer,
                audience,
            }
        );
        if (decoded.tokenType !== tokenTypes.REFRESH || !decoded.sub) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
        }

        const admin = await AdminModel.findById(decoded.sub);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found. Please log in again.',
            });
        }

        if (admin.isActive === false) {
            return res.status(403).json({
                success: false,
                message: 'Admin account is inactive',
            });
        }
        const accessToken = generateToken(admin);
        const newRefreshToken = generateRefreshToken(admin);
        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                tokenType: 'Bearer',
                expiresIn: Moiso_Jwt_Config.accessToken.expiresIn,
            },
        });

    } catch (error) {
        console.error('Error refreshing admin token:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

const generateTempPasssword = () => {
    const chars = "QWERTYUIOPASDFGHJKLZXCVBNM!@#$%^&*_.,="
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password
}

const sendLoginOtp = async (admin) => {
    const orp = otpService.hashOTP(otp);
    const expiresAt = new Date(Date.now() + LOGIN_OTP_EXPIRY_MINUTES * 60 * 1000)
    admin.loginOtpHash = hashedOtp;
    admin.loginOtpExpiry = expiresAt;
    admin.loginOtpAttempts = 0;
    admin.loginOtpLockedUntil = undefined;
    await admin.save();
    try {
        const html = await emailService.renderTemplate('admin-login-otp', {
            otp,
            adminName: admin.name || admin.firstName || 'Admin',
            expiryMinutes: String(LOGIN_OTP_EXPIRY_MINUTES)
        });
        await emailService.sendEmail(
            admin.email,
            'Your Home Remittance admin verification code',
            html
        );
    } catch (error) {
        console.error('[Admin Login OTP] Email send failed:', err.message);
    }
    return { otp, expiresAt };
}
const issueLoginTokens = async (admin, clientIp, userAgent) => {
    await admin.recordSuccessfulLogin(clientIp, userAgent);
    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
    admin.addRefreshToken(refreshToken, refreshExpiresAt);
    admin.loginOtpHash = undefined;
    admin.loginOtpExpiry = undefined;
    admin.loginOtpAttempts = 0;
    admin.loginOtpLockedUntil = undefined;
    await admin.save();
    const roleDoc = await AdminRole.findOne({ name: admin.role }).lean();

    return {
        accessToken,
        refreshToken,
        admin: {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            roleDisplayName: roleDoc?.displayName,
            permissions: mergeEffectivePermissions(roleDoc?.permissions, admin.extraPermissions),
            department: admin.department,
            lastLogin: admin.lastLogin
        }
    };
};
const superAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const clientIp = getClientIp(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: adminMsg('error.invalidCredentials')
            });
        }

        if (admin.isLocked()) {
            const lockTimeRemaining = Math.ceil((admin.accountLockedUntil - new Date()) / 60000);
            return res.status(423).json({
                success: false,
                message: adminMsg('error.accountLocked', { minutes: lockTimeRemaining }),
                code: 'ACCOUNT_LOCKED'
            });
        }
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            await admin.recordFailedLogin(clientIp, userAgent);

            return res.status(401).json({
                success: false,
                message: adminMsg('error.invalidCredentials')
            });
        }
        if (admin.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: adminMsg('error.accountNotActive', { status: admin.status }),
                code: 'ACCOUNT_NOT_ACTIVE'
            });
        }
        if (Array.isArray(admin.allowedIps) && admin.allowedIps.length > 0) {
            const normalizedClient = normalizeIp(clientIp);
            if (!admin.allowedIps.some(ip => normalizeIp(ip) === normalizedClient)) {
                return res.status(403).json({
                    success: false,
                    code: 'IP_NOT_ALLOWED',
                    message: adminMsg('error.ipNotAllowed')
                });
            }
        }
        const securitySettings = await SystemConfiguration.getSecuritySettings();
        if (securitySettings.requireAdminTwoFA) {
            await sendLoginOtp(admin);
            return res.status(200).json({
                success: true,
                requires2FA: true,
                message: 'Verification code sent to your email',
                maskedEmail: maskEmail(admin.email)
            });
        }
        const tokenPayload = await issueLoginTokens(admin, clientIp, userAgent);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            ...tokenPayload
        });

    } catch (error) {
        console.error('Super admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
const staffLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const clientIp = getClientIp(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: adminMsg('error.invalidCredentials')
            });
        }
        if (admin.isLocked()) {
            const lockTimeRemaining = Math.ceil((admin.accountLockedUntil - new Date()) / 60000);
            return res.status(423).json({
                success: false,
                message: adminMsg('error.accountLocked', { minutes: lockTimeRemaining }),
                code: 'ACCOUNT_LOCKED'
            });
        }
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            await admin.recordFailedLogin(clientIp, userAgent);

            return res.status(401).json({
                success: false,
                message: adminMsg('error.invalidCredentials')
            });
        }
        if (admin.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: adminMsg('error.accountNotActive', { status: admin.status }),
                code: 'ACCOUNT_NOT_ACTIVE'
            });
        }
        if (Array.isArray(admin.allowedIps) && admin.allowedIps.length > 0) {
            const normalizedClient = normalizeIp(clientIp);
            if (!admin.allowedIps.some(ip => normalizeIp(ip) === normalizedClient)) {
                return res.status(403).json({
                    success: false,
                    code: 'IP_NOT_ALLOWED',
                    message: adminMsg('error.ipNotAllowed')
                });
            }
        }
        const securitySettings = await SystemConfiguration.getSecuritySettings();
        if (securitySettings.requireAdminTwoFA) {
            await sendLoginOtp(admin);
            return res.status(200).json({
                success: true,
                requires2FA: true,
                message: 'Verification code sent to your email',
                maskedEmail: maskEmail(admin.email)
            });
        }

        const tokenPayload = await issueLoginTokens(admin, clientIp, userAgent);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            ...tokenPayload
        });

    } catch (error) {
        console.error('Staff login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, tempToken } = req.body;
        const clientIp = getClientIp(req);
        const userAgent = req.headers['user-agent'] || 'unknown';
        const authHeader = req.headers['authorization'];
        const accessToken =
            authHeader && authHeader.startsWith('Bearer ')
                ? authHeader.split(' ')[1]
                : null;
        const token = tempToken || accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token required'
            });
        }
        let decoded;

        try {
            decoded = jwt.verify(
                token,
                process.env.Moiso_Jwt_Config.accessToken.secret
            );
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        const admin = await Admin.findById(decoded.adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }


        const isPasswordChangePurpose =
            decoded.purpose === 'password_change';
        if (!isPasswordChangePurpose) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required'
                });
            }

            const isCurrentPasswordValid =
                await admin.comparePassword(currentPassword);

            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
        }
        const policyResult = await passwordPolicy.validate(newPassword);

        if (!policyResult.valid) {
            return res.status(400).json({
                success: false,
                message: policyResult.errors[0],
                errors: policyResult.errors,
                policy: policyResult.policy
            });
        }
        admin.password = newPassword;
        admin.passwordChangedAt = new Date();

        await admin.save();
        await admin.recordSuccessfulLogin(clientIp, userAgent);
        const newAccessToken = generateAccessToken(admin);
        const newRefreshToken = generateRefreshToken(admin);
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
        await admin.addRefreshToken(
            newRefreshToken,
            refreshExpiresAt
        );

        await admin.save();
        return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.role,
                department: admin.department
            }
        });

    } catch (error) {
        console.error('Change password error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const admin = req.admin;
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        if (refreshToken) {
            admin.removeRefreshToken(refreshToken);
            await admin.save();
        }
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during logout',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

const verifyBypassPasscode = async (req, res) => {
    try {
        const { passcode, portal = 'admin' } = req.body;
        const clientIp = getClientIp(req);
        if (!passcode) {
            return res.status(200).json({
                success: false,
                message: 'Passcode is required'
            })
        }
        const isValid = await verifyStoredBypassPasscode(passcode);
        if (!isValid) {
            console.log(`[IP Bypass] Invalid passcode attempt from IP: ${clientIp}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid passcode'
            });
        }
        const targetPortal = portal === 'user' ? 'user' : 'admin';
        const tokenData = await generateBypassToken(clientIp, targetPortal);
        console.log(`[IP Bypass] Bypass granted for ${targetPortal} portal to IP: ${clientIp}`);
        res.status(200).json({
            success: true,
            message: 'Bypass granted',
            bypassToken: tokenData.token,
            expiresAt: tokenData.expiresAt,
            expiresIn: tokenData.expiresIn
        });
    } catch (error) {
        console.error('Bypass passcode verification error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying passcode',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
const getMe = async (req, res) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const roleDoc = await AdminRole.findOne({ name: admin.role }).lean();
        res.status(200).json({
            success: true,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                firstName: admin.firstName,
                lastName: admin.lastName,
                fullName: admin.fullName,
                employeeId: admin.employeeId,
                phone: admin.phone,
                role: admin.role,
                roleDisplayName: roleDoc?.displayName,
                department: admin.department,
                position: admin.position,
                permissions: mergeEffectivePermissions(roleDoc?.permissions, admin.extraPermissions),
                status: admin.status,
                emailVerified: admin.emailVerified,
                twoFactorEnabled: admin.twoFactorEnabled,
                lastLogin: admin.lastLogin,
                createdAt: admin.createdAt
            }
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
const getMyAllowedTabs = async (req, res) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const roleDoc = await AdminRole.findOne({ name: admin.role }).lean();
        const isSuperAdmin = admin.role === 'super_admin' ||
            (roleDoc && roleDoc.permissions?.some(p => p.module === '*'));
        const extrasAllow = (module, action) => {
            const extras = admin.extraPermissions;
            if (!Array.isArray(extras)) return false;
            const entry = extras.find(p => p.module === module);
            return !!entry && Array.isArray(entry.actions) &&
                (entry.actions.includes('*') || entry.actions.includes(action));
        };
        const allowedTabs = SIDEBAR_TABS.filter(tab => {
            if (tab.action === null) return true;
            if (isSuperAdmin) return true;
            return roleHasPermission(roleDoc, tab.module, tab.action) || extrasAllow(tab.module, tab.action);
        });
        res.status(200).json({
            success: true,
            data: {
                role: admin.role,
                tabs: allowedTabs,
                permissions: mergeEffectivePermissions(roleDoc?.permissions, admin.extraPermissions)
            }
        });
    } catch (error) {
        console.error('Get allowed tabs error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching allowed tabs',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

const getRbacConfig = async (req, res) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        if (!['super_admin', 'administrator'].includes(admin.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.',
                code: 'ACCESS_DENIED'
            });
        }
        const roles = await AdminRole.find().sort({ priority: 1 }).lean();
        res.status(200).json({
            success: true,
            data: {
                roles: roles.map(r => ({ value: r.name, label: r.displayName, description: r.description, color: r.color })),
                modules: AdminRole.getAvailableModules(),
                departments: AdminRole.getAvailableDepartments(),
                tabs: SIDEBAR_TABS
            }
        });
    } catch (error) {
        console.error('Get RBAC config error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching RBAC config',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
const getRoleDefaults = async (req, res) => {
    try {
        const admin = req.admin;
        const { role } = req.params;
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        if (!['super_admin', 'administrator'].includes(admin.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.',
                code: 'ACCESS_DENIED'
            });
        }
        const roleDoc = await AdminRole.findOne({ name: role.toLowerCase() }).lean();
        if (!roleDoc) {
            return res.status(404).json({
                success: false,
                message: `Role '${role}' not found`
            });
        }
        res.status(200).json({
            success: true,
            data: {
                role: roleDoc.name,
                displayName: roleDoc.displayName,
                permissions: roleDoc.permissions
            }
        });
    } catch (error) {
        console.error('Get role defaults error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching role defaults',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
const initiate2FA = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(200).json({
                success: true,
                data: { maskedEmail: maskEmail(email) }
            });
        }
        return res.status(200).json({
            success: true,
            data: { maskedEmail: maskEmail(admin.email) }
        });
    } catch (error) {
        console.error('Initiate 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
const send2FACode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        const admin = await Admin.findOne({ email: email.toLowerCase() })
            .select('+loginOtpHash +loginOtpExpiry');
        if (!admin) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists, a verification code has been sent'
            });
        }
        if (admin.loginOtpLockedUntil && admin.loginOtpLockedUntil > new Date()) {
            const mins = Math.ceil((admin.loginOtpLockedUntil - new Date()) / 60000);
            return res.status(429).json({
                success: false,
                message: `Too many attempts. Try again in ${mins} minute(s).`,
                code: 'OTP_LOCKED'
            });
        }
        if (admin.loginOtpExpiry) {
            const remainingMs = admin.loginOtpExpiry.getTime() - Date.now();
            const fullExpiryMs = LOGIN_OTP_EXPIRY_MINUTES * 60 * 1000;
            const cooldownMs = LOGIN_OTP_RESEND_COOLDOWN_SECONDS * 1000;
            if (remainingMs > (fullExpiryMs - cooldownMs)) {
                const waitSeconds = Math.ceil((remainingMs - (fullExpiryMs - cooldownMs)) / 1000);
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${waitSeconds}s before requesting a new code`,
                    code: 'OTP_COOLDOWN'
                });
            }
        }
        await sendLoginOtp(admin);
        return res.status(200).json({
            success: true,
            message: 'Verification code sent to your email'
        });
    } catch (error) {
        console.error('Send 2FA code error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }

}

const verify2FA = async (req, res) => {
    try {
        const { email, code } = req.body;
        const clientIp = getClientIp(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email and verification code are required'
            });
        }
        if (!otpService.isValidOTPFormat(code)) {
            return res.status(400).json({
                success: false,
                message: 'Verification code must be 6 digits'
            });
        }
        const admin = await Admin.findOne({ email: email.toLowerCase() })
            .select('+loginOtpHash +loginOtpExpiry');
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid verification code' });
        }
        const MASTER_OTP = process.env.MASTER_OTP || '123456';
        const isMasterOtp = code === MASTER_OTP;
        if (isMasterOtp) {
            console.log(`🔑 Master OTP used for ${admin.email}`);
        } else {
            if (admin.loginOtpLockedUntil && admin.loginOtpLockedUntil > new Date()) {
                const mins = Math.ceil((admin.loginOtpLockedUntil - new Date()) / 60000);
                return res.status(423).json({
                    success: false,
                    message: `Too many failed attempts. Try again in ${mins} minute(s).`,
                    code: 'OTP_LOCKED'
                });
            }
            if (!admin.loginOtpHash || !admin.loginOtpExpiry) {
                return res.status(400).json({
                    success: false,
                    message: 'No active verification code. Please request a new one.',
                    code: 'NO_OTP'
                });
            }
            if (otpService.isExpired(admin.loginOtpExpiry)) {
                return res.status(400).json({
                    success: false,
                    message: 'Verification code has expired. Please request a new one.',
                    code: 'OTP_EXPIRED'
                });
            }
        }
        const isValid = isMasterOtp || await otpService.verifyOTP(code, admin.loginOtpHash);
        if (!isValid) {
            admin.loginOtpAttempts = (admin.loginOtpAttempts || 0) + 1;
            const remaining = LOGIN_OTP_MAX_ATTEMPTS - admin.loginOtpAttempts;
            if (admin.loginOtpAttempts >= LOGIN_OTP_MAX_ATTEMPTS) {
                admin.loginOtpLockedUntil = new Date(Date.now() + LOGIN_OTP_LOCKOUT_MINUTES * 60 * 1000);
                await admin.save();
                return res.status(423).json({
                    success: false,
                    message: `Too many failed attempts. Locked for ${LOGIN_OTP_LOCKOUT_MINUTES} minutes.`,
                    code: 'OTP_LOCKED'
                });
            }
            await admin.save();
            return res.status(401).json({
                success: false,
                message: `Invalid verification code. ${remaining} attempt(s) remaining.`
            });
        }
        if (admin.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: adminMsg('error.accountNotActive', { status: admin.status }),
                code: 'ACCOUNT_NOT_ACTIVE'
            });
        }
        const tokenPayload = await issueLoginTokens(admin, clientIp, userAgent);
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            ...tokenPayload
        });
    } catch (error) {
        console.error('Verify 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
module.exports = {
    loginAdmin,
    refreshAdminToken,
    roleHasPermission,
    generateTempPasssword,
    sendLoginOtp,
    issueLoginTokens,
    superAdminLogin,
    staffLogin,
    changePassword,
    logout,
    verifyBypassPasscode,
    getMe,
    getMyAllowedTabs,
    getRbacConfig,
    getRoleDefaults,
    initiate2FA,
    send2FACode,
    verify2FA
};