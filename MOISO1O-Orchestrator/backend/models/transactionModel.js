
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        transactionReference: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        remitterId: {
            type: String,
            required: true,
            trim: true,
        },

        beneficiaryId: {
            type: String,
            required: true,
            trim: true,
        },

        beneficiaryAccountNumber: {
            type: String,
            required: true,
            trim: true,
        },

        transactionType: {
            type: String,
            enum: ["REMITTANCE", "INTERNAL_TRANSFER"],
            required: true,
        },

        details: {
            sourceCountry: {
                type: String,
                required: true,
                uppercase: true,
            },

            sourceCurrency: {
                type: String,
                required: true,
                uppercase: true,
            },

            sourceAmount: {
                type: mongoose.Schema.Types.Decimal128,
                required: true,
                validate: {
                    validator: (value) =>
                        Number.isFinite(Number(value.toString())) &&
                        Number(value.toString()) > 0,
                    message: "Source amount must be greater than zero",
                },
            },

            destinationCountry: {
                type: String,
                required: true,
                uppercase: true,
            },

            destinationCurrency: {
                type: String,
                required: true,
                uppercase: true,
            },

            exchangeRate: {
                type: mongoose.Schema.Types.Decimal128,
                required: true,
            },

            destinationAmount: {
                type: mongoose.Schema.Types.Decimal128,
                required: true,
            },

            transferFee: {
                type: mongoose.Schema.Types.Decimal128,
                required: true,
            },

            totalPayable: {
                type: mongoose.Schema.Types.Decimal128,
                required: true,
            },
        },

        status: {
            type: String,
            enum: [
                "DRAFT",
                "PENDING",
                "PROCESSING",
                "SUCCESS",
                "FAILED",
                "CANCELLED",
                "REFUND_PENDING",
                "REFUNDED",
            ],
            default: "DRAFT",
            required: true,
        },

        audit: {
            completedAt: {
                type: Date,
                default: null,
            },

            failedAt: {
                type: Date,
                default: null,
            },
        },
    },
    {
        timestamps: true,
    }
);

const transactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = transactionModel;
