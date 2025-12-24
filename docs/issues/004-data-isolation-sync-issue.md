# Incident Report: Local/Production Data Synchronization Issue

## 1. Overview
로컬 개발 환경에서 발행한 데이터가 실서버(Vercel) 환경과 동기화되어 보이는 현상이 발생함. 원인은 실서버의 환경 변수 설정 오류 및 ESM 환경에서의 환경 변수 로드 우선순위 결함이었음.

## 2. Root Cause
- **Human Error**: Vercel 대시보드의 `VITE_SANITY_DATASET` 값이 로컬과 동일하게 `development`로 잘못 복사되어 있었음.
- **Engineering Flaw**: ESM(ECMAScript Modules) 환경의 호이스팅 특성으로 인해 `dotenv.config()`가 실행되기 전에 Sanity 클라이언트가 전역에서 초기화되어, 환경 변수가 로드되지 않은 상태에서 기본값인 `production`을 참조하는 시나리오가 존재했음.

## 3. Corrective Actions (Fixes)
- **Dynamic Client Factory**: 모든 API 핸들러에서 전역 클라이언트를 제거하고, 요청 시점마다 환경 변수를 새로 읽어 클라이언트를 생성하는 `getClient()` 패턴을 도입함.
- **ESM Optimization**: `api/server.js` 최상단에 `import 'dotenv/config'`를 배치하여 모듈 로드 전 환경 변수 로드를 보장함.
- **Dataset Validation**: 서버 부팅 및 API 요청 시 현재 사용 중인 데이터셋을 로그로 출력하여 육안으로 즉시 확인할 수 있는 검증 체계를 구축함 (검증 완료 후 로그는 제거됨).

## 4. Prevention
- Vercel 배포 시 환경 변수 교차 검증 절차 강화.
- 런타임 환경 변수 의존성이 있는 모듈은 항상 팩토리 패턴을 사용하여 초기화 시점 문제를 원천 차단.

---
**Status**: Resolved
**Date**: 2025-12-24
