const mongoose = require('mongoose');

const currencyCodePattern = /^[A-Z]{3}$/;

const systemExchangeRateSchema = new mongoose.Schema({
    sourceCurrency: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        match: currencyCodePattern,
    },
    destinationCurrency: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        match: currencyCodePattern,
    },
    rate: {
        type: Number,
        required: true,
        min: [Number.MIN_VALUE, 'Rate must be greater than zero'],
        validate: {
            validator: Number.isFinite,
            message: 'Rate must be a finite number',
        },
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending Approval', 'Active', 'Inactive'],
        default: 'Active',
        required: true,
    },
    pendingChange: {
        sourceCurrency: {
            type: String,
            trim: true,
            uppercase: true,
            match: currencyCodePattern,
        },
        destinationCurrency: {
            type: String,
            trim: true,
            uppercase: true,
            match: currencyCodePattern,
        },
        rate: {
            type: Number,
            min: [Number.MIN_VALUE, 'Rate must be greater than zero'],
            validate: {
                validator: Number.isFinite,
                message: 'Rate must be a finite number',
            },
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
        },
    },
}, { timestamps: true });

systemExchangeRateSchema.index(
    { sourceCurrency: 1, destinationCurrency: 1 },
    { unique: true },
);

module.exports = mongoose.model('SystemExchangeRate', systemExchangeRateSchema);
