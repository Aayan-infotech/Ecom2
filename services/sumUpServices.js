// sumupService.js
const axios = require('axios');

// Function to create a SumUp payment
exports.createPaymentWithSumUp = async (amount, currency) => {
    const accessToken = await getSumUpAccessToken();
    const paymentDetails = {
        amount: amount,
        currency: currency,
        payToEmail: 'merchant@example.com',
        description: 'Payment via SumUp',
        merchantCode: 'your-merchant-code',
        redirectUrl: 'your-redirect-url',
    };

    const response = await axios.post(
        'https://api.sumup.com/v0.1/checkouts',
        paymentDetails,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return response.data;
};

// Function to get the access token from SumUp
const getSumUpAccessToken = async () => {
    const response = await axios.post('https://api.sumup.com/token', null, {
        params: {
            grant_type: 'client_credentials',
            client_id: process.env.SUMUP_CLIENT_ID,
            client_secret: process.env.SUMUP_CLIENT_SECRET,
        },
    });
    return response.data.access_token;
};
