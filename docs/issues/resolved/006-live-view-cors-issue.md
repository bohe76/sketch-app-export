---
title: 실서버 피드 라이브 뷰(Live Sketch) CORS 차단 현상 해결
date: 2025-12-24
status: resolved
priority: high
author: Antigravity
---

## 이슈 006: 실서버 피드 라이브 뷰(Live Sketch) CORS 차단 현상 해결

## 현상

- 로컬 환경에서는 피드 썸네일 마우스 오버 시 라이브 스케치가 정상적으로 그려지나, 실서버(Vercel)에서는 캔버스가 비어 있고 그려지지 않는 현상 발생.
- 브라우저 콘솔 에러: `Access to image at '...' from origin '...' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

## 원인 분석

1. **캔버스 오염(Tainted Canvas)**: `SketchEngine`이 썸네일 이미지의 픽셀 데이터를 분석(`getImageData`)하려면 브라우저의 CORS 권한 승인이 필요함.
2. **속성 누락**: `<img>` 태그에 `crossOrigin` 속성이 없을 경우, 브라우저는 익명(Anonymous) 요청을 보내지 않아 Sanity CDN의 CORS 설정을 활용하지 못함.
3. **대시보드 설정 미비**: Sanity API 설정에 실서버 도메인이 허용 목록(CORS Origins)에 등록되어 있지 않았음.

## 해결 방안

1. **클라이언트 코드 수정**:
   - `ArtworkCard.tsx`의 썸네일 이미지 태그에 `crossOrigin="anonymous"` 속성 추가.
2. **서버 설정 (Sanity Dashboard)**:
   - Sanity 관리자 페이지(`Settings > API settings`)에서 `https://sketchrang.vercel.app` 도메인을 CORS Origins에 추가하고 **Allow Credentials**를 활성화함.

## 참고 사항

- 외부 CDN 이미지를 캔버스에서 픽셀 단위로 조작할 때는 반드시 클라이언트 속성(`crossOrigin`)과 서버 헤더(CORS)가 쌍을 이루어야 함을 기술 문서에 반영.
- 이 조치를 통해 실서버 피드 인터랙션의 '와우 포인트'가 정상화됨.
