import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import Transaction from "../models/transactionsModel.js";
import { verifyBankSchema, sendMoneyToOtherBankSchema } from "../utils/schema.js";
import User from "../models/usermodel.js";

dotenv.config();

const PAYSTACK_SK = process.env.PAYSTACK_SK


const getAllBanks = asyncHandler(async (req, res) => {


    try {
        const response = await axios.get('https://api.paystack.co/bank?currency=NGN', {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SK}`
            }
        })

        res
            .status(200)
            .json(
                {
                    status: "success",
                    message: "all banks",
                    data: response.data.data,
                    meta: {}
                })
    } catch (e) {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: { error: "invalid request" }
                })
    }
})

const resolveOtherBanks = asyncHandler(async (req, res) => {
    const { error, value } = verifyBankSchema.validate(req.body);

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

    try {
        const response = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${value.account_number}&bank_code=${value.code}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SK}`
            }
        })
        res
            .status(200)
            .json(response.data)
    } catch (e) {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: { error: "invalid request" }
                })
    }

})


const sendMoneyToOtherBanks = asyncHandler(async (req, res) => {

    const { error, value } = sendMoneyToOtherBankSchema.validate(req.body);

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

    const user = await User.findById(req.user._id);
    console.log(value.amount, user.accountBalance)

    if (Number(value.amount) > Number(user.accountBalance)) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: "insufficient balance"
                    }
                })
    }

    try {
        const data = {
            type: 'nuban',
            name: value.name,
            account_number: value.account_number,
            bank_code: value.code,
            currency: 'NGN'
        }
        const response = await axios.post(`https://api.paystack.co/transferrecipient`, data, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SK}`
            }
        })

        const recipient_code = response?.data?.data?.recipient_code;

        const ref = uuidv4()

        const sendMonetPayload = {
            source: "balance",
            amount: value.amount,
            reference: ref,
            recipient: recipient_code,
            reason: "savings"
        }

        const sendMoney = await axios.post(`https://api.paystack.co/transfer`, sendMonetPayload, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SK}`
            }
        })

        const transaction = new Transaction({
            reference: ref,
            amount: value.amount,
            name: value.name,
            type: 'debit',
            status: 'pending'
        })

        await transaction.save();
        user.transactions.push(transaction);
        await user.save();

        console.log(sendMoney.data);

        res
            .status(200)
            .json(
                {
                    status: "success",
                    message: "all banks",
                    meta: {}
                })
    } catch (e) {
        console.log(e.response.data)
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "",
                    meta: { error: "Provider not available" }
                })
    }

})

export {
    getAllBanks,
    resolveOtherBanks,
    sendMoneyToOtherBanks
}