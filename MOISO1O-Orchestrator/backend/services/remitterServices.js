const RemitterModel = require("../models/remitterModel");

// Create remitter service
const createRemitter = async (remitterData) => {
    const existingRemitter = await RemitterModel.findOne({
        customerId: remitterData.customerId,
    });

    if (existingRemitter) {
        throw new Error("Remitter already exists");
    }

    const remitter = await RemitterModel.create({
        ...remitterData,
        kycStatus: "PENDING",
        status: "ACTIVE",
    });

    return remitter;
};

const getAllRemitters = async () => RemitterModel.find({});

// Get remitter service
const getRemitterId = async (remitterId) => {
    const remitter = await RemitterModel.findById(remitterId);

    if (!remitter) {
        throw new Error("Remitter not found");
    }

    return remitter;
};

// Update remitter service
const updateRemitter = async (remitterId, updateData) => {
    const remitter = await RemitterModel.findByIdAndUpdate(
        remitterId,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!remitter) {
        throw new Error("Remitter not found");
    }

    return remitter;
};

const deleteRemitter = async (remitterId) => {
    const remitter = await RemitterModel.findByIdAndDelete(remitterId);

    if (!remitter) {
        throw new Error("Remitter not found");
    }

    return remitter;
};

module.exports = {
    getAllRemitters,
    getRemitterId,
    createRemitter,
    updateRemitter,
    deleteRemitter,
};
