const Joi = require("joi");
const crypto = require("crypto");
const mongoose = require("mongoose");

const transactionModel = require("../models/transactionModel");
const { findSystemExchangeRate } = require("./systemExchangeRateController");

const {
    createTransactionservices,
    updateTransactionServices,
    deleteTransactionServices,
} = require("../services/transactionServices");

const TransactionSchema = Joi.object({
    remitter_id: Joi.string().trim().required(),
    beneficary_id: Joi.string().trim().required(),
    AccountNumber: Joi.string().trim().required(),

    transactionType: Joi.string()
        .valid("REMITTANCE", "INTERNAL_TRANSFER")
        .required(),

    sourceCountry: Joi.string().length(2).uppercase().required(),
    sourceCurrency: Joi.string().length(3).uppercase().required(),
    sourceAmount: Joi.number().positive().required(),

    destinationCountry: Joi.string().length(2).uppercase().required(),
    destinationCurrency: Joi.string().length(3).uppercase().required(),
    exchangeRate: Joi.number().positive(),

    transferFee: Joi.number().min(0).required(),
}).unknown(false);

const UpdateTransactionSchema = Joi.object({
    status: Joi.string().valid(
        "DRAFT",
        "PENDING",
        "PROCESSING",
        "SUCCESS",
        "FAILED",
        "CANCELLED",
        "REFUND_PENDING",
        "REFUNDED"
    ),
}).min(1).unknown(false);

const createTransactionController = async (req, res) => {
    try {
        const { error, value } = TransactionSchema.validate(req.body, {
            abortEarly: false,
            convert: true,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.details.map((item) => item.message),
            });
        }

        const sourceAmount = value.sourceAmount;
        const systemRate = await findSystemExchangeRate(value.sourceCurrency, value.destinationCurrency);
        if (!systemRate) {
            return res.status(422).json({
                success: false,
                message: `No system exchange rate is configured for ${value.sourceCurrency} to ${value.destinationCurrency}`,
                code: "SYSTEM_EXCHANGE_RATE_NOT_FOUND",
            });
        }
        const exchangeRate = systemRate.rate;
        const transferFee = value.transferFee;
        const destinationAmount = Number((sourceAmount * exchangeRate).toFixed(3));
        const totalPayable = Number((sourceAmount + transferFee).toFixed(3));
        const payload = {
            transactionReference: `TXN - ${crypto.randomUUID()} `,
            remitterId: value.remitter_id,
            beneficiaryId: value.beneficary_id,
            beneficiaryAccountNumber: value.AccountNumber,
            transactionType: value.transactionType,
            status: "PENDING",
            details: {
                sourceCountry: value.sourceCountry,
                sourceCurrency: value.sourceCurrency,
                sourceAmount: sourceAmount.toFixed(3),
                destinationCountry: value.destinationCountry,
                destinationCurrency: value.destinationCurrency,
                exchangeRate: exchangeRate.toString(),
                destinationAmount: destinationAmount.toFixed(3),
                transferFee: transferFee.toFixed(3),
                totalPayable: totalPayable.toFixed(3),
            },
        };

        const response = await createTransactionservices(payload);
        return res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            data: response,
        });
    } catch (error) {
        console.error("Create transaction error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message || "Transaction creation failed",
        });
    }
};
const getAllTransactionsController = async (req, res) => {
    try {
        const transactions = await transactionModel
            .find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Transactions retrieved successfully",
            count: transactions.length,
            data: transactions,
        });
    } catch (error) {
        console.error("Get transactions error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve transactions",
        });
    }
};
const getTransactionByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID",
            });
        }
        const transaction = await transactionModel.findById(id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Transaction retrieved successfully",
            data: transaction,
        });
    } catch (error) {
        console.error("Get transaction error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve transaction",
        });
    }
};
const updateTransactionController = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = UpdateTransactionSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.details.map((item) => item.message),
            });
        }
        const response = await updateTransactionServices(id, value);
        return res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            data: response,
        });
    } catch (error) {
        console.error("Update transaction error:", error.message);
        const statusCode =
            error.message === "Transaction not found" ? 404 : 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Transaction update failed",
        });
    }
};
const deleteTransactionController = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await deleteTransactionServices(id);
        return res.status(200).json({
            success: true,
            message: "Transaction deleted successfully",
            data: response,
        });
    } catch (error) {
        console.error("Delete transaction error:", error.message);
        const statusCode =
            error.message === "Transaction not found" ? 404 : 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Transaction deletion failed",
        });
    }
};

module.exports = {
    TransactionSchema,
    UpdateTransactionSchema,
    createTransactionController,
    getAllTransactionsController,
    getTransactionByIdController,
    updateTransactionController,
    deleteTransactionController,
};