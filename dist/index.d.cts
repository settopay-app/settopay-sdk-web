/**
 * Setto SDK 환경 설정
 *
 * bindings/ SDK는 독립적으로 배포되므로 자체 환경 상수를 정의합니다.
 */
declare const SETTO_ENVIRONMENTS: {
    /** SDK 로컬 개발용 (배포 빌드에서 제외) */
    readonly local: "http://localhost:3100";
    /** 개발 환경 */
    readonly development: "https://dev-wallet.settopay.com";
    /** 프로덕션 환경 */
    readonly production: "https://wallet.settopay.com";
};
type SettoEnvironment = keyof typeof SETTO_ENVIRONMENTS;

/**
 * Setto Web SDK 타입 정의
 */

/**
 * SDK 초기화 설정
 */
interface SettoSDKConfig {
    /** 고객사 ID */
    merchantId: string;
    /** 환경 설정 */
    environment: SettoEnvironment;
}
/**
 * 결제 요청 파라미터
 */
interface PaymentParams {
    /** 고객사 IdP Token (Firebase, Cognito 등) */
    idpToken?: string;
    /** 주문 ID */
    orderId: string;
    /** 결제 금액 */
    amount: number;
    /** 통화 (기본: USD) */
    currency?: string;
}
/**
 * 결제 상태
 */
declare const PaymentStatus: {
    readonly SUCCESS: "success";
    readonly FAILED: "failed";
    readonly CANCELLED: "cancelled";
};
type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];
/**
 * 결제 결과
 */
interface PaymentResult {
    /** 결제 상태 */
    status: PaymentStatusType;
    /** 블록체인 트랜잭션 해시 (성공 시) */
    txId?: string;
    /** Setto 결제 ID */
    paymentId?: string;
    /** 에러 메시지 (실패 시) */
    error?: string;
}
/**
 * postMessage 메시지 타입
 * wallet.settopay.com과 동기화 필요
 */
declare const MESSAGE_TYPES: {
    /** 결제 초기화 요청 */
    readonly INIT_PAYMENT: "INIT_PAYMENT";
    /** 결제 성공 */
    readonly PAYMENT_SUCCESS: "PAYMENT_SUCCESS";
    /** 결제 실패 */
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    /** 결제 취소 */
    readonly PAYMENT_CANCELLED: "PAYMENT_CANCELLED";
};

/**
 * Setto SDK 에러 코드
 *
 * Deep Link의 error 파라미터 및 SDK 내부에서 사용
 */
declare const SettoErrorCode: {
    readonly USER_CANCELLED: "USER_CANCELLED";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    readonly INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE";
    readonly TRANSACTION_REJECTED: "TRANSACTION_REJECTED";
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    readonly SESSION_EXPIRED: "SESSION_EXPIRED";
    readonly INVALID_PARAMS: "INVALID_PARAMS";
    readonly INVALID_MERCHANT: "INVALID_MERCHANT";
};
type SettoErrorCodeType = (typeof SettoErrorCode)[keyof typeof SettoErrorCode];
/**
 * Setto SDK 에러 클래스
 */
declare class SettoError extends Error {
    readonly code: SettoErrorCodeType;
    constructor(code: SettoErrorCodeType, message?: string);
    /**
     * 사용자 취소 에러인지 확인
     */
    isUserCancelled(): boolean;
    /**
     * 결제 관련 에러인지 확인
     */
    isPaymentError(): boolean;
}

/**
 * Setto Web SDK
 *
 * iframe + postMessage 방식으로 wallet.settopay.com과 통신하여 결제를 처리합니다.
 *
 * @example
 * ```typescript
 * import { SettoSDK } from '@setto/web-sdk';
 *
 * const setto = new SettoSDK({
 *   merchantId: 'merchant-123',
 *   environment: 'production',
 * });
 *
 * const result = await setto.openPayment({
 *   orderId: 'order-456',
 *   amount: 10000,
 *   idpToken: await getFirebaseIdToken(),
 * });
 * ```
 */

/**
 * Setto Web SDK
 *
 * 고객사 웹사이트에서 Setto 결제를 연동하기 위한 SDK입니다.
 * iframe으로 wallet.settopay.com을 로드하고 postMessage로 통신합니다.
 */
declare class SettoSDK {
    private readonly merchantId;
    private readonly baseUrl;
    private iframe;
    private overlay;
    private messageHandler;
    private rejectHandler;
    constructor(config: SettoSDKConfig);
    /**
     * 결제 창을 열고 결제를 진행합니다.
     *
     * @param params 결제 파라미터
     * @returns 결제 결과 Promise
     * @throws {SettoError} 결제 실패 또는 사용자 취소 시
     *
     * @example
     * ```typescript
     * try {
     *   const result = await setto.openPayment({
     *     orderId: 'order-456',
     *     amount: 10000,
     *     idpToken: await getFirebaseIdToken(),
     *   });
     *   console.log('결제 성공:', result.txId);
     * } catch (error) {
     *   if (error instanceof SettoError && error.isUserCancelled()) {
     *     console.log('사용자가 결제를 취소했습니다.');
     *   } else {
     *     console.error('결제 실패:', error);
     *   }
     * }
     * ```
     */
    openPayment(params: PaymentParams): Promise<PaymentResult>;
    /**
     * 오버레이 생성
     */
    private createOverlay;
    /**
     * iframe 생성
     */
    private createIframe;
    /**
     * 리소스 정리
     */
    private cleanup;
    /**
     * 현재 결제 창을 강제로 닫습니다.
     * 일반적으로 사용자가 직접 호출할 필요는 없습니다.
     */
    close(): void;
}

export { MESSAGE_TYPES, type PaymentParams, type PaymentResult, PaymentStatus, type PaymentStatusType, SETTO_ENVIRONMENTS, type SettoEnvironment, SettoError, SettoErrorCode, SettoSDK, type SettoSDKConfig };
