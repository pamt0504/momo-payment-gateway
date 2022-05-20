export declare class MomoPayment {
    private partnerCode;
    private accessKey;
    private secretKey;
    private endpoint;
    constructor({ partnerCode, accessKey, secretKey, endpoint }: {
        partnerCode: string;
        accessKey: string;
        secretKey: string;
        endpoint: string;
    });
    createPayment({ requestId, orderId, amount, orderInfo, redirectUrl, ipnUrl, extraData }: {
        requestId: string;
        orderId: string;
        amount: number;
        orderInfo: string;
        redirectUrl: string;
        ipnUrl: string;
        extraData?: string;
    }): Promise<unknown>;
    refundPayment({ requestId, orderId, amount, transId }: {
        requestId: string;
        orderId: string;
        amount: number;
        transId: number;
    }): Promise<unknown>;
    verifySignature({ signature, requestId, orderId, amount, orderInfo, orderType, transId, message, responseTime, resultCode, payType, extraData, }: {
        signature: string;
        requestId: string;
        orderId: string;
        amount: number;
        orderInfo: string;
        orderType: string;
        transId: number;
        message: string;
        responseTime: number;
        resultCode: number;
        payType: string;
        extraData?: string;
    }): boolean;
    verifyPayment({ partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature, }: {
        partnerCode: string;
        orderId: string;
        requestId: number;
        amount: number;
        orderInfo: string;
        orderType: string;
        transId: string;
        resultCode: number;
        message: string;
        payType: string;
        responseTime: number;
        extraData: string;
        signature: string;
    }): Promise<{
        orderId: string;
        requestId: string;
        amount: number;
        orderInfo: string;
        orderType: string;
        transId: string;
        resultCode: number;
        message: string;
        payType: string;
        responseTime: number;
        extraData: string;
    }>;
}
