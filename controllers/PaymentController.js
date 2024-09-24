const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const paypal = require('paypal-rest-sdk');

paypal.configure({
    "mode": 'sandbox', // or 'live' for production
    "client_id": "ATJPwtDcqmNRQVIPgKEscjet6l4KDvy6CCy67VELzb-IzsN-EnOsqRSyxZq0UjpvMVgO4SnxzZ4lQpnh",
    "client_secret": 'EGc1daAUjqk2SyMT_B7aeJs1JcgXgQPCT2zRs9xr8Y1Sqd-HEaZSTJVMq0EL1gd09fLspSu82pxKNrjQ',
});

// 1. Create Payment
const createPayment = async (req, res) => {
    const { totalAmount } = req.body;

    const paymentData = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:5000/payment/success",
            "cancel_url": "http://localhost:5000/payment/cancel"
        },
        "transactions": [{
            "amount": {
                "total": totalAmount,  // The amount to be charged
                "currency": "USD"
            },
            "description": "Payment for services"
        }]
    };

    // Create a payment with PayPal
   await paypal.payment.create(paymentData, function (error, payment) {
        if (error) {
            console.error(error);
            res.status(500).send({ error: 'Payment creation failed' });
        } else {
          console.log((payment));
          let data = payment
          res.json(data)
        }
    });
};


// 2. Payment Success
const executePayment = async (req, res) => {
    const { paymentId, PayerID } = req.query; // Get paymentId and PayerID from PayPal response

    const execute_payment_data = {
        payer_id: PayerID,
        transactions: [{
            amount: {
                total: '10.00', // Amount to capture (this should match the payment creation amount)
                currency: "USD"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_data, function (error, payment) {
        if (error) {
            console.error(error);
            res.status(500).send({ error: 'Payment execution failed' });
        } else {
            res.send("Payment successful");
        }
    });
};

// 3. Payment Cancel
const cancelPayment = (req, res) => {
    res.send('Payment was canceled');
};

module.exports = {
    createPayment,
    executePayment,
    cancelPayment
};
