/**
 * Setto External SDK - Web (TypeScript/JavaScript)
 *
 * 고객사 웹에서 Setto 결제를 연동하기 위한 SDK
 * iframe 기반으로 wallet.settopay.com 결제 페이지를 열고 postMessage로 결과를 수신
 */

// ============================================
// Types
// ============================================

export type Environment = 'dev' | 'prod';

export interface InitConfig {
  environment: Environment;
  idpToken?: string; // IdP 토큰 (있으면 자동로그인)
  debug?: boolean;
}

export interface PaymentParams {
  merchantId: string;
  amount: string;
  orderId?: string;
}

export interface InfoParams {
  merchantId: string;
  paymentId: string;
}

export interface PaymentResult {
  status: 'success' | 'failed' | 'cancelled';
  paymentId?: string;
  txHash?: string;
  error?: string;
}

export interface PaymentInfo {
  paymentId: string;
  status: 'pending' | 'submitted' | 'included' | 'failed' | 'cancelled';
  amount: string;
  currency: string;
  txHash?: string;
  createdAt: number;
  completedAt?: number;
}

// ============================================
// Constants
// ============================================

const ENVIRONMENTS = {
  dev: 'https://dev-wallet.settopay.com',
  prod: 'https://wallet.settopay.com',
} as const;

const MESSAGE_TYPES = {
  SETTO_PAYMENT_SUCCESS: 'SETTO_PAYMENT_SUCCESS',
  SETTO_PAYMENT_FAILED: 'SETTO_PAYMENT_FAILED',
  SETTO_PAYMENT_CANCELLED: 'SETTO_PAYMENT_CANCELLED',
} as const;

// ============================================
// SDK State
// ============================================

let config: InitConfig | null = null;

function getConfig(): InitConfig {
  if (!config) {
    throw new Error('SettoSDK not initialized. Call SettoSDK.initialize() first.');
  }
  return config;
}

function debugLog(...args: unknown[]): void {
  if (config?.debug) {
    console.log('[SettoSDK]', ...args);
  }
}

// ============================================
// SDK Implementation
// ============================================

export const SettoSDK = {
  /**
   * SDK 초기화
   *
   * @param initConfig.environment - 환경 (dev | prod)
   * @param initConfig.idpToken - IdP 토큰 (선택, 있으면 자동로그인)
   * @param initConfig.debug - 디버그 로그 (선택)
   */
  initialize(initConfig: InitConfig): void {
    if (config) {
      console.warn('[SettoSDK] Already initialized');
      return;
    }
    config = initConfig;
    debugLog('Initialized:', { ...config, idpToken: config.idpToken ? '[REDACTED]' : undefined });
  },

  /**
   * 결제 요청
   *
   * IdP Token 유무에 따라 자동로그인 여부가 결정됩니다.
   * - IdP Token 없음: Setto 로그인 필요
   * - IdP Token 있음: PaymentToken 발급 후 자동로그인
   */
  async openPayment(params: PaymentParams): Promise<PaymentResult> {
    const cfg = getConfig();
    const baseUrl = ENVIRONMENTS[cfg.environment];

    let url: string;

    if (cfg.idpToken) {
      // IdP Token 있음 → PaymentToken 발급 → Fragment로 전달
      debugLog('Requesting PaymentToken...');
      try {
        const response = await fetch(`${baseUrl}/api/external/payment/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchant_id: params.merchantId,
            amount: params.amount,
            order_id: params.orderId,
            idp_token: cfg.idpToken,
          }),
        });

        const data = await response.json();
        if (data.payment_error || data.system_error) {
          debugLog('PaymentToken error:', data);
          return { status: 'failed', error: data.payment_error || data.system_error };
        }

        if (!data.payment_token) {
          debugLog('PaymentToken not received');
          return { status: 'failed', error: 'Payment token not received' };
        }

        // Fragment로 전달 (보안: 서버 로그에 남지 않음)
        url = `${baseUrl}/pay/wallet#pt=${encodeURIComponent(data.payment_token)}`;
        debugLog('Opening payment with auto-login');
      } catch (error) {
        debugLog('PaymentToken request error:', error);
        return { status: 'failed', error: 'Network error' };
      }
    } else {
      // IdP Token 없음 → Query param으로 직접 전달
      const paymentUrl = new URL(`${baseUrl}/pay/wallet`);
      paymentUrl.searchParams.set('merchant_id', params.merchantId);
      paymentUrl.searchParams.set('amount', params.amount);
      if (params.orderId) {
        paymentUrl.searchParams.set('order_id', params.orderId);
      }
      url = paymentUrl.toString();
      debugLog('Opening payment with Setto login');
    }

    return openIframeAndWait(url, cfg);
  },

  /**
   * 결제 상태 조회
   */
  async getPaymentInfo(params: InfoParams): Promise<PaymentInfo> {
    const cfg = getConfig();
    const baseUrl = ENVIRONMENTS[cfg.environment];
    const response = await fetch(
      `${baseUrl}/api/external/payment/${params.paymentId}`,
      {
        headers: {
          'X-Merchant-ID': params.merchantId,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to get payment info: ${response.status}`);
    }
    return response.json();
  },

  /**
   * 초기화 여부 확인
   */
  isInitialized(): boolean {
    return config !== null;
  },

  /**
   * SDK 리셋 (테스트용)
   */
  reset(): void {
    config = null;
  },
};

// ============================================
// Internal Functions
// ============================================

function openIframeAndWait(url: string, cfg: InitConfig): Promise<PaymentResult> {
  return new Promise((resolve) => {
    // Overlay 생성
    const overlay = document.createElement('div');
    overlay.id = 'setto-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // iframe 생성
    const iframe = document.createElement('iframe');
    iframe.id = 'setto-iframe';
    iframe.src = url;
    iframe.style.cssText = `
      width: 420px;
      height: 680px;
      max-width: 95vw;
      max-height: 90vh;
      border: none;
      border-radius: 16px;
      background: white;
    `;

    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    // Cleanup 함수
    const cleanup = (): void => {
      window.removeEventListener('message', messageHandler);
      overlay.remove();
    };

    // Overlay 클릭 시 취소
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        debugLog('Payment cancelled by user (overlay click)');
        cleanup();
        resolve({ status: 'cancelled' });
      }
    });

    // ESC 키로 취소
    const escHandler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        debugLog('Payment cancelled by user (ESC key)');
        cleanup();
        window.removeEventListener('keydown', escHandler);
        resolve({ status: 'cancelled' });
      }
    };
    window.addEventListener('keydown', escHandler);

    // postMessage 핸들러
    const messageHandler = (event: MessageEvent): void => {
      const baseUrl = ENVIRONMENTS[cfg.environment];
      if (event.origin !== baseUrl) return;

      const { type, data } = event.data;
      debugLog('Received message:', type, data);

      if (type === MESSAGE_TYPES.SETTO_PAYMENT_SUCCESS) {
        cleanup();
        window.removeEventListener('keydown', escHandler);
        resolve({
          status: 'success',
          paymentId: data.paymentId,
          txHash: data.txHash,
        });
      } else if (type === MESSAGE_TYPES.SETTO_PAYMENT_FAILED) {
        cleanup();
        window.removeEventListener('keydown', escHandler);
        resolve({
          status: 'failed',
          error: data.error,
        });
      } else if (type === MESSAGE_TYPES.SETTO_PAYMENT_CANCELLED) {
        cleanup();
        window.removeEventListener('keydown', escHandler);
        resolve({ status: 'cancelled' });
      }
    };

    window.addEventListener('message', messageHandler);
  });
}

export default SettoSDK;
