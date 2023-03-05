import express from 'express'
const router = express.Router();
import { protect } from '../middlewares/middlewares.js';

import { getAllBanks, resolveOtherBanks, sendMoneyToOtherBanks } from '../controllers/transfer.js';

router.route('/banks')
.get(protect, getAllBanks)
.post(protect, resolveOtherBanks)


router.route('/other-banks').post(protect, sendMoneyToOtherBanks)

export default router