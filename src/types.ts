/**
 * Setto Web SDK 타입 정의
 */

import type { SettoEnvironment } from './environments';

// ============================================================================
// SDK 설정
// ============================================================================

/**
 * SDK 초기화 설정
 */
export interface SettoSDKConfig {
  /** 고객사 ID */
  merchantId: string;
  /** 환경 설정 */
  environment: SettoEnvironment;
}

// ============================================================================
// 결제 요청/결과
// ============================================================================

/**
 * 결제 요청 파라미터
 */
export interface PaymentParams {
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
export const PaymentStatus = {
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * 결제 결과
 */
export interface PaymentResult {
  /** 결제 상태 */
  status: PaymentStatusType;
  /** 블록체인 트랜잭션 해시 (성공 시) */
  txId?: string;
  /** Setto 결제 ID */
  paymentId?: string;
  /** 에러 메시지 (실패 시) */
  error?: string;
}

// ============================================================================
// postMessage 타입
// ============================================================================

/**
 * postMessage 메시지 타입
 * wallet.settopay.com과 동기화 필요
 */
export const MESSAGE_TYPES = {
  /** 결제 초기화 요청 */
  INIT_PAYMENT: 'INIT_PAYMENT',
  /** 결제 성공 */
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  /** 결제 실패 */
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  /** 결제 취소 */
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

/**
 * 결제 초기화 메시지 (SDK → wallet.settopay.com)
 */
export interface InitPaymentMessage {
  type: typeof MESSAGE_TYPES.INIT_PAYMENT;
  merchantId: string;
  orderId: string;
  amount: number;
  currency?: string;
  idpToken?: string;
}

/**
 * 결제 결과 메시지 (wallet.settopay.com → SDK)
 */
export interface PaymentResultMessage {
  type:
    | typeof MESSAGE_TYPES.PAYMENT_SUCCESS
    | typeof MESSAGE_TYPES.PAYMENT_FAILED
    | typeof MESSAGE_TYPES.PAYMENT_CANCELLED;
  data: PaymentResult;
}
