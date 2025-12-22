# Architecture & Engineering Principles

## 1. Core Philosophy (Gemini Principles)

本 프로젝트는 **Gemini Engineering Principles**를 준수하여, 유지보수성과 확장성을 최우선으로 고려합니다.

### 1-1. TDD & Clean Code

- **Test First**: 기능 구현 전 실패하는 테스트 작성을 지향합니다.
- **Fail Fast**: 치명적인 오류나 인증 실패 시 예외를 즉각 발생시켜 디버깅을 용이하게 합니다.
- **Single Source of Truth (SSOT)**: Zustand를 활용해 모든 상태의 출처를 단일화합니다.

---

## 2. Modularity Strategy (모듈화 전략)

### 2-1. Component Separation

- **Feature-based Structure**: 인증(`auth`), 피드(`feed`), 스케치(`sketch`) 등 기능 단위로 폴더를 구성(`src/features/`)하여 응집도를 높입니다.
- **Shared Layer**: 전역적으로 사용되는 모달, 토스트, 유틸리티는 `src/shared/`에서 관리합니다.

### 2-2. State Management (Zustand)

각 기능 모듈은 독립적인 Store를 가지며, 전역 상태는 Shared Layer에서 관리합니다.

- **Auth Store**: `useAuthStore` (`src/features/auth/model/store.ts`) - 사용자 세션 및 프로필 관리.
- **Feed Store**: `useFeedStore` (`src/features/feed/model/feedStore.ts`) - 작품 목록, 탭 상태, 좋아요/삭제 동기화.
- **Sketch Store**: `useSketchStore` (`src/features/sketch/model/store.ts`) - 캔버스 이미지 소스, 옵션, 드로잉 상태 관리.
- **UI Store**: `useUIStore` (`src/shared/model/uiStore.ts`) - 뷰 모드(Studio/Feed) 및 액티브 탭 전역 관리.
- **Modal Stores**:
    - `usePublishModalStore`: 게시 모달 상태 및 캔버스 스냅샷 데이터.
    - `useLoginModalStore`: 로그인 모달 상태.
    - `useToastStore`: 전역 토스트 알림 상태.
    - `useModalStore`: 기타 일반 모달 상태.

---

## 3. 데이터 동기화 전략 (Synchronization)

### 3-1. Data Freshness (상세 보기 로직)

- 상세 모달 오픈 시 클라이언트의 낡은 데이터 대신 서버에서 최신 데이터(`fetchArtworkById`)를 다시 가져와 실시간 수치를 보정합니다.

### 3-2. Atomic Deletion

- 작품 삭제 시 Sanity 트랜잭션을 사용하여 `artwork` 문서와 연결된 `imageAsset`을 원자적으로 삭제함으로써 고아 에셋 발생을 원천 차단합니다.

### 3-3. Metadata Bridge (Canvas Interaction)

- 캔버스 엔진(`SketchEngine`)과 UI 간의 소통을 위해 HTML5 **Data Attributes**를 활용합니다. 엔진이 계산한 이미지 좌표 정보를 DOM에 기록하고, UI가 이를 읽어 크롭 다운로드 등에 활용합니다.

---

## 4. 서버 아키텍처 (Unified Server)

Vite 개발 서버와 Express API 서버의 충돌을 방지하기 위한 통합 구조를 사용합니다. (`api/server.js`)

- **Unified Entry**: `api/server.js`에서 Express를 실행하고, Vite를 미들웨어로 주입합니다.
- **Single Port**: 모든 요청(API, Static, Frontend)은 단일 포트(3000)에서 처리되어 CORS 설정을 단순화합니다.
- **API Handling**: `/api/*` 요청은 로컬 Express 핸들러(`api/*.js`)가 처리하고, 그 외 요청은 Vite가 SPA로 서빙합니다.

---

## 5. 로딩 전략 (Loading Strategy)

### 5-1. Skeleton UI

- **zinc-200 Standard**: 피드 및 모달 로딩 시 부드러운 박동 효과를 위해 `zinc-200` 색상의 스켈레톤을 활용합니다.
- **Instant Frame**: 딥 링크 접속 시 데이터를 기다리지 않고 모달의 외곽 틀을 먼저 렌더링하여 반응성을 극대화합니다.

### 5-2. Delayed Exposure

- 이미 캐싱된 이미지 로드 시 찰나의 로딩 UI가 깜빡이는 것을 방지하기 위해 **400ms 지연 노출** 전략을 사용합니다.
