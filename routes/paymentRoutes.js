const express = require('express');
const router = express.Router();
const { createPayment, executePayment, cancelPayment } = require('../controllers/PaymentController');

router.post('/create-payment', createPayment);
router.get('/payment/success', executePayment);
router.get('/payment/cancel', cancelPayment);

module.exports = router;
