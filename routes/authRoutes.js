import express from "express";
const router = express.Router();
import { signUp, loginUser, verifyEmail } from "../controllers/authControllers.js";


router.route('/signup').post(signUp);
router.route('/login').post(loginUser)
router.route('/verify-email').post(verifyEmail)


export default router