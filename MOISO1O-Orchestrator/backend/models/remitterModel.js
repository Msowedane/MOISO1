const mongoose = require("mongoose");

const remitterSchema = new mongoose.Schema(
    {
        customerId: {
            type: String,
            required: true,
            trim: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        mobileNumber: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        nationality: {
            type: String,
            required: true,
            trim: true,
        },
        countryOfResidence: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        kycStatus: {
            type: String,
            enum: ["PENDING", "VERIFIED", "REJECTED"],
            default: "PENDING",
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
            default: "ACTIVE",
        },
    },
    {
        timestamps: true,
    }
);

const RemitterModel = mongoose.model("Remitter", remitterSchema);

module.exports = RemitterModel;