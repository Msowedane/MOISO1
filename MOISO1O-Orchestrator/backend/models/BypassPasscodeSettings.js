const mongoose = require('mongoose')

const BypassPasscodeSettings = new mongoose.Schema({
    _id: {
        type: String,
        default: 'bypass_passcode_settings'
    },
    passcodeHash: {
        type: String,
        required: true
    },
    lastChangedAt: {
        type: Date,
        default: Date.now
    },
    lastChangedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: false
});

BypassPasscodeSettings.statics.getPasscodeHash = async function () {
    if (process.env.IP_BYPASS_PASSCODE_HASH) {
        return process.env.IP_BYPASS_PASSCODE_HASH;
    }

    try {
        const settings = await this.findById('bypass_passcode_settings');
        if (settings?.passcodeHash) {
            return settings.passcodeHash;
        }
    } catch (error) {
        console.error('[BypassPasscode] Error fetching from database:', error.message);
    }
    return null;
};
BypassPasscodeSettings.statics.getSettings = async function () {
    const settings = await this.findById('bypass_passcode_settings')
        .populate('lastChangedBy', 'firstName lastName email');
    const hasEnvironmentHash = Boolean(process.env.IP_BYPASS_PASSCODE_HASH);

    return {
        isConfigured: hasEnvironmentHash || !!settings?.passcodeHash,
        lastChangedAt: settings?.lastChangedAt || null,
        lastChangedBy: settings?.lastChangedBy || null,
        source: hasEnvironmentHash ? 'environment' : 'database'
    };
};

BypassPasscodeSettings.statics.updatePasscode = async function (newHash, adminId) {
    if (typeof newHash !== 'string' || !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(newHash)) {
        throw new TypeError('A valid bcrypt hash is required for the bypass passcode');
    }

    const IpBypassToken = mongoose.model('IpBypassToken');
    const settings = await this.findByIdAndUpdate(
        'bypass_passcode_settings',
        {
            passcodeHash: newHash,
            lastChangedAt: new Date(),
            lastChangedBy: adminId
        },
        { upsert: true, new: true }
    );
    const revokedCount = await IpBypassToken.deleteMany({});
    console.log(`[BypassPasscode] Revoked ${revokedCount.deletedCount} existing bypass tokens`);

    return settings;
};

module.exports = mongoose.model('BypassPasscodeSettings', BypassPasscodeSettings);