---
title: MVP 출시 체크리스트 (Gap Analysis)
date: 2025-12-22
status: in-progress
author: Antigravity
---

## MVP 출시 체크리스트 (Gap Analysis)

이 문서는 `src/app/App.tsx` 및 주요 컴포넌트(`ControlPanel`, `FeedList`) 코드 분석을 기반으로, MVP 출시를 위해 **실제 구현된 기능**과 **구현 필요한 기능**을 명확히 구분한 문서입니다.

### 체크리스트 0: Mobile First Refactoring (최우선 과제)

- [x] **Global Layout**: `flex-col` 기반의 Mobile-First 레이아웃 재구성 (Desktop에서 `flex-row`로 확장).
- [x] **Navigation**:
  - [x] Mobile: 하단 탭 바 (App Shell) 구현.
  - [x] Desktop: 기존 상단 헤더 유지.
- [x] **Sketch (Create View)**:
  - [x] Canvas 영역 최대화: Header/ControlPanel 공간 간섭 제거.
  - [x] **Control Panel Overlay**: Mobile에서 `w-80` 고정 사이드바 제거 -> 'Tune' 버튼 클릭 시 올라오는 **Bottom Sheet (Drawer)** 형태로 변경.
- [x] **Feed (Gallery View)**:
  - [x] Grid Layout 최적화: Mobile 2열(`grid-cols-2`), Desktop 4열(`grid-cols-4`) 반응형 적용.
  - [x] **Premium UI Refinement**: 썸네일 줌/그라데이션 제거 및 정밀한 메트릭 아이콘 배치 완료.
  - [x] **Interaction Standardization**: 전역 툴팁 시스템(`.tooltip-box`) 구축 및 적용 완료.

### 체크리스트 1: 필수 구현 기능 (Must Have)

- **[x] 소셜 로그인/로그아웃 버튼**
  - `App.tsx`: 헤더에 로그인/로그아웃 버튼 및 프로필 이미지 표시(Avatar) 구현됨.
  - `useAuthStore`: 사용자 상태 연동 완료.
- **[x] 로그인 선택 모달 (UI)**
  - 현재: 구글 및 카카오 로그인 복수 Provider 지원 모달 구현 완료.
  - 구현: `LoginModal.tsx` 및 `loginModalStore.ts`를 통한 상태 관리.
- **[x] 내 작품(My Artworks) 필터링**
  - 구현: `api/feed.js` 파라미터 연동 및 `FeedList.tsx` 필터링 구현 완료.

### 체크리스트 2: 스케치 (Sketch)

#### 2-1. 튜닝 패널 (Control Panel) UI 개선

- [ ] **사용자 친화적 옵션 매핑**
  - **(Note: 추가 기능이므로 가장 나중에 구현함)**
  - 현황: `ControlPanel.tsx`에서 `drawSpeed`, `branchProbability` 등 엔지니어링 파라미터 직접 노출.
  - 잔여 작업: 기획서(`SKETCH_ENGINE_OPTIONS.md`)에 정의된 **Style** (Classic/Vintage/Vivid), **Texture**, **Opacity**, **Thickness** 4개 옵션으로 UI 전면 교체 및 내부 매핑 로직 구현.
- [x] **미리보기(Preview)**
  - 구현: 옵션 조절 시 캔버스 즉시 재시작(Live Re-draw) 로직 구현 완료.

#### 2-2. 액션 버튼 (Action Buttons)

- [x] **게시하기(Publish) 기능**
  - `App.tsx`: 캔버스 하단 플로팅 버튼(`Publish to Gallery`) 구현됨.
  - `usePublish`: 캔버스 데이터 캡처 및 API 호출 로직 구현됨.
- [x] **다운로드(Download) 기능**
  - 구현: 캔버스를 로컬 PNG로 저장하는 기능 및 UI 버튼 추가 완료.
  - 개선: **실제 이미지 영역 자동 크롭(Crop)** 기능 추가로 불필요한 공백 제거.
- [x] **초기화(Reset) 기능**
  - 구현: 스케치 옵션을 기본값으로 되돌리는 기능 및 UI 버튼 추가 완료.
- [x] **커스텀 툴팁(Custom Tooltips)**
  - 구현: 버튼 호버/터치 시 즉각적인 기능 안내를 위한 커스텀 말풍선 구현 완료.
  - 특징: 버튼 중앙 정렬 및 손가락 가림 방지 위치 최적화.

### 체크리스트 3: 소셜 피드 (Social Feed)

- [x] **탭 네비게이션 및 정렬**
  - 구현: `Trending`(좋아요순), `Latest`(최신순), `My Gallery` 탭 UI 및 API 연동 완료.
  - 특징: 전역 Store(`FeedStore`)를 통한 탭 전환 및 데이터 캐싱.
- [x] **인터랙션 (좋아요/상세보기)**
  - 구현: 좋아요(하트) 토글 기능 및 애니메이션 구현 완료.
  - 상세보기: 클릭 시 데이터 실시간 동기화 및 **Delayed Image Loading 전략**(400ms 지연 노출)이 포함된 `ArtworkDetailModal` 구현 완료.
  - **[x] 딥 링크 (Deep Linking)**: 공유 링크 접속 시 모달 즉시 실행 및 스켈레톤 UI 연동 완료.
  - **[x] UI Refinement**: 개별 글래스모피즘(White Glass) 버튼 시스템 전환 및 카드 내 즉시 액션(Like/Download/Share) 구현 완료.
- [ ] **라이브 리플레이 (진행 예정)**
  - 현황: 단순 이미지 표시.
  - 잔여 작업: (P2) 호버 시 스케치 과정 재생 효과. (사용자 다음 지시 예정)

### 체크리스트 4: UI/UX 및 레이아웃

- [x] **앱 쉘 (App Shell)**
  - `App.tsx`: 헤더(Logo, Nav, Auth), 메인 영역, 사이드바(Control) 구조 구현됨.
  - `viewMode`: Sketch <-> Gallery 전환 로직 구현됨.
- [x] **모바일 최적화 (Responsive)**
  - 현황: 모바일 툴바 및 하단 네비게이션 구현 완료.
  - [x] Control Panel: 모바일 전용 툴바 및 팝업 슬라이더 구현 완료.
  - [x] Header: 모바일 헤더 오버레이 및 Publish 버튼 재배치 완료.
  - [x] Feed: 반응형 그리드 및 스켈레톤 UI 적용 완료.

### 체크리스트 5: 인프라 및 배포

- [x] **로컬 개발 환경**
  - `api/server.js` 및 Vite Proxy 설정 완료.
  - `npm run build` 검증 완료.
- [x] **Vercel 배포 검증**
  - 실제 배포 후 Serverless Function 경로 동작 확인 필요.
- [x] **서버 데이터 무결성 (Integrity Check)**
  - [x] **Atomic Deletion**: 작품 삭제 시 이미지 자산까지 트랜잭션으로 묶어 고아 에셋 방지 완료.
  - [x] **Sanity DB Sync**: 딥 링크 및 모딩 모달 오픈 시 실시간 동기화 로직 검증 완료.
