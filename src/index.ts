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

import { getBaseUrl } from './environments';
import { SettoError, SettoErrorCode } from './errors';
import {
  MESSAGE_TYPES,
  type InitPaymentMessage,
  type PaymentParams,
  type PaymentResult,
  type PaymentResultMessage,
  type SettoSDKConfig,
} from './types';

// ============================================================================
// CSS 스타일 상수
// ============================================================================

const OVERLAY_STYLES = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
`;

const IFRAME_STYLES = `
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 600px;
  max-width: 95vw;
  max-height: 90vh;
  border: none;
  border-radius: 12px;
  z-index: 10000;
`;

// ============================================================================
// SettoSDK 클래스
// ============================================================================

/**
 * Setto Web SDK
 *
 * 고객사 웹사이트에서 Setto 결제를 연동하기 위한 SDK입니다.
 * iframe으로 wallet.settopay.com을 로드하고 postMessage로 통신합니다.
 */
export class SettoSDK {
  private readonly merchantId: string;
  private readonly baseUrl: string;

  private iframe: HTMLIFrameElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private rejectHandler: ((error: Error) => void) | null = null;

  constructor(config: SettoSDKConfig) {
    this.merchantId = config.merchantId;
    this.baseUrl = getBaseUrl(config.environment);
  }

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
  openPayment(params: PaymentParams): Promise<PaymentResult> {
    return new Promise((resolve, reject) => {
      this.rejectHandler = reject;

      // UI 생성
      this.createOverlay();
      this.createIframe();

      // iframe 로드 완료 시 결제 초기화 메시지 전송
      this.iframe!.onload = () => {
        const message: InitPaymentMessage = {
          type: MESSAGE_TYPES.INIT_PAYMENT,
          merchantId: this.merchantId,
          orderId: params.orderId,
          amount: params.amount,
          currency: params.currency,
          idpToken: params.idpToken,
        };
        this.iframe!.contentWindow?.postMessage(message, this.baseUrl);
      };

      // 결제 결과 메시지 수신
      this.messageHandler = (event: MessageEvent) => {
        // origin 검증 (보안)
        if (event.origin !== this.baseUrl) return;

        const { type, data } = event.data as PaymentResultMessage;

        switch (type) {
          case MESSAGE_TYPES.PAYMENT_SUCCESS:
            this.cleanup();
            resolve(data);
            break;

          case MESSAGE_TYPES.PAYMENT_FAILED:
            this.cleanup();
            reject(new SettoError(SettoErrorCode.PAYMENT_FAILED, data.error));
            break;

          case MESSAGE_TYPES.PAYMENT_CANCELLED:
            this.cleanup();
            reject(new SettoError(SettoErrorCode.USER_CANCELLED));
            break;
        }
      };

      window.addEventListener('message', this.messageHandler);
    });
  }

  /**
   * 오버레이 생성
   */
  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.id = 'setto-overlay';
    this.overlay.style.cssText = OVERLAY_STYLES;

    // 오버레이 클릭 시 결제 취소
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) {
        const rejectFn = this.rejectHandler;
        this.cleanup();
        rejectFn?.(new SettoError(SettoErrorCode.USER_CANCELLED));
      }
    };

    document.body.appendChild(this.overlay);
  }

  /**
   * iframe 생성
   */
  private createIframe(): void {
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'setto-iframe';
    this.iframe.src = `${this.baseUrl}/embed`;
    this.iframe.style.cssText = IFRAME_STYLES;

    document.body.appendChild(this.iframe);
  }

  /**
   * 리소스 정리
   */
  private cleanup(): void {
    // 이벤트 리스너 제거
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }

    // DOM 요소 제거
    this.iframe?.remove();
    this.overlay?.remove();
    this.iframe = null;
    this.overlay = null;
    this.rejectHandler = null;
  }

  /**
   * 현재 결제 창을 강제로 닫습니다.
   * 일반적으로 사용자가 직접 호출할 필요는 없습니다.
   */
  close(): void {
    const rejectFn = this.rejectHandler;
    this.cleanup();
    rejectFn?.(new SettoError(SettoErrorCode.USER_CANCELLED));
  }
}

// ============================================================================
// 타입 및 상수 Export
// ============================================================================

export { SettoError, SettoErrorCode } from './errors';
export { SETTO_ENVIRONMENTS, type SettoEnvironment } from './environments';
export {
  MESSAGE_TYPES,
  PaymentStatus,
  type PaymentParams,
  type PaymentResult,
  type PaymentStatusType,
  type SettoSDKConfig,
} from './types';
