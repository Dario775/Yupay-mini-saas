// Quick test to verify MercadoPago token
const MP_TOKEN = 'APP_USR-7159438275782337-020622-03858ee2fe6c8b59bba4575792b31e77-3188060350';

const testData = {
    items: [
        {
            id: 'test-123',
            title: 'Plan Básico - Yupay',
            description: 'Suscripción mensual al plan Básico',
            quantity: 1,
            currency_id: 'ARS',
            unit_price: 5000
        }
    ],
    payer: {
        email: 'test@example.com'
    },
    back_urls: {
        success: 'https://yupay.com.ar/dashboard?upgrade=success',
        failure: 'https://yupay.com.ar/dashboard?upgrade=failure',
        pending: 'https://yupay.com.ar/dashboard?upgrade=pending'
    },
    auto_return: 'approved',
    external_reference: 'test-123',
    statement_descriptor: 'YUPAY'
};

fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${MP_TOKEN}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
})
    .then(res => {
        console.log('Status:', res.status);
        return res.text();
    })
    .then(text => {
        console.log('Response:', text);
        try {
            const json = JSON.parse(text);
            console.log('\nParsed:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Not JSON');
        }
    })
    .catch(err => {
        console.error('Error:', err);
    });
