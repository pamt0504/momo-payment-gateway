import * as crypto from 'crypto';
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
                lang: 'en',
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
        };

    }
}
