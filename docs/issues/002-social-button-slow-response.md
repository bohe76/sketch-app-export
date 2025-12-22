---
title: 소셜 버튼 응답 속도 지연
date: 2025-12-21
status: open
priority: low
author: Antigravity
---

## 이슈 002: 소셜 버튼 응답 속도 지연

## 현상

- 좋아요, 다운로드, 공유 버튼 클릭 시 응답이 느림 (200-500ms 레이턴시).
- Optimistic Update로 UI는 즉시 반영되지만, 실제 DB 동기화까지 시간 소요.
- 사용자가 빠르게 연속 클릭 시 버튼이 일시적으로 반응하지 않는 것처럼 느껴짐.

## 원인 분석

1. **Sanity API 레이턴시**: 해외 서버 통신으로 인한 네트워크 지연.
2. **Request Tracking**: Race Condition 방지를 위해 이전 요청이 완료될 때까지 새 요청 차단.
3. **매 클릭마다 DB 왕복**: 캐싱 없이 모든 요청이 실시간 DB 통신.

## 검토 중인 해결 방안

1. **Debounce 추가**: 300ms 내 중복 클릭 무시.
2. **로컬 캐싱**: 좋아요 상태를 로컬스토리지에 저장.
3. **백엔드 최적화**: Vercel Edge Functions 또는 Redis 캐시 레이어 도입.

## 영향 받는 파일

- `src/features/feed/components/FeedList.tsx`
- `src/features/feed/components/ArtworkDetailModal.tsx`
- `api/like.js`
- `api/track-metric.js`
