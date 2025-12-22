---
title: 구글 로그인 계정 선택 화면 도메인 노출 개선
date: 2025-12-22
status: open
priority: low
author: Antigravity
---

## 이슈 003: 구글 로그인 계정 선택 화면 도메인 노출 개선

## 현상

- 구글 로그인 시 계정 선택 화면에서 `sketchrang-auth.firebaseapp.com(으)로 이동`이라는 텍스트가 표시됨.
- 서비스명만 깔끔하게 노출되지 않아 MVP 단계에서 전문성이 다소 떨어져 보일 수 있음.

## 원인 분석

1. **커스텀 도메인 미사용**: Firebase의 기본 인증 도메인을 사용 중이어서 발생.
2. **Google Cloud OAuth 설정**: OAuth 동의 화면의 앱 이름 및 로고 설정이 미흡할 경우 도메인이 강조됨.
3. **앱 게시 상태**: 프로젝트가 '테스트' 상태일 경우 구글이 도메인 정보를 더 엄격하게 노출함.

## 해결 방안 (단기 - 도메인 구매 전)

1. **Google Cloud Console 설정 업데이트**:
   - OAuth 동의 화면에서 앱 이름을 `Sketchrang`으로 정확히 입력.
   - 앱 로고 및 사용자 지원 이메일 등록.
2. **앱 게시(Publish)**:
   - '테스트' 상태에서 '프로덕션' 상태로 변경하여 브랜딩 노출 최적화.
3. **Firebase Public Name 확인**:
   - Firebase Console 프로젝트 설정에서 '공공용 이름'을 `Sketchrang`으로 설정.

## 해결 방안 (장기 - 도메인 구매 후)

1. **커스텀 도메인 연결**:
   - `auth.sketchrang.com` 등 커스텀 도메인 등록 후 Firebase Authentication에 '승인된 도메인'으로 추가.
   - `authDomain` 설정을 커스텀 도메인으로 변경.

## 참고 사항

- MVP 단계에서는 도메인 구매 없이 Google Cloud Console의 **브랜딩 설정(로고, 이름)**만으로 최대한 노출을 개선함.
- 우선순위가 가장 낮으므로 정식 런칭 직전에 검토 권장.
