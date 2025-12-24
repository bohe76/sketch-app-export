---
title: 로컬 및 실서버 데이터 동기화 분리 문제 해결
date: 2025-12-24
status: resolved
priority: high
author: Antigravity
---

## 이슈 005: 로컬 및 실서버 데이터 동기화 분리 문제 해결

## 현상

- 로컬 개발 환경에서 발행(Publish)한 데이터가 실서버(Vercel) 환경의 피드에 즉시 반영되는 현상 발생.
- 데이터셋 분리 설정(`development` vs `production`)에도 불구하고 데이터가 오염(Cross-contamination)됨.

## 원인 분석

1. **환경 변수 설정 오류**: Vercel 대시보드에 `VITE_SANITY_DATASET` 값이 로컬과 동일한 `development`로 잘못 설정되어 있었음.
2. **ESM 호이스팅 결함**: JavaScript ESM 환경에서 `import` 문이 코드 실행보다 먼저 호이스팅되어, `dotenv.config()`가 실행되기 전에 Sanity 클라이언트가 최상단 전역에서 초기화됨. 이 과정에서 환경 변수가 로드되지 않아 기본값(`production`)을 상속받는 시나리오 존재.
3. **정적 클라이언트 유지**: 서버 부팅 시점에 한 번 생성된 클라이언트 객체가 모든 요청에 재사용되면서, 런타임 환경 변수 변화를 반영하지 못함.

## 해결 방안

1. **Dynamic Client Factory 도입**:
   - 모든 API 핸들러(`api/*.js`)에서 전역 클라이언트를 제거.
   - 요청 시점마다 런타임 환경 변수를 참조하여 클라이언트를 생성하는 `getClient()` 팩토리 패턴 적용.
2. **ESM 로드 최적화**:
   - `api/server.js` 최상단에 `import 'dotenv/config'`를 배치하여 모듈 분석 전 환경 변수 로드를 강제함.
3. **가시성 확보 (검증)**:
   - 서버 부팅 및 각 API 요청 시 현재 어떤 데이터셋(`development`/`production`)과 통신 중인지 터미널에 명시적으로 로그를 출력하여 오염 여부를 상시 감시함 (이후 로그는 제거됨).

## 참고 사항

- 이 조치를 통해 ESM 환경에서의 환경 변수 신뢰성 문제를 근본적으로 해결함.
- 향후 모든 서버측 Sanity 통신 모듈은 반드시 `getClient()` 팩토리 패턴을 사용해야 함.
- Vercel 배포 시 환경 변수 교차 검증 절차를 체크리스트에 추가함.
