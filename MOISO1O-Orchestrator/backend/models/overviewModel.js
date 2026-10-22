const mongoose = require('mongoose')

const directRateSchema = new mongoose.Schema({
    rateCode: {
        type: String,
        trim: true,
        required: true
    },
    rateName: {
        type: String,
        trim: true,
        required: true
    },
    productType: {
        type: String,
        trim: true,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        trim: true,
        required: true
    },
    effectiveFrom: {
        type: String,
        trim: true,
        required: true
    },
    effectiveTo: {
        type: String,
        trim: true,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending Approval', 'Active', 'Inactive'],
        required: true
    }
}, {
    timestamps: true
})


const directFeesSchema = new mongoose.Schema({
    feeCode: {
        type: String,
        trim: true,
        required: true
    },
    feeName: {
        type: String,
        trim: true,
        required: true
    },
    servicesType: {
        type: String,
        trim: true,
        required: true
    },
    feeType: {
        type: String,
        trim: true,
        required: true
    },
    amount: {
        type: Number,
        min: 0,
        required: true
    },
    currency: {
        type: String,
        trim: true,
        required: true
    },
    minTransactionAmount: {
        type: Number,
        min: 0,
        required: true
    },
    maxTransactionAmount: {
        type: Number,
        min: 0,
        required: true
    },
    effectiveFrom: {
        type: String,
        trim: true,
        required: true
    },
    effectiveTo: {
        type: String,
        trim: true,
        required: true
    }, status: {
        type: String,
        enum: ['Draft', 'Pending Approval', 'Active', 'Inactive'],
        required: true
    }
}, {
    timestamps: true
})


const directRatesModel = mongoose.model('directRates', directRateSchema)
const directFeesModel = mongoose.model('directFees', directFeesSchema)

module.exports = {
    directRatesModel,
    directFeesModel
}