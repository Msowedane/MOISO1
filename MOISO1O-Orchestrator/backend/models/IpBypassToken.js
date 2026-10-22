const crypto = require('crypto')
const mongoose = require('mongoose');

const ipBypassTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    ipAddress: {
        type: String,
        required: true,
        index: true,
    },
    portal: {
        type: String,
        required: true,
        enum: ['admin', 'user'],
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

ipBypassTokenSchema.index({ token: 1, ipAddress: 1, portal: 1, expiresAt: 1 });
ipBypassTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

ipBypassTokenSchema.statics.createToken = async function (ipAddress, portal, expiryHours = 1) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    await this.create({ token, ipAddress, portal, expiresAt });
    return { token, expiresAt };
};

ipBypassTokenSchema.statics.validateToken = async function (token, ipAddress, portal) {
    if (typeof token !== 'string' || !token) {
        return false;
    }

    const bypassToken = await this.findOne({
        token,
        ipAddress,
        portal,
        expiresAt: { $gt: new Date() },
    });

    return !!bypassToken;
};

ipBypassTokenSchema.statics.revokeTokensForIp = function (ipAddress) {
    return this.deleteMany({ ipAddress });
};

ipBypassTokenSchema.statics.cleanupExpired = function () {
    return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = mongoose.model('IpBypassToken', ipBypassTokenSchema);