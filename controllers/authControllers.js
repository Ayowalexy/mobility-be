import asyncHandler from "express-async-handler";
import User from "../models/usermodel.js";
import { signupscchema, loginSchema, phoneOtpSchema, otpSchema, } from "../utils/schema.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator'
import sendAAuthOtp from "../utils/sendAuthEmail.js";
import { sendSMS } from "../utils/sendOtpToPhone.js";

const { sign, verify } = jwt;



const signUp = asyncHandler(async (req, res) => {
    const { error, value } = signupscchema.validate(req.body);

    if (error) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: error.message
                    }
                })
    }

    const hash = await bcrypt.hashSync(value.password, 12);
    const user = new User({ ...value, password: hash });
    await user.save();
    await sendAAuthOtp(user._id);
    res
        .status(201)
        .json(
            {
                status: "success",
                message: "user created scuccessfully, an otp has been sent to verify your email",
                meta: {}
            })
})


const loginUser = asyncHandler(async (req, res) => {

    const { error, value } = loginSchema.validate(req.body);

    if (error) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: error.message
                    }
                })
    }

    const user = await User.findOne({ email: value.email })


    if (user) {
        if (await user.isEmailVerified()) {

            const match = await bcrypt.compareSync(value.password, user.password);

            if (match) {
                const token = sign({ email: user.email, id: user._id.toString() }, process.env.SECRET)


                const userData = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    createdAt: user.createdAt,
                    emailVerified: user.emailVerified,
                    accountNumber: user.accountNumber,
                    accountBalance: user.accountBalance
                }
                res
                    .status(200)
                    .json(
                        {
                            data: userData,
                            token: token,
                            status: "success",
                            meta: {}
                        })

            } else {
                res
                    .status(401)
                    .json(
                        {
                            status: "error",
                            message: 'invalid request',
                            meta: {
                                error: 'Email of password is incorrect'
                            }
                        })
            }
        } else {
            res
                .status(401)
                .json(
                    {
                        status: "error",
                        message: 'invalid request',
                        meta: {
                            error: 'Email is not verified'
                        }
                    })
        }

    } else {
        res.status(401).json({ "status": "error", "message": "invalid error", "meta": { "error": "user does not exist" } })
    }
})


const sendOtpToPhone = asyncHandler(async (req, res) => {

    const user = await User.findOne({ phone: req.params.phone });
    if (user) {
        const otp = otpGenerator.generate(5, {
            digits: true,
            specialChars: false,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false
        })

        const capitalizeOtp = otp.toString().toUpperCase();

        const signedToken = sign({ capitalizeOtp }, process.env.SECRET)

        user.otpToken = signedToken;
        await user.save();
        let msg = `Verify your phone number with ${otp}. This one time password lasts for 10 minutes`
        await sendSMS(user.phone, msg);
        res
            .status(200)
            .json(
                {
                    status: "success",
                    message: "OTP sent to your phone number",
                    meta: {}
                })

    } else {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "",
                    meta: { message: "user does not exist" }
                })
    }
})

const verifyPhoneOtp = asyncHandler(async (req, res) => {
    const { error, value } = phoneOtpSchema.validate(req.body);

    if (error) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: error.message
                    }
                })
    }

    const user = await User.findOne({ phone: value.phone });

    if (user) {
        const otpToken = user.otpToken;

        try {
            const decoded = verify(otpToken, process.env.SECRET);

            if (value.otp === decoded.capitalizeOtp) {

                const accountNumber = user.phone.slice(1,)
                user.phoneVerfied = true;
                user.otpToken = ''
                user.accountNumber = accountNumber;
                await user.save();

                res
                    .status(200)
                    .json(
                        {
                            status: "success",
                            message: "Phone verified scuccessfully",
                            meta: {}
                        })
            } else {
                res.status(401)
                    .json(
                        {
                            status: "error",
                            message: "invalid request",
                            meta: {
                                error: "OTP does match"
                            }
                        })
            }
        } catch (e) {
            console.log(e)
            return res
                .status(404)
                .json(
                    {
                        status: "error",
                        message: "invalid request",
                        meta: {
                            error: "OTP has exprired"
                        }
                    })
        }
    } else {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: 'User does not exist'
                    }
                })
    }

})

const verifyEmail = asyncHandler(async (req, res) => {

    const { error, value } = otpSchema.validate(req.body);
    if (error) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: error.message
                    }
                })
    }

    const user = await User.findOne({ email: value.email });

    if (user) {
        const otpToken = user.otpToken;


        try {
            const decoded = verify(otpToken, process.env.SECRET);

            if (value.otp === decoded.capitalizeOtp) {
                user.emailVerified = true;
                user.otpToken = ''
                // await user.save();

                const otp = otpGenerator.generate(5, {
                    digits: true,
                    specialChars: false,
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false
                })

                const capitalizeOtp = otp.toString().toUpperCase();

                const signedToken = sign({ capitalizeOtp }, process.env.SECRET)

                user.otpToken = signedToken;
                await user.save();
                let str = user.phone;
                let idx = str.split('').findIndex(num => num === '0')
                let phone = str.slice(0, idx).concat(str.slice(Number(idx) + 1,))

                let msg = `Verify your phone number with ${otp}. This one time password lasts for 10 minutes`
                await sendSMS(phone, msg);

                res
                    .status(200)
                    .json(
                        {
                            status: "success",
                            message: "Email verified scuccessfully",
                            meta: {}
                        })
            } else {
                res.status(401)
                    .json(
                        {
                            status: "error",
                            message: "invalid request",
                            meta: {
                                error: "OTP does match"
                            }
                        })
            }
        } catch (e) {
            console.log(e)
            return res
                .status(404)
                .json(
                    {
                        status: "error",
                        message: "invalid request",
                        meta: {
                            error: "OTP has exprired"
                        }
                    })
        }
    } else {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: 'User does not exist'
                    }
                })
    }
})


const getUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        accountNumber: user.accountNumber,
        accountBalance: user.accountBalance
    }
    res
        .status(200)
        .json(
            {
                status: "success",
                message: "User data",
                data: userData,
                meta: {}
            })

})

export {
    signUp,
    loginUser,
    verifyEmail,
    sendOtpToPhone,
    verifyPhoneOtp,
    getUserDetails
}