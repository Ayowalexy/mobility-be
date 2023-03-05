import express from "express";
const router = express.Router();
import { signUp, loginUser, verifyEmail, sendOtpToPhone, verifyPhoneOtp, getUserDetails, updatePassword } from "../controllers/authControllers.js";
import { canVerifyPhone, canConfirmPhone, protect } from '../middlewares/middlewares.js'

router.route('/signup').post(signUp);
router.route('/login').post(loginUser)
router.route('/verify-email').post(verifyEmail);
router.route('/verify-phone/:phone').get(sendOtpToPhone)
router.route('/confirm-phone').post( verifyPhoneOtp)
router.route('/details').get(protect, getUserDetails)
router.route('/update-password').post(protect, updatePassword)


export default router