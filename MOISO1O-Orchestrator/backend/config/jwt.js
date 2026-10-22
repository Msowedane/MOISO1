
const jwt = require('jsonwebtoken');
const Moiso_Jwt_Config = {
    accessToken: {
        secret: process.env.JWT_SECRET || "MOISO@123",
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1hr',
        algorithm: process.env.JWT_ALGORITHM || 'HS256',
        PAYLOAD: {
            issuer: 'business-onboarding-Api',
            audience: 'business-onboarding-Api',
        },
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET || "MOISO@123456",
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        algorithm: process.env.JWT_REFRESH_ALGORITHM || 'HS256',
        maxDevices: 5,
        autoExtend: true,
    },

    email_verificationToken: {
        secret: process.env.JWT_EMAIL_VERIFICATION_SECRET,
        expiresIn: process.env.JWT_EMAIL_VERIFICATION_EXPIRES_IN || '1h',
    },

    password_reset: {
        secret: process.env.JWT_PASSWORD_RESET_SECRET,
        expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRES_IN || '1h',
    },

    two_factor_auth: {
        secret: process.env.JWT_TWO_FACTOR_AUTH_SECRET,
        expiresIn: process.env.JWT_TWO_FACTOR_AUTH_EXPIRES_IN || '5m',
    },

    security: {
        redactTokens: true,
        requireHttps: process.env.NODE_ENV === 'production',
        enableBlacklisting: true,
    },

    cookies: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

const tokenTypes = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    EMAIL_VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset',
    TWO_FACTOR_AUTH: 'two_factor_auth',
};

const tokenValidationRules = {
    minSecretLength: 32,
    allowedAlgorithms: ['HS256', 'HS384', 'HS512'],
    maxTokenLength: 2048,
};



const generateToken = (admin) => {
    if (!admin || !admin._id) {
        throw new TypeError(
            'An admin with an ID is required to generate an access token'
        );
    }

    const {
        secret,
        expiresIn,
        algorithm,
        PAYLOAD,
    } = Moiso_Jwt_Config.accessToken;
    return jwt.sign(
        {
            email: admin.email,
            role: admin.role?.name || admin.role || 'admin',
            tokenType: tokenTypes.ACCESS,
        },
        secret,
        {
            algorithm,
            expiresIn,
            issuer: PAYLOAD.issuer,
            audience: PAYLOAD.audience,
            subject: String(admin._id),
        }
    );
};

const generateRefreshToken = (admin) => {
    if (!admin || !admin._id) {
        throw new TypeError(
            'An admin with an ID is required to generate a refresh token'
        );
    }

    const { secret, expiresIn, algorithm } = Moiso_Jwt_Config.refreshToken;

    return jwt.sign(
        {
            tokenType: tokenTypes.REFRESH,
        },
        secret,
        {
            algorithm,
            expiresIn,
            issuer: Moiso_Jwt_Config.accessToken.PAYLOAD.issuer,
            audience: Moiso_Jwt_Config.accessToken.PAYLOAD.audience,
            subject: String(admin._id),
        }
    );
};

module.exports = {
    Moiso_Jwt_Config,
    tokenTypes,
    tokenValidationRules,
    generateToken,
    generateRefreshToken,
};
