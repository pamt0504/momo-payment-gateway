import crypto from 'crypto';
import fetch from 'node-fetch';

export class MomoPayment {
  private partnerCode: string;
  private accessKey: string;
  private secretKey: string;
  private endpoint: string;
  constructor({ partnerCode, accessKey, secretKey, endpoint }) {
    this.partnerCode = partnerCode;
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.endpoint = endpoint;
  }

  async createPayment({ requestId, orderId, amount, orderInfo, redirectUrl, ipnUrl, extraData = '' }) {
    try {
      if (!orderId || !amount || !orderInfo || !redirectUrl || !ipnUrl) {
        throw new Error('Invalid input');
      }

      const requestType = 'captureWallet';
      const rawSignature =
        'accessKey=' +
        this.accessKey +
        '&amount=' +
        amount +
        '&extraData=' +
        extraData +
        '&ipnUrl=' +
        ipnUrl +
        '&orderId=' +
        orderId +
        '&orderInfo=' +
        orderInfo +
        '&partnerCode=' +
        this.partnerCode +
        '&redirectUrl=' +
        redirectUrl +
        '&requestId=' +
        requestId +
        '&requestType=' +
        requestType;
      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(rawSignature)
        .digest('hex');
      const res = await fetch(`${this.endpoint}/v2/gateway/api/create`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          accessKey: this.accessKey,
          partnerCode: this.partnerCode,
          requestType,
          ipnUrl,
          redirectUrl,
          orderId,
          amount,
          orderInfo,
          requestId,
          extraData,
          signature,
          lang: 'vi',
        }),
      });
      return await res.json();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async refundPayment({ requestId, orderId, amount, transId }) {
    if (!orderId || !amount || !transId || !requestId) {
      throw new Error('Invalid input');
    }

    const signatureRaw = `accessKey=${this.accessKey}&amount=${amount}&description=&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}&transId=${transId}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureRaw)
      .digest('hex');

    const res = await fetch(`${this.endpoint}/v2/gateway/api/refund`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        requestId,
        partnerCode: this.partnerCode,
        orderId,
        amount,
        transId,
        lang: 'vi',
        signature,
      }),
    });

    return await res.json();
  }

  verifySignature({
    signature,
    requestId,
    orderId,
    amount,
    orderInfo,
    orderType,
    transId,
    message,
    responseTime,
    resultCode,
    payType,
    extraData = '',
  }) {
    if (
      !requestId ||
      !amount ||
      !orderId ||
      !orderInfo ||
      !orderType ||
      !transId ||
      !message ||
      !responseTime ||
      !resultCode ||
      !payType
    ) {
      throw new Error('invalid input');
    }
    const signatureRaw = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${this.partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const genSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureRaw)
      .digest('hex');

    return genSignature === signature;
  }

  async verifyPayment({
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  }) {
    orderInfo = decodeURI(orderInfo);
    message = decodeURI(message);
    const signatureRaw = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const signatureValue = await crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureRaw)
      .digest('hex');
    if (resultCode !== '0') {
      throw new Error('The transaction was not completed.');
    }
    if (signatureValue !== signature) {
      throw new Error('The transaction was not completed.');
    }
    return {
      type: 'momo',
      orderId,
      transId,
      requestId,
      amount,
    };

  }

  async checkRefundMomoThrowERR(resultCode) {
    switch (resultCode) {
      case 0: return 'Successful';

      case 11: return 'Access denied.';
      case 12: return 'Unsupported API version for this request.'
      case 13: return 'Merchant authentication failed.'
      case 20: return 'Bad format request.'
      case 21: return 'Invalid transaction amount.'
      case 40: return 'Duplicated requestId.'
      case 41: return 'Duplicated orderId.'
      case 42: return "Invalid orderId or orderId is not found."
      case 43: return 'Request rejected due to an analogous transaction is being processed.No	Before retry, please check if another analogous transaction is being processed which restricts this request.'
      case 10: return 'System is under maintenance.No	Please retry after the maintenance is over.'
      case 99: return 'Unknown error.Yes	Please contact MoMo for more details.'
      case 1000: return 'Transaction is initiated, waiting for user confirmation.';
      case 1001: return 'Transaction failed due to insufficient funds.Yes'
      case 1002: return 'Transaction rejected by the issuers of the payment methods.Yes	Please choose other payment methods.'
      case 1003: return 'Transaction cancelled after successfully authorized.Yes	The transaction was canceled by merchant or MoMo system due to timeout handlers.Please mark the transaction as failed.'
      case 1004: return 'Transaction failed because the amount exceeds daily / monthly payment limit.Yes	Please mark the transaction as failed, and retry another day.'
      case 1005: return 'Transaction failed because the url or QR code expired.Yes	Please send another payment request.'
      case 1006: return 'Transaction failed because user has denied to confirm the payment.Yes	Please send another payment request.'
      case 1007: return 'Transaction rejected due to inactive user\'s eWallet account.Yes	Please proceed with another payment method which is not associated with this eWallet account.For refund, you can also contact MoMo for help.'
      case 1026: return 'Transaction restricted due to promotion rules.Yes	Please contact MoMo for the restriction details.'
      case 1080: return 'Refund rejected.The original transaction cannot be found.Yes	Please check if the original orderId or TID used in the request is correct.'
      case 1081: return 'Refund rejected.The original transaction might have been refunded.Yes	Please check if the original transaction has already been refunded, or the amount of your refund request exceeds the refundable amount.'
      case 2001: return 'Transaction failed due to invalid token.Yes	The token has been deleted, please update accordingly.'
      case 2007: return 'Transaction failed due to inactive token.Yes	The token is inactive due to user decided to temporary lock the binding.'
      case 3001: return 'Binding failed because user has denied to confirm the authorization.Yes'
      case 3002: return 'Binding rejected due to authorization restrictions.Yes	Please contact MoMo for the restriction details.'
      case 3003: return 'Unbinding rejected due to authorization restrictions.Yes	Please contact MoMo for the restriction details.'
      case 3004: return 'Token cannot be provoked due to pending transactions.Yes	Please contact MoMo for the restriction details.'
      case 4001: return 'Transaction restricted due to incomplete KYCs.Yes'
      case 4010: return 'OTP verification failed.Yes	User authentication failed.Please request another authentication.'
      case 4011: return 'OTP is not sent or timeout.Yes	Please request to send another OTP.'
      case 4100: return 'Transaction failed because user has failed to login.Yes'
      case 4015: return '3DS verification failed.Yes	User authentication failed.Please request another authentication verification for retry.'
      case 9000: return 'Transaction is authorized successfully.';
      case 8000: return 'Transaction is pre-authorized, waiting for user confirmation.';
      case 7000: return 'Transaction is being processed.';
    }
  }
}

