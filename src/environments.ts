/**
 * Setto SDK 환경 설정
 *
 * bindings/ SDK는 독립적으로 배포되므로 자체 환경 상수를 정의합니다.
 */

export const SETTO_ENVIRONMENTS = {
  /** SDK 로컬 개발용 (배포 빌드에서 제외) */
  local: 'http://localhost:3100',
  /** 개발 환경 */
  development: 'https://dev-wallet.settopay.com',
  /** 프로덕션 환경 */
  production: 'https://wallet.settopay.com',
} as const;

export type SettoEnvironment = keyof typeof SETTO_ENVIRONMENTS;

/**
 * 환경에 해당하는 Base URL 반환
 */
export function getBaseUrl(environment: SettoEnvironment): string {
  return SETTO_ENVIRONMENTS[environment];
}
