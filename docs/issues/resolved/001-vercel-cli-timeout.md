---
title: Vercel CLI 로컬 실행 타임아웃 및 포트 충돌
date: 2025-12-20
status: resolved
priority: critical
author: Antigravity
---

## 이슈 001: Vercel CLI 로컬 실행 타임아웃 및 포트 충돌

## 현상

- `vercel dev` 명령어로 로컬 개발 환경 실행 시, Vite 서버가 시작되지만 Vercel CLI가 포트를 감지하지 못하고 타임아웃 발생.
- 에러 메시지: `Error: Detecting port 55695 timed out after 300000ms`
- 또는 `Error: Port 5173 is already in use` 발생 (Vite 프로세스가 좀비로 남아있는 경우).

## 원인 분석

1. **포트 충돌**: `vite.config.ts`에 `strictPort: true` 설정이 Vercel의 자동 포트 할당 로직과 충돌했을 가능성.
2. **Vercel CLI 불안정성**: Windows 환경에서 Vercel CLI가 자식 프로세스(Vite)의 포트를 제대로 감지하지 못하거나, 파일 락킹 이슈가 발생.
3. **네트워크 바인딩**: localhost IPv6(::1)와 IPv4(127.0.0.1) 간의 바인딩 불일치로 인한 연결 거부.

## 시도한 해결 방법

1. **Vite 설정 완화**: `strictPort` 제거 및 `host` 옵션 제거 -> 해결되지 않음.
2. **프로세스 정리**: `node`, `vite`, `vercel` 프로세스 강제 종료 후 재시작 -> 일시적으로 성공했으나 접속 불안정 (CORS, 연결 거부).
3. **강제 포트 지정**: `vercel dev --listen 3000` 사용 -> 타임아웃 에러 지속.
4. **Vite Proxy (보류)**: Vite에서 API 요청만 3000번으로 보내는 방식은 로컬/운영 환경 불일치를 야기할 수 있어 보류.

## 해결 (Resolution)

**"Unified Express Server + Vite Middleware" 전략을 채택하여 해결함.**

Vercel CLI의 불안정한 로컬 실행 환경을 우회하고, 포트 관리의 복잡성을 제거하기 위해 **단일 포트(3000) 통합 서버** 모델을 도입함.

### 1. Unified API Server (`api/server.js`)

- **Vite Middleware Integration**: Express 서버에 Vite를 미들웨어로 통합(`vite.middlewares`)하여, 하나의 서버 인스턴스가 API 요청과 프론트엔드 에셋 서빙을 모두 담당하도록 함.
- **Serverless Simulation**: `/api/*` 요청은 로컬 Express 라우터가 처리하여 Vercel Function 환경을 모사하고, 그 외 요청은 Vite가 SPA(Single Page Application) 형태로 처리.
- **Dynamic Import**: API 핸들러(`api/feed.js` 등)를 요청 시마다 동적으로 임포트하여 코드 수정을 즉시 반영.

### 2. Single Port Operation (Port 3000)

- 기존에는 Frontend(5173)와 Backend(3000) 두 개의 포트를 사용했으나, 이제는 `localhost:3000` 하나로 모든 서비스 접근 가능.
- `vite.config.ts`의 Proxy 설정이 불필요해져 제거함.

### 3. 결과

- **간소화된 실행**: `node api/server.js` 명령어 하나로 전체 개발 환경(Frontend HMR + Backend API) 실행 가능.
- **안정성 향상**: 포트 충돌, CORS, 프록시 설정 오류 등의 네트워크 이슈 원천 차단.
- **배포 호환성**: 로컬에서는 Express가 라우팅을 담당하지만, 배포 시에는 Vercel의 파일 시스템 기반 라우팅이 작동하므로 코드 변경 없이 호환됨.
