/**
 * Setto External SDK - Web (TypeScript/JavaScript)
 *
 * 고객사 웹에서 Setto 결제를 연동하기 위한 SDK
 * iframe 기반으로 wallet.settopay.com 결제 페이지를 열고 postMessage로 결과를 수신
 */
type Environment = 'dev' | 'prod';
interface InitConfig {
    environment: Environment;
    debug?: boolean;
}
interface PaymentParams {
    merchantId: string;
    amount: string;
    idpToken?: string;
}
interface InfoParams {
    merchantId: string;
    paymentId: string;
}
interface PaymentResult {
    status: 'success' | 'failed' | 'cancelled';
    paymentId?: string;
    txHash?: string;
    /** 결제자 지갑 주소 */
    fromAddress?: string;
    /** 결산 수신자 주소 (pool이 아닌 최종 수신자) */
    toAddress?: string;
    /** 결제 금액 (USD, 예: "10.00") */
    amount?: string;
    /** 체인 ID (예: 8453, 56, 900001) */
    chainId?: number;
    /** 토큰 심볼 (예: "USDC", "USDT") */
    tokenSymbol?: string;
    error?: string;
}
interface PaymentInfo {
    paymentId: string;
    status: 'pending' | 'submitted' | 'included' | 'failed' | 'cancelled';
    amount: string;
    currency: string;
    txHash?: string;
    createdAt: number;
    completedAt?: number;
}
declare const SettoSDK: {
    /**
     * SDK 초기화
     *
     * @param initConfig.environment - 환경 (dev | prod)
     * @param initConfig.debug - 디버그 로그 (선택)
     */
    initialize(initConfig: InitConfig): void;
    /**
     * 결제 요청
     *
     * 항상 PaymentToken을 발급받아 Fragment로 전달합니다.
     * - IdP Token 없음: Setto 로그인 필요
     * - IdP Token 있음: 자동로그인
     */
    openPayment(params: PaymentParams): Promise<PaymentResult>;
    /**
     * 결제 상태 조회
     */
    getPaymentInfo(params: InfoParams): Promise<PaymentInfo>;
    /**
     * 초기화 여부 확인
     */
    isInitialized(): boolean;
    /**
     * SDK 리셋 (테스트용)
     */
    reset(): void;
};

export { type Environment, type InfoParams, type InitConfig, type PaymentInfo, type PaymentParams, type PaymentResult, SettoSDK, SettoSDK as default };
