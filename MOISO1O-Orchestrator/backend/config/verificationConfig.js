const joi = require('joi');

const envSchemaVariables = joi.object({
    verficationServiceUrl: joi.string().uri().default('')
}).unknown();

const { error, value: envVariables } = envSchemaVariables.validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
const Moiso_Verification_Config = {
    verificationCodeLength: {
        serviceUrl: envVariables.VERIFICATION_SERVICE_URL,
    }
}
module.exports = Moiso_Verification_Config;
