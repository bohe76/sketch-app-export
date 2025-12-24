---
title: 카카오 프로필 이미지 Mixed Content(HTTPS) 보안 경고 해결
date: 2025-12-24
status: resolved
priority: medium
author: Antigravity
---

## 이슈 007: 카카오 프로필 이미지 Mixed Content(HTTPS) 보안 경고 해결

## 현상

- 실서버(HTTPS)에서 카카오 로그인 유저의 프로필 이미지가 노출될 때, `http://` 시작 주소로 인해 `Mixed Content` 경고가 발생함.
- 브라우저가 자동으로 HTTPS로 업그레이드하여 이미지는 표시되나, 콘솔에 보안 관련 경고가 지속적으로 출력됨.

## 원인 분석

1. **소설 Provider 정책**: 카카오 OAuth 서버에서 반환하는 프로필 이미지 주소가 기본적으로 비보안 프로토콜(`http`)인 경우가 있음.
2. **보안 정책 위반**: HTTPS 사이트에서 비보안 리소스(HTTP)를 요청하는 것은 현대 브라우저의 보안 표준에 위배됨.

## 해결 방안

1. **런타임 URL 정제 (UI)**:
   - `App.tsx` 내 헤더, 모바일 네비게이션바 등 프로필 이미지를 렌더링하는 컴포넌트에서 `user.photoURL`의 `http://`를 `https://`로 즉시 치환하여 요청하도록 수정.
2. **데이터 동기화 안정화 (Auth API)**:
   - `syncUserToSanity` 함수에서 Sanity DB로 유저 정보를 저장하기 전, `photoURL`을 사전에 HTTPS로 정제하여 저장함으로써 데이터 무결성 확보.

## 결과 및 효과

- 카카오 로그인 사용자의 보안 경고가 완전히 사라짐.
- 향후 다른 소셜 계정에서 유사한 문제가 발생하더라도 공통 로직으로 자동 대응 가능해짐.
