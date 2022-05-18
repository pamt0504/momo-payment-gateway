# API MoMo Payment Gateway

The plugin will make it easier to integrate Momo Wallet payments via QR code.

## Process flow
![Flow](https://raw.githubusercontent.com/pamt0504/momo-payment-gateway/master/process-flow.svg)

## Installation
The first, Momo partner must be successfully registered.
Use the package manager [npm](https://www.npmjs.com/) to install.

```bash
npm i momo-payment-gateway
```

## Usage
```javascript
const MomoPayment = require('momo-payment-sdk');

/* HOST_WEBHOOK => Partner API. Used by MoMo to submit payment results by IPN method (server-to-server) method */
const HOST_WEBHOOK = process.env.HOST_WEBHOOK;

/* constructor: partnerCode, accessKey, secretKey ,apiEndpoint=> provide by Momo*/
class MomoPaymentService {
  constructor( partnerCode, accessKey, secretKey, endpoint) {
    this.momoPayment = new MomoPayment({
      partnerCode,
      accessKey,
      secretKey,
      apiEndpoint,
    });
  }
/* Return the URL payment by QR code */
  async createPayment({
    orderId,
    amount,
    orderInfo = 'Your message',
    returnUrl = 'https://your-website.com',
  }) {
    try {
      if (!orderId || !amount || !message || !orderInfo) {
        throw new Error('invalid input');
      }
      const result = await this.momoPayment.createPayment({
        requestId: `ID-${orderId}-${Math.round(Date.now() / 1000)}`,
        orderId: `${orderId}-${Math.round(Date.now() / 1000)}`,
        amount: Number(amount),
        orderInfo,
        returnUrl,
        ipnUrl: HOST_WEBHOOK,
      });
      return result;
    } catch (error) {
      console.error(error)
      throw error;
    }
  }
  
/* Rollback the transaction */
  async refundPayment({ requestId, orderId, amount, transId }) {
    try {
      if (!orderId || !amount || !transId) {
        throw new Error('invalid input');
      }
      const result = await this.momoPayment.refundPayment({
        requestId,
        orderId,
        amount,
        transId,
      });
      return result.data;
    } catch (error) {
      console.error(error)
      throw error;
    }
  }

/* The function for verify webhook request */
  verifySignature({
    signature,
    requestId,
    orderId,
    amount,
    orderInfo,
    orderType,
    transId,
    message,
    localMessage,
    responseTime,
    errorCode,
    payType,
  }) {
    try {
      const result = this.momoPayment.verifySignature({
        signature,
        requestId,
        orderId,
        amount,
        orderInfo,
        orderType,
        transId,
        message,
        localMessage,
        responseTime,
        errorCode,
        payType,
      });
      return result;
    } catch (error) {
      console.error(error)
      throw error;
    }
  }
}
module.exports = MomoPaymentService;
```

## Contributing
Pull requests are welcome

## Important
Mail:  hoangtran2198@gmail.com
Skype: tranminhhoangnct@gmail.com
Documentation: https://developers.momo.vn/v2/#/docs/qr_payment

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Team
[![Hoang Tran](https://github.com/hoangtran2.png?size=100)](https://github.com/hoangtran2)
| [Hoang Tran](https://hoangtran.dev) |                                          