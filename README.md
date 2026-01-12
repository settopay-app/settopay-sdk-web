# @setto/web-sdk

Setto Web SDK - iframe + postMessage 방식의 결제 연동 SDK

## 설치

```bash
npm install @setto/web-sdk
# or
pnpm add @setto/web-sdk
# or
yarn add @setto/web-sdk
```

## 사용법

### 기본 사용 (Setto 자체 로그인)

자체 인증 시스템이 없는 경우, idpToken 없이 호출하면 Setto 자체 OAuth 로그인을 사용합니다.

```typescript
import { SettoSDK } from '@setto/web-sdk';

// SDK 초기화
const setto = new SettoSDK({
  merchantId: 'your-merchant-id',
  environment: 'production', // 'development' | 'production'
});

// 결제 요청
async function handlePayment() {
  try {
    // idpToken 없이 호출 → Setto 자체 OAuth 로그인 화면 표시
    const result = await setto.openPayment({
      orderId: 'order-123',
      amount: 10000,
      currency: 'USD', // 선택
    });

    console.log('결제 성공:', result.txId);
    // 서버에서 결제 검증 필수!
  } catch (error) {
    if (error instanceof SettoError && error.isUserCancelled()) {
      console.log('사용자가 결제를 취소했습니다.');
    } else {
      console.error('결제 실패:', error);
    }
  }
}
```

### Firebase/Cognito 연동 (IdP Token 전달)

자체 IdP(Firebase, Cognito 등)가 있는 경우, idpToken을 전달하면 Setto 로그인을 생략하고 바로 결제 화면이 표시됩니다.

```typescript
import { getAuth } from 'firebase/auth';
import { SettoSDK } from '@setto/web-sdk';

const setto = new SettoSDK({
  merchantId: 'your-merchant-id',
  environment: 'production',
});

async function handlePayment() {
  // Firebase ID Token 획득
  const idpToken = await getAuth().currentUser?.getIdToken();

  const result = await setto.openPayment({
    orderId: 'order-123',
    amount: 10000,
    idpToken, // 전달하면 Setto 로그인 생략, 바로 결제 화면
  });
}
```

### idpToken 유무에 따른 동작

| idpToken | wallet.settopay.com 동작 |
|----------|-------------------------|
| **전달됨** | IdP Token 검증 → 즉시 결제 화면 표시 (로그인 불필요) |
| **미전달** | Setto 자체 OAuth 로그인 화면 표시 → 로그인 후 결제 진행 |

## API

### SettoSDK

#### Constructor

```typescript
new SettoSDK(config: SettoSDKConfig)
```

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `merchantId` | `string` | ✅ | 고객사 ID |
| `environment` | `'development' \| 'production'` | ✅ | 환경 설정 |

#### Methods

##### `openPayment(params: PaymentParams): Promise<PaymentResult>`

결제 창을 열고 결제를 진행합니다.

**PaymentParams**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `orderId` | `string` | ✅ | 주문 ID |
| `amount` | `number` | ✅ | 결제 금액 |
| `currency` | `string` | | 통화 (기본: USD) |
| `idpToken` | `string` | | 고객사 IdP Token |

**PaymentResult**

| 필드 | 타입 | 설명 |
|------|------|------|
| `status` | `'success' \| 'failed' \| 'cancelled'` | 결제 상태 |
| `txId` | `string?` | 블록체인 트랜잭션 해시 |
| `paymentId` | `string?` | Setto 결제 ID |
| `error` | `string?` | 에러 메시지 |

##### `close(): void`

현재 결제 창을 강제로 닫습니다.

### SettoError

결제 실패 시 발생하는 에러 클래스입니다.

```typescript
try {
  await setto.openPayment({ ... });
} catch (error) {
  if (error instanceof SettoError) {
    console.log('에러 코드:', error.code);

    if (error.isUserCancelled()) {
      // 사용자 취소 처리
    } else if (error.isPaymentError()) {
      // 결제 실패 처리
    }
  }
}
```

**에러 코드**

| 코드 | 설명 |
|------|------|
| `USER_CANCELLED` | 사용자 취소 |
| `PAYMENT_FAILED` | 결제 실패 |
| `INSUFFICIENT_BALANCE` | 잔액 부족 |
| `TRANSACTION_REJECTED` | 트랜잭션 거부 |
| `NETWORK_ERROR` | 네트워크 오류 |
| `SESSION_EXPIRED` | 세션 만료 |
| `INVALID_PARAMS` | 잘못된 파라미터 |
| `INVALID_MERCHANT` | 유효하지 않은 merchantId |

## CSP 설정

고객사 웹사이트에서 Setto SDK를 사용하려면 CSP(Content Security Policy)에 iframe 허용을 추가해야 합니다.

```
Content-Security-Policy: frame-src 'self' https://wallet.settopay.com;
```

## 보안 참고사항

1. **결제 결과는 서버에서 검증 필수**: SDK에서 반환하는 결과는 UX 피드백용입니다. 실제 결제 완료 여부는 고객사 서버에서 Setto API를 통해 검증해야 합니다.

2. **XSS 방어**: 고객사 웹사이트에서 XSS 공격에 대한 방어를 구현해야 합니다. XSS가 발생하면 IdP Token이 탈취될 수 있습니다.

## License

MIT
