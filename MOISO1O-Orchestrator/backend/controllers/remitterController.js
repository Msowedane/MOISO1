
const remitterServices = require("../services/remitterServices");
const Joi = require("joi");
const mongoose = require("mongoose");

// Remitter validation
const remitterValidation = Joi.object({
    customerId: Joi.string()
        .trim()
        .min(5)
        .max(8)
        .required(),

    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required(),

    lastName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required(),

    dateOfBirth: Joi.date()
        .iso()
        .less("now")
        .required(),

    email: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        .required()
        .messages({
            "string.pattern.base": "Please enter a valid email address",
            "string.empty": "Email is required",
            "any.required": "Email is required",
        }),

    mobileNumber: Joi.string()
        .pattern(/^\+[1-9]\d{7,14}$/)
        .required()
        .messages({
            "string.pattern.base":
                "Enter a valid mobile number with country code",
        }),

    nationality: Joi.string()
        .trim()
        .required(),

    countryOfResidence: Joi.string()
        .trim()
        .required(),

    address: Joi.string()
        .trim()
        .min(5)
        .max(100)
        .required(),
});

// CREATE REMITTER
const createRemitter = async (req, res) => {
    try {
        const { error, value } = remitterValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.details.map((err) => err.message),
            });
        }

        const response = await remitterServices.createRemitter(value);

        return res.status(201).json({
            success: true,
            message: "Remitter created successfully",
            data: response,
        });
    } catch (error) {
        if (error.message === "Remitter already exists") {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to create remitter",
        });
    }
};

// GET ALL REMITTERS
const getAllRemitters = async (req, res) => {
    try {
        const response = await remitterServices.getAllRemitters();

        return res.status(200).json({
            success: true,
            message: "Remitters retrieved successfully",
            data: response,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve remitters",
        });
    }
};

// GET REMITTER BY ID
const getRemitter = async (req, res) => {
    try {
        const { remitterId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(remitterId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid remitter ID",
            });
        }

        const response = await remitterServices.getRemitterId(remitterId);

        return res.status(200).json({
            success: true,
            message: "Remitter retrieved successfully",
            data: response,
        });
    } catch (error) {
        if (error.message === "Remitter not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve remitter",
        });
    }
};

// UPDATE REMITTER (PATCH)
const updateRemitter = async (req, res) => {
    try {
        const { remitterId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(remitterId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid remitter ID",
            });
        }

        // Only allow editable profile fields
        const allowedFields = [
            "firstName",
            "lastName",
            "dateOfBirth",
            "email",
            "mobileNumber",
            "nationality",
            "countryOfResidence",
            "address",
        ];

        const updateData = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one valid field to update",
            });
        }

        // Make fields optional for PATCH
        const updateSchema = remitterValidation.fork(
            Object.keys(remitterValidation.describe().keys),
            (schema) => schema.optional()
        );

        const { error, value } = updateSchema.validate(updateData, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.details.map((err) => err.message),
            });
        }

        const response = await remitterServices.updateRemitter(
            remitterId,
            value
        );

        return res.status(200).json({
            success: true,
            message: "Remitter updated successfully",
            data: response,
        });
    } catch (error) {
        if (error.message === "Remitter not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update remitter",
        });
    }
};

// DELETE REMITTER
const deleteRemitter = async (req, res) => {
    try {
        const { remitterId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(remitterId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid remitter ID",
            });
        }

        const response = await remitterServices.deleteRemitter(remitterId);

        return res.status(200).json({
            success: true,
            message: "Remitter deleted successfully",
            data: {
                remitterId: response._id,
            },
        });
    } catch (error) {
        if (error.message === "Remitter not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete remitter",
        });
    }
};

module.exports = {
    createRemitter,
    getAllRemitters,
    getRemitter,
    updateRemitter,
    deleteRemitter,
};