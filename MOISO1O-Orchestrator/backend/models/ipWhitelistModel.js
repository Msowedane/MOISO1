const mongoose = require('mongoose');

const ipWhitelistSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    portals: {
        admin: {
            type: Boolean,
            default: true
        },
        user: {
            type: Boolean,
            default: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('IpWhitelist', ipWhitelistSchema);

module.exports = mongoose.model('IpWhitelist', ipWhitelistSchema);
