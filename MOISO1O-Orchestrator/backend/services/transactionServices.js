
const transactionModel = require("../models/transactionModel");
const mongoose = require("mongoose");

const createTransactionservices = async (payload) => {
    try {
        if (!payload || typeof payload !== "object") {
            throw new Error("Transaction payload is required");
        }
        if (payload._id) {
            if (!mongoose.isValidObjectId(payload._id)) {
                throw new Error("Invalid transaction ID");
            }
            const existingTransaction =
                await transactionModel.findById(payload._id);

            if (existingTransaction) {
                throw new Error("Transaction already exists");
            }
        }
        const response = await transactionModel.create(payload);
        return response;
    } catch (error) {
        console.error("Create transaction error:", error.message);
        throw error;
    }
};

const getAllTransactionsServices = async () => {
    try {
        const transactions = await transactionModel
            .find()
            .sort({ createdAt: -1 });
        return transactions;
    } catch (error) {
        console.error("Get all transactions error:", error.message);
        throw error;
    }
};

const getTransactionByIdServices = async (transactionId) => {
    try {
        if (!mongoose.isValidObjectId(transactionId)) {
            throw new Error("Invalid transaction ID");
        }
        const transaction =
            await transactionModel.findById(transactionId);
        if (!transaction) {
            throw new Error("Transaction not found");
        }
        return transaction;
    } catch (error) {
        console.error("Get transaction by ID error:", error.message);
        throw error;
    }
};

const updateTransactionServices = async (transactionId, payload) => {
    try {
        if (!mongoose.isValidObjectId(transactionId)) {
            throw new Error("Invalid transaction ID");
        }
        if (
            !payload ||
            typeof payload !== "object" ||
            Object.keys(payload).length === 0
        ) {
            throw new Error("Update payload is required");
        }
        const { _id, ...updateFields } = payload;
        if (Object.keys(updateFields).length === 0) {
            throw new Error("No valid fields provided for update");
        }
        const response = await transactionModel.findByIdAndUpdate(
            transactionId,
            { $set: updateFields },
            {
                new: true,
                runValidators: true,
            }
        );
        if (!response) {
            throw new Error("Transaction not found");
        }
        return response;
    } catch (error) {
        console.error("Update transaction error:", error.message);
        throw error;
    }
};

const deleteTransactionServices = async (transactionId) => {
    try {
        if (!mongoose.isValidObjectId(transactionId)) {
            throw new Error("Invalid transaction ID");
        }
        const response = await transactionModel.findByIdAndDelete(transactionId);
        if (!response) {
            throw new Error("Transaction not found");
        }
        return response;
    } catch (error) {
        console.error("Delete transaction error:", error.message);
        throw error;
    }
};

module.exports = {
    createTransactionservices,
    getAllTransactionsServices,
    getTransactionByIdServices,
    updateTransactionServices,
    deleteTransactionServices,
};