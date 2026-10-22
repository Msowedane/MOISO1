const beneficiaryModel = require('../models/beneficiaryModel');

const createBeneficiaryServices = async (payload) => beneficiaryModel.create(payload);

const getAllBeneficiaryservices = async () => beneficiaryModel.find({});

const getBeneficiaryByIdService = async (id) => {
    const beneficiary = await beneficiaryModel.findById(id);

    if (!beneficiary) {
        throw new Error('Beneficiary not found');
    }

    return beneficiary;
};

const updateBeneficiaryServices = async (id, updateData) => {
    const beneficiary = await beneficiaryModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    if (!beneficiary) {
        throw new Error('Beneficiary not found');
    }

    return beneficiary;
};

const deleteBeneficiaryServices = async (id) => {
    const beneficiary = await beneficiaryModel.findByIdAndDelete(id);

    if (!beneficiary) {
        throw new Error('Beneficiary not found');
    }

    return beneficiary;
};

module.exports = {
    createBeneficiaryServices,
    getAllBeneficiaryservices,
    getBeneficiaryByIdService,
    updateBeneficiaryServices,
    deleteBeneficiaryServices,
};
