const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const { Moiso_Jwt_Config, tokenTypes } = require('../config/jwt');

const authenticateAdmin = async (req, res, next) => {
    const authorization = req.get('authorization');
    const [scheme, token] = authorization?.split(' ') || [];

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token is required',
        });
    }

    try {
        const { secret, algorithm, PAYLOAD } = Moiso_Jwt_Config.accessToken;
        const decoded = jwt.verify(token, secret, {
            algorithms: [algorithm],
            issuer: PAYLOAD.issuer,
            audience: PAYLOAD.audience,
        });

        if (decoded.tokenType !== tokenTypes.ACCESS || !decoded.sub) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token',
            });
        }

        const admin = await Admin.findById(decoded.sub);
        if (!admin || admin.isActive === false) {
            return res.status(401).json({
                success: false,
                message: 'Admin account is unavailable',
            });
        }

        req.admin = admin;
        return next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired authentication token',
            });
        }

        console.error('Admin authentication failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Admin authentication failed',
        });
    }
};

const requireModulePermission = (moduleName, action) => (req, res, next) => {
    const role = req.admin?.role;
    if (!req.admin) {
        return res.status(401).json({
            success: false,
            message: 'Admin authentication is required',
        });
    }

    if (role === 'admin' || role === 'super_admin') {
        return next();
    }

    const permissions = Array.isArray(role?.permissions)
        ? role.permissions
        : Array.isArray(req.admin.permissions)
            ? req.admin.permissions
            : [];
    const modulePermission = permissions.find(
        permission => permission.module === moduleName
    );

    if (!modulePermission?.actions?.includes(action)) {
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to perform this action',
        });
    }

    return next();
};

module.exports = { authenticateAdmin, requireModulePermission };
