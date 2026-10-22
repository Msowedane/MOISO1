
const mongoose = require('mongoose');

const ipBlacklistSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    note: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    addedByName: {
        type: String,
        trim: true,
        default: ''
    },
    active: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

ipBlacklistSchema.index({ ip: 1, active: 1 });

let cachedSet = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 60 * 1000;

const normalizeIp = (ip) => {
    if (!ip) return '';

    if (ip.startsWith('::ffff:')) return ip.substring(7).trim().toLowerCase();
    return ip.trim().toLowerCase();
};

async function refreshCache() {
    try {
        const entries = await mongoose.model('IpBlacklist')
            .find({ active: true })
            .select('ip')
            .lean();

        cachedSet = new Set(entries.map(e => normalizeIp(e.ip)));
        cacheLoadedAt = Date.now();
    } catch (err) {
        console.error('[IpBlacklist] Cache refresh failed:', err.message);
        if (!cachedSet) cachedSet = new Set();
    }
    return cachedSet;
}

ipBlacklistSchema.statics.isBlacklisted = async function (ip) {
    const normalized = normalizeIp(ip);
    if (!normalized) return false;

    const stale = !cachedSet || (Date.now() - cacheLoadedAt) > CACHE_TTL_MS;
    if (stale) await refreshCache();

    return cachedSet.has(normalized);
};
ipBlacklistSchema.statics.invalidateCache = function () {
    cachedSet = null;
    cacheLoadedAt = 0;
};

module.exports = mongoose.model('IpBlacklist', ipBlacklistSchema);
