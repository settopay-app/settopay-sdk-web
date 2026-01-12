/**
 * Setto SDK 에러 코드
 *
 * Deep Link의 error 파라미터 및 SDK 내부에서 사용
 */
export const SettoErrorCode = {
  // 사용자 액션
  USER_CANCELLED: 'USER_CANCELLED',

  // 결제 실패
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',

  // 네트워크/시스템
  NETWORK_ERROR: 'NETWORK_ERROR',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // 파라미터
  INVALID_PARAMS: 'INVALID_PARAMS',
  INVALID_MERCHANT: 'INVALID_MERCHANT',
} as const;

export type SettoErrorCodeType = (typeof SettoErrorCode)[keyof typeof SettoErrorCode];

/**
 * Setto SDK 에러 클래스
 */
export class SettoError extends Error {
  readonly code: SettoErrorCodeType;

  constructor(code: SettoErrorCodeType, message?: string) {
    super(message ?? code);
    this.name = 'SettoError';
    this.code = code;
  }

  /**
   * 사용자 취소 에러인지 확인
   */
  isUserCancelled(): boolean {
    return this.code === SettoErrorCode.USER_CANCELLED;
  }

  /**
   * 결제 관련 에러인지 확인
   */
  isPaymentError(): boolean {
    const paymentErrorCodes: SettoErrorCodeType[] = [
      SettoErrorCode.PAYMENT_FAILED,
      SettoErrorCode.INSUFFICIENT_BALANCE,
      SettoErrorCode.TRANSACTION_REJECTED,
    ];
    return paymentErrorCodes.includes(this.code);
  }
}
