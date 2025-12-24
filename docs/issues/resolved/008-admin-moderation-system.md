---
title: 수퍼 어드민 모더레이션(Admin Moderation) 시스템 구축
date: 2025-12-24
status: resolved
priority: high
author: Antigravity
---

## 이슈 008: 수퍼 어드민 모더레이션(Admin Moderation) 시스템 구축

## 현상 및 필요성

- 누구나 작품을 올릴 수 있는 소셜 서비스 특성상, 부적절하거나 유해한 콘텐츠가 게시될 위험이 있음.
- 일반 사용자는 본인 작품만 삭제 가능하므로, 서비스 운영자가 모든 콘텐츠를 관리할 수 있는 '수퍼 어드민' 권한이 필요함.

## 해결 방안

1. **권한 체계 설계 (UID-based Auth)**:
   - 복잡한 DB 권한 테이블 대신, 환경 변수(`VITE_ADMIN_UIDS`)에 신뢰할 수 있는 관리자의 Firebase UID를 등록하여 관리하는 기성복(Off-the-shelf) 방식 채택.
2. **백엔드 보안 로직 보강 (`api/delete.js`)**:
   - 삭제 요청 시 `authorId === userId` 검증 외에 `adminUids.includes(userId)` 조건을 추가하여 어드민의 대리 삭제 권한 승격(Escalation) 허용.
3. **프론트엔드 UI 연동**:
   - `AuthStore`에 `isAdmin` 상태 추가 및 로그인 시 자동 판별 지원.
   - `ArtworkDetailModal`에서 어드민인 경우 원작자가 아니더라도 삭제 버튼(Trash Icon)을 조건부 렌더링하도록 수정.

## 결과 및 효과

- 운영자가 부적절한 게시물을 발견 즉시 갤러리에서 제거할 수 있는 실시간 모더레이션 환경 구축.
- 별도의 어드민 페이지 개발 없이 기존 UI를 활용하여 운영 효율성 극대화.
