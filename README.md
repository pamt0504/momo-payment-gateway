# Momo Wallet API-SDK

The module will make it easier for you to integrate with Momo Wallet payments by QR code

## Process flow
![Flow](https://raw.githubusercontent.com/hoangtran2/momo-payment-sdk/main/process-flow.png)

## Installation
Requires successful registration of Momo partner first
Use the package manager [npm](https://www.npmjs.com/) to install.

```bash
npm i momo-payment-sdk
```

## Usage
```javascript
const MomoPayment = require('momo-payment-sdk');

/* HOST_WEBHOOK => MoMo system will call to your URL for alert the result */
const HOST_WEBHOOK = process.env.HOST_WEBHOOK;

/*
 constructor: partnerCode, accessKey, secretKey => provided from Momo
 constructor: environment = "live" || "sandbox"
*/
class MomoPaymentService {
  constructor(partnerCode, accessKey, secretKey, environment) {
    this.momoPayment = new MomoPayment({
      partnerCode,
      accessKey,
      secretKey,
      environment,
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
        requestId: `ID-${orderId}`,
        orderId,
        amount: amount.toString(),
        orderInfo,
        returnUrl,
        notifyUrl: HOST_WEBHOOK,
      });
      return result.data;
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