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
  debug?: boolean;
}

export interface PaymentParams {
  merchantId: string;
  amount: string;
  idpToken?: string; // IdP 토큰 (선택, 있으면 자동로그인)
}

export interface InfoParams {
  merchantId: string;
  paymentId: string;
}

export interface PaymentResult {
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

// API 서버 (백엔드 gRPC-Gateway)
const API_ENDPOINTS = {
  dev: 'https://dev-wallet.settopay.com',
  prod: 'https://wallet.settopay.com',
} as const;

// 웹앱 (프론트엔드 결제 페이지)
const WEB_APP_URLS = {
  dev: 'https://dev-app.settopay.com',
  prod: 'https://app.settopay.com',
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
   * @param initConfig.debug - 디버그 로그 (선택)
   */
  initialize(initConfig: InitConfig): void {
    if (config) {
      console.warn('[SettoSDK] Already initialized');
      return;
    }
    config = initConfig;
    debugLog('Initialized:', config);
  },

  /**
   * 결제 요청
   *
   * 항상 PaymentToken을 발급받아 Fragment로 전달합니다.
   * - IdP Token 없음: Setto 로그인 필요
   * - IdP Token 있음: 자동로그인
   */
  async openPayment(params: PaymentParams): Promise<PaymentResult> {
    const cfg = getConfig();
    const apiUrl = API_ENDPOINTS[cfg.environment];
    const webAppUrl = WEB_APP_URLS[cfg.environment];

    // 항상 PaymentToken 발급 (idpToken 유무와 상관없이)
    debugLog('Requesting PaymentToken...');
    try {
      const body: Record<string, string> = {
        merchant_id: params.merchantId,
        amount: params.amount,
      };
      if (params.idpToken) {
        body.idp_token = params.idpToken;
      }

      const response = await fetch(`${apiUrl}/api/external/payment/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      debugLog('Response:', data);
      if (data.payment_error || data.system_error) {
        debugLog('PaymentToken error:', data);
        return { status: 'failed', error: data.payment_error || data.system_error };
      }

      if (!data.payment_token) {
        debugLog('PaymentToken not received');
        return { status: 'failed', error: 'Payment token not received' };
      }

      // Fragment로 전달 (보안: 서버 로그에 남지 않음)
      const url = `${webAppUrl}/pay/wallet#pt=${encodeURIComponent(data.payment_token)}`;
      debugLog('Opening payment page:', url);

      return openIframeAndWait(url, cfg);
    } catch (error) {
      debugLog('PaymentToken request error:', error);
      return { status: 'failed', error: 'Network error' };
    }
  },

  /**
   * 결제 상태 조회
   */
  async getPaymentInfo(params: InfoParams): Promise<PaymentInfo> {
    const cfg = getConfig();
    const apiUrl = API_ENDPOINTS[cfg.environment];
    const response = await fetch(
      `${apiUrl}/api/external/payment/${params.paymentId}`,
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
    // Overlay 생성 (전체 화면, 투명)
    const overlay = document.createElement('div');
    overlay.id = 'setto-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      z-index: 99999;
      pointer-events: none;
    `;

    // iframe 생성 (전체 화면 - 내부에서 바닥 모달 스타일 처리)
    const iframe = document.createElement('iframe');
    iframe.id = 'setto-iframe';
    iframe.src = url;
    iframe.allow = 'clipboard-write';
    iframe.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      pointer-events: auto;
    `;

    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    // Cleanup 함수
    const cleanup = (): void => {
      window.removeEventListener('message', messageHandler);
      overlay.remove();
    };

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
      const webAppUrl = WEB_APP_URLS[cfg.environment];
      if (event.origin !== webAppUrl) return;

      const { type, data } = event.data;
      debugLog('Received message:', type, data);

      if (type === MESSAGE_TYPES.SETTO_PAYMENT_SUCCESS) {
        cleanup();
        window.removeEventListener('keydown', escHandler);
        resolve({
          status: 'success',
          paymentId: data.paymentId,
          txHash: data.txHash,
          fromAddress: data.fromAddress,
          toAddress: data.toAddress,
          amount: data.amount,
          chainId: data.chainId,
          tokenSymbol: data.tokenSymbol,
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
