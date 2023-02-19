import dotenv from "dotenv";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import otpGenerator from 'otp-generator'
import User from "../models/usermodel.js";
const { sign, verify } = jwt;


dotenv.config();


const sendAAuthOtp = async (id) => {

    const user = await User.findById(id);
    if (user) {


        const API_KEY = process.env.SG_API;

        sgMail.setApiKey(API_KEY);
        const otp = otpGenerator.generate(6, { digits: true, specialChars: false })

        const capitalizeOtp = otp.toString().toUpperCase();

        const signedToken = sign({ capitalizeOtp }, process.env.SECRET, {
            expiresIn: 60 * 5,
        })

        user.otpToken = signedToken;

        await user.save();

        const name = user.firstName.concat(' ', user.lastName)

        const message = {
            to: user.email,
            from: {
                name: "Mobility Support Team",
                email: "goldenimperialswifttech@gmail.com"
            },
            text: "Hello Sample text",
            subject: "Verify OTP",
            html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Mobility</a>
                        </div>
                        <p style="font-size:1.1em">Hi ${name},</p>
                        <p>Thank you for choosing Mobility. Use the following OTP to complete your Authentication procedures. OTP is valid for 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${capitalizeOtp}</h2>
                        <p style="font-size:0.9em;">Regards,<br />Mobility</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                        <p>Mobility Inc</p>
                        <p>Lagos, Nigeria</p>
                        </div>
                    </div>
                    </div>`
        }

        try {
            const response = await sgMail.send(message)
            return response.data
        } catch (e) {
            console.log(e)
        }
    }

}

export default sendAAuthOtp;