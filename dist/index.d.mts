/**
 * Setto External SDK - Web (TypeScript/JavaScript)
 *
 * 고객사 웹에서 Setto 결제를 연동하기 위한 SDK
 * iframe 기반으로 wallet.settopay.com 결제 페이지를 열고 postMessage로 결과를 수신
 */
type Environment = 'dev' | 'prod';
interface InitConfig {
    merchantId: string;
    environment: Environment;
    idpToken?: string;
    debug?: boolean;
}
interface PaymentParams {
    amount: string;
    orderId?: string;
}
interface InfoParams {
    paymentId: string;
}
interface PaymentResult {
    status: 'success' | 'failed' | 'cancelled';
    paymentId?: string;
    txHash?: string;
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
     * @param initConfig.merchantId - 고객사 ID (필수)
     * @param initConfig.environment - 환경 (dev | prod)
     * @param initConfig.idpToken - IdP 토큰 (선택, 있으면 자동로그인)
     * @param initConfig.debug - 디버그 로그 (선택)
     */
    initialize(initConfig: InitConfig): void;
    /**
     * 결제 요청
     *
     * IdP Token 유무에 따라 자동로그인 여부가 결정됩니다.
     * - IdP Token 없음: Setto 로그인 필요
     * - IdP Token 있음: PaymentToken 발급 후 자동로그인
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
