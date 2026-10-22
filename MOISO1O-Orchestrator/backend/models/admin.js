const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        enum: ['Operations', 'Finance', 'Support', 'Compliance', 'IT', 'Management', 'Other', null],
        default: null
    },
    position: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: 'support_agent'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'pending'],
        default: 'active'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    twoFactorBackupCodes: [{
        type: String,
        select: false
    }],
    loginOtpHash: { type: String, select: false },
    loginOtpExpiry: { type: Date, select: false },
    loginOtpAttempts: { type: Number, default: 0 },
    loginOtpLockedUntil: { type: Date },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpiry: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lastFailedLogin: Date,
    accountLockedUntil: Date,
    allowedIps: {
        type: [String],
        default: []
    },
    extraPermissions: [{
        _id: false,
        module: { type: String, required: true },
        actions: { type: [String], default: [] }
    }],
    lastLogin: Date,
    tokensValidAfter: { type: Date, default: null },
    lastActivity: Date,
    loginHistory: [{
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
        location: String,
        success: { type: Boolean, default: true }
    }],
    refreshTokens: [{
        token: String,
        expiresAt: Date
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    invitedAt: {
        type: Date
    },
    passwordChangedAt: {
        type: Date
    }
}, {
    timestamps: true
});
adminSchema.index({ employeeId: 1 });
adminSchema.index({ status: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ invitedBy: 1 });
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        console.log(`\n🔐 PRE-SAVE HOOK: Hashing password for ${this.email || 'admin'}`);
        console.log(`Plain password (first 4 chars): ${this.password.substring(0, 4)}...`);
        console.log(`Plain password length: ${this.password.length}`);
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        console.log(`✅ Password hashed successfully`);
        console.log(`Hash (first 20 chars): ${this.password.substring(0, 20)}...`);
        console.log(`Hash starts with $2: ${this.password.startsWith('$2')}\n`);
        next();
    } catch (error) {
        console.error(`\n❌ PRE-SAVE HOOK ERROR for ${this.email}:`, error);
        next(error);
    }
});
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.addRefreshToken = function (token, expiresAt) {
    if (!Array.isArray(this.refreshTokens)) {
        this.refreshTokens = [];
    }
    this.refreshTokens.push({ token, expiresAt });
    if (this.refreshTokens.length > 5) {
        this.refreshTokens = this.refreshTokens.slice(-5);
    }
};

adminSchema.methods.removeRefreshToken = function (token) {
    if (!Array.isArray(this.refreshTokens)) {
        this.refreshTokens = [];
        return;
    }
    this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
};

adminSchema.methods.hasRefreshToken = function (token) {
    if (!Array.isArray(this.refreshTokens)) return false;
    return this.refreshTokens.some(t => t.token === token && t.expiresAt > new Date());
};

adminSchema.methods.isLocked = function () {
    return this.accountLockedUntil && this.accountLockedUntil > new Date();
};

adminSchema.methods.recordFailedLogin = async function (ipAddress, userAgent) {
    this.loginAttempts += 1;
    this.lastFailedLogin = new Date();
    let maxAttempts = 5;
    let lockoutMinutes = 30;
    try {
        const SystemConfiguration = require('./SystemConfiguration');
        const s = await SystemConfiguration.getSecuritySettings();
        maxAttempts = Math.max(1, parseInt(s.maxLoginAttempts, 10) || 5);
        lockoutMinutes = Math.max(1, parseInt(s.lockoutDurationMinutes, 10) || 30);
    } catch (_err) {

    }

    if (this.loginAttempts >= maxAttempts) {
        this.accountLockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
    }

    this.loginHistory.push({
        timestamp: new Date(),
        ipAddress,
        userAgent,
        success: false
    });
    if (this.loginHistory.length > 20) {
        this.loginHistory = this.loginHistory.slice(-20);
    }

    await this.save();
};

adminSchema.methods.recordSuccessfulLogin = async function (ipAddress, userAgent) {
    this.loginAttempts = 0;
    this.lastFailedLogin = null;
    this.accountLockedUntil = null;
    this.lastLogin = new Date();
    this.lastActivity = new Date();

    this.loginHistory.push({
        timestamp: new Date(),
        ipAddress,
        userAgent,
        success: true
    });

    if (this.loginHistory.length > 20) {
        this.loginHistory = this.loginHistory.slice(-20);
    }

    await this.save();
};

adminSchema.methods.getFullName = function () {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.name;
};

adminSchema.virtual('fullName').get(function () {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.name;
});
adminSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.isActive = this.status === 'active';
    }
    next();
});

adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AdminLegacy', adminSchema, 'admins');