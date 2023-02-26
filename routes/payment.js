import express from 'express'
const router = express.Router();
import { protect } from '../middlewares/middlewares.js';

import { 
    verifyCardTokenization, 
    fundAccount, 
    getAllUserTransactions,
    resolveAccount,
    sendFund,
    getUserCards
 } from '../controllers/payment.js';


router.route('/verify').post(verifyCardTokenization);
router.route('/fund').post(protect, fundAccount)
router.route('/transactions').get(protect, getAllUserTransactions)
router.route('/resolve').post(protect, resolveAccount)
router.route('/send').post(protect, sendFund)
router.route('/cards').get(protect, getUserCards)



export default router