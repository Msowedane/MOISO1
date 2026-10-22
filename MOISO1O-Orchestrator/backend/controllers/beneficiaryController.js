const Joi = require('joi');
const mongoose = require('mongoose');
const beneficiaryServices = require('../services/beneficiaryServices');

const beneficiaryValidation = Joi.object({
    fullname: Joi.string().trim().required(),
    mobileNumber: Joi.string()
        .pattern(/^(?:[0-9]{10,15}|\+[1-9]\d{7,14})$/)
        .required()
        .messages({
            'string.pattern.base': 'Enter a valid mobile number with 10-15 digits, or an international number with a +country code.',
        }),
    email: Joi.string()
        .trim()
        .email()
        .required()
        .messages({
            'string.email': 'Enter a valid email address, for example name@example.com.',
        }),
    BankName: Joi.string().trim().required(),
    BranchName: Joi.string().trim().required(),
    AccountNumber: Joi.string().trim().required(),
    IFSC_Code: Joi.string()
        .uppercase()
        .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
        .required()
        .messages({
            'string.pattern.base': 'Enter a valid 11-character IFSC code, for example ABCD0123456.',
        }),
    Account_Type: Joi.string().valid('savings', 'current').required(),
    Additonal_Information: Joi.object({
        nickname: Joi.string().trim().allow(''),
    }).optional(),
});

const sendNotFound = (res) => res.status(404).json({
    success: false,
    message: 'Beneficiary not found',
});

const createBeneficiaryController = async (req, res) => {
    const { error, value } = beneficiaryValidation.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.details.map((detail) => detail.message),
        });
    }

    try {
        const beneficiary = await beneficiaryServices.createBeneficiaryServices(value);
        return res.status(201).json({
            success: true,
            message: 'Beneficiary created successfully',
            data: beneficiary,
        });
    } catch (error) {
        console.error('Failed to create beneficiary:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create beneficiary',
        });
    }
};

const getAllBeneficiaryController = async (req, res) => {
    try {
        const beneficiaries = await beneficiaryServices.getAllBeneficiaryservices();
        return res.status(200).json({
            success: true,
            message: 'Beneficiaries retrieved successfully',
            data: beneficiaries,
        });
    } catch (error) {
        console.error('Failed to retrieve beneficiaries:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve beneficiaries',
        });
    }
};

const getBeneficiaryController = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid beneficiary ID',
        });
    }

    try {
        const beneficiary = await beneficiaryServices.getBeneficiaryByIdService(id);
        return res.status(200).json({
            success: true,
            message: 'Beneficiary retrieved successfully',
            data: beneficiary,
        });
    } catch (error) {
        if (error.message === 'Beneficiary not found') {
            return sendNotFound(res);
        }

        console.error('Failed to retrieve beneficiary:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve beneficiary',
        });
    }
};

const updateBeneficiaryController = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid beneficiary ID',
        });
    }

    const updateSchema = beneficiaryValidation.fork(
        Object.keys(beneficiaryValidation.describe().keys),
        (schema) => schema.optional()
    );
    const { error, value } = updateSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.details.map((detail) => detail.message),
        });
    }

    if (Object.keys(value).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Provide at least one valid field to update',
        });
    }

    try {
        const beneficiary = await beneficiaryServices.updateBeneficiaryServices(id, value);
        return res.status(200).json({
            success: true,
            message: 'Beneficiary updated successfully',
            data: beneficiary,
        });
    } catch (error) {
        if (error.message === 'Beneficiary not found') {
            return sendNotFound(res);
        }

        console.error('Failed to update beneficiary:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update beneficiary',
        });
    }
};

const deleteBeneficiaryController = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid beneficiary ID',
        });
    }

    try {
        const beneficiary = await beneficiaryServices.deleteBeneficiaryServices(id);
        return res.status(200).json({
            success: true,
            message: 'Beneficiary deleted successfully',
            data: {
                beneficiaryId: beneficiary._id,
            },
        });
    } catch (error) {
        if (error.message === 'Beneficiary not found') {
            return sendNotFound(res);
        }

        console.error('Failed to delete beneficiary:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete beneficiary',
        });
    }
};

module.exports = {
    createBeneficiaryController,
    getAllBeneficiaryController,
    getBeneficiaryController,
    updateBeneficiaryController,
    deleteBeneficiaryController,
};
