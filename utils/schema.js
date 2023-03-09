import Joi from 'joi';


const signupscchema = Joi.object({
    firstName: Joi
        .string()
        .required(),
    lastName: Joi
        .string()
        .required(),
    password: Joi
        .string()
        .required(),
    email: Joi
        .string()
        .email()
        .required(),
    phone: Joi
        .string()
        .required(),
    route: Joi
        .string(),
    licence: Joi
        .string(),
    car_type: Joi
        .string(),
    park: Joi
        .string(),
    location: Joi
        .string(),
    route_from: Joi
        .string(),
    route_to: Joi
        .string(),
    state: Joi
        .string(),
    lga: Joi
        .string(),
    accountType: Joi
        .string(),
    referral_code: Joi
        .string()
        
})

const loginSchema = Joi.object({

    password: Joi
        .string()
        .required(),
    email: Joi
        .string()
        .email()
        .required(),
})

const emailSchema = Joi.object({
    email: Joi
        .string()
        .email()
        .required(),
})

const otpSchema = Joi.object({
    otp: Joi
        .string()
        .required(),
    email: Joi
        .string()
        .email()
        .required()
})

const phoneOtpSchema = Joi.object({
    otp: Joi
        .string()
        .required(),
    phone: Joi
        .string()
        .required()
})

const fundAccountSchema = Joi.object({
    authorization_code: Joi
        .string()
        .required(),
    amount: Joi
        .string()
        .required(),
    email: Joi
        .string()
        .email()
        .required()
})

const resolveSchema = Joi.object({
    account_number: Joi
        .string()
        .required()
})

const sendMoneySchema = Joi.object({
    accountNumber: Joi
        .string()
        .required(),
    amount: Joi
        .string()
        .required(),
})


const verifyBankSchema = Joi.object({
    account_number: Joi
        .string()
        .required(),
    code: Joi
        .string()
        .required(),
})

const sendMoneyToOtherBankSchema = Joi.object({
    account_number: Joi
        .string()
        .required(),
    code: Joi
        .string()
        .required(),
    name: Joi
        .string()
        .required(),
    amount: Joi
        .string()
        .required()
})

const updatePasswordSchema = Joi.object({
    old_password: Joi
        .string()
        .required(),
    password: Joi
        .string()
        .required()
})

const resetPasswordSchema = Joi.object({
    password: Joi
        .string()
        .required(),
    email: Joi
        .string()
        .email()
        .required()
})


export {
    signupscchema,
    emailSchema,
    loginSchema,
    otpSchema,
    phoneOtpSchema,
    fundAccountSchema,
    resolveSchema,
    sendMoneySchema,
    verifyBankSchema,
    sendMoneyToOtherBankSchema,
    updatePasswordSchema,
    resetPasswordSchema
}