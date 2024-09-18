const axios = require('axios');
const crypto = require('crypto');

// Replace with your Swish credentials
const PAYEE_ALIAS = '1231111111';
const CALLBACK_URL = ''; // Replace with your actual callback URL
const SWISH_API_URL = 'https://mss.cpc.getswish.net/swish-cpcapi/api/v2/paymentrequests/';

const createId = () => {
    // Generate a unique UUID for the payment request
    return crypto.randomUUID();
};

const createPaymentRequest = async (amount, message, payerAlias) => {
    const instructionUUID = createId();

    const data = {
        payeeAlias: PAYEE_ALIAS,
        currency: 'SEK',
        callbackUrl: CALLBACK_URL,
        amount,
        message,
        payerAlias
    };

    try {
        const response = await axios.put(
            `${SWISH_API_URL}${instructionUUID}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    // Add any necessary authentication headers here
                },
            }
        );

        if (response.status === 201) {
            return { id: instructionUUID }; // or response.data if you need more details
        } else {
            throw new Error(`Failed to create payment request: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Swish payment request error:', error.message);
        throw new Error('Swish payment request failed');
    }
};

module.exports = {
    createPaymentRequest,
};
