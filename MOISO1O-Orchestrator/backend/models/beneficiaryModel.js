const mongoose = require('mongoose')

const beneficiarySchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    BankName: {
        type: String,
        required: true
    },
    BranchName: {
        type: String,
        required: true
    },
    AccountNumber: {
        type: String,
        required: true
    },
    IFSC_Code: {
        type: String,
        required: true
    },
    Account_Type: {
        type: String,
        enum: [
            'savings', 'current'
        ],
        required: true
    },
    Additonal_Information: {
        nickname: {
            type: String
        }
    }
},
    {
        timestamps: true
    }
)
const beneficiaryModel = mongoose.model("beneficiary", beneficiarySchema)

module.exports = beneficiaryModel