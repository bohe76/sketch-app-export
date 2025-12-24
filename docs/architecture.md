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
- **Sketch Store**: `useSketchStore` (`src/features/sketch/model/store.ts`) - 캔버스 이미지 소스, 옵션, 드로잉 상태 관리. `isPaused` 필드를 통해 애니메이션 중 엔진 가동 여부를 제어.
- **UI Store**: `useUIStore` (`src/shared/model/uiStore.ts`) - 뷰 모드(Studio/Feed) 및 액티브 탭 전역 관리.
- **Modal Stores**:
    - `usePublishModalStore`: 게시 모달 상태 및 캔버스 스냅샷 데이터.
    - `useLoginModalStore`: 로그인 모달 상태.
    - `useToastStore`: 전역 토스트 알림 상태.
    - `useModalStore`: 기타 일반 모달 상태. `cancelText`가 빈 문자열(`""`)일 경우 '취소' 버튼을 렌더링하지 않는 가변 인터랙션 지원.

### 2-3. Shared Resources (Refactored)

- **Config**: 상수(`constants.ts`)를 중앙화하여 유지보수성을 확보합니다.
- **Types**: 전역 타입(`types.ts`)을 정의하여 컴포넌트 간 타입 일관성을 보장합니다.
- **Custom Hooks**: 비즈니스 로직(예: `useSketchFlow`, `useResponsiveGrid`)을 훅으로 분리하여 뷰와 로직을 철저히 격리합니다.

---

## 3. 데이터 동기화 전략 (Synchronization)

### 3-1. Data Freshness (상세 보기 로직)

- 상세 모달 오픈 시 클라이언트의 낡은 데이터 대신 서버에서 최신 데이터(`fetchArtworkById`)를 다시 가져와 실시간 수치를 보정합니다.

### 3-2. Atomic Deletion

- 작품 삭제 시 Sanity 트랜잭션을 사용하여 `artwork` 문서와 연결된 `imageAsset`을 원자적으로 삭제함으로써 고아 에셋 발생을 원천 차단합니다.

### 3-3. Fixed Column Domes (Motion Stability)

- 브라우저 리사이즈 시 썸네일 이동 애니메이션의 끊김을 방지하기 위해 **최대 9개의 정적 컬럼 노드**를 DOM에 상주시키는 방식을 사용합니다.
- 컬럼 개수가 줄어들더라도 노드를 파괴(Unmount)하지 않고 `flex: 0`, `maxWidth: 0`으로 수렴하게 하여 아이템이 '이미 존재하는 부모' 사이를 부드럽게 이동하도록 보장합니다.

### 3-4. Hybrid Interaction Propagating

- 부모 컴포넌트(`FeedList`)에서 감지한 `isDesktop` 상태를 자식 컴포넌트(`ArtworkCard`)로 전파하여 모바일 환경 여부에 따른 조건부 UI(예: 액션 버튼 항시 노출 여부)를 결정합니다.

### 3-5. Metadata Bridge (Canvas Interaction)

### 3-4. Data Snapshotting (Publish Flow)

- 게시(`Publish`) 과정에서 비동기 전송 시점의 데이터 무결성을 보장하기 위해 **Snapshot** 방식을 사용합니다.
- 통신이 시작되는 즉시 캔버스 베이스64, 드로잉 옵션, 원본 이미지 정보를 상수로 고정하여, 업로드 도중에 스토어 상태가 변경되거나 초기화되어도 안전하게 전송될 수 있도록 설계되었습니다.

### 3-5. Sequential Upload & Payload Management

- **Payload Separation**: Vercel의 4.5MB 요청 제한을 극복하기 위해 **2단계 순차 업로드**를 수행합니다.
    1. `/api/upload-asset`: 원본 이미지를 먼저 업로드하여 Sanity `assetId`를 획득.
    2. `/api/publish`: 스케치 결과물과 위에서 받은 `assetId`를 함께 전송하여 최종 문서를 생성.
- **Size & Timeout Limits**: 
    - 각 이미지당 **최대 4MB**까지 허용 (전체 발행 시 약 8MB 수준).
    - Vercel Serverless Function 타임아웃 방지를 위해 `/api/publish` 등 핵심 엔드포인트에 `maxDuration: 60` 설정을 적용하여 안정적인 대용량 처리를 보장합니다.

---

## 4. 서버 아키텍처 (Unified Server)

Vite 개발 서버와 Express API 서버의 충돌을 방지하기 위한 통합 구조를 사용합니다. (`api/server.js`)

- **Unified Entry**: `api/server.js`에서 Express를 실행하고, Vite를 미들웨어로 주입합니다.
- **Single Port**: 모든 요청(API, Static, Frontend)은 단일 포트(3000)에서 처리되어 CORS 설정을 단순화합니다.
- **API Handling**: `/api/*` 요청은 로컬 Express 핸들러(`api/*.js`)가 처리하고, 그 외 요청은 Vite가 SPA로 서빙합니다.
- **Dynamic SEO Injection**: 소셜 봇 대응을 위해 루트 경로(`/`) 요청 시 `?artwork=ID` 파라미터를 감지하면, 서버 단에서 Sanity 데이터를 조회하여 `index.html`의 메타 태그(OG, Twitter)를 실시간으로 교체하여 응답합니다.
- **Environment Aware**: 모든 API 엔드포인트는 `VITE_SANITY_DATASET` 환경 변수를 참조하여 `development`와 `production` 환경 간의 데이터 정합성을 유지합니다.

---

## 5. 관리 및 유틸리티 스크립트 (Admin Scripts)

반복적인 관리 업무 및 데이터 정리를 위한 전용 노드 스크립트를 제공합니다. (`scripts/`)

- **`nuke-dataset.js`**: 현재 설정된 Sanity 데이터셋의 모든 작품(`artwork`)과 연결된 이미지 에셋을 통째로 삭제하여 깨끗한 테스트 환경을 구축합니다.
- **`check-users.js`**: 현재 등록된 사용자 목록과 닉네임 상태를 점검합니다.
- **`migrate-published-at.js`**: 기존 데이터의 발행일 형식을 최신 스펙으로 일괄 마이그레이션합니다.

---

## 6. 로딩 전략 (Loading Strategy)

### 5-1. Skeleton UI

- **zinc-200 Standard**: 피드 및 모달 로딩 시 부드러운 박동 효과를 위해 `zinc-200` 색상의 스켈레톤을 활용합니다.
- **Instant Frame**: 딥 링크 접속 시 데이터를 기다리지 않고 모달의 외곽 틀을 먼저 렌더링하여 반응성을 극대화합니다.

### 5-2. Delayed Exposure

- 이미 캐싱된 이미지 로드 시 찰나의 로딩 UI가 깜빡이는 것을 방지하기 위해 **400ms 지연 노출** 전략을 사용합니다.

### 5-3. Kill & Defer (Mobile Optimization)

- 모바일 기기 성능 최적화를 위해 **레이아웃 변화(예: 빈티지 틴트 피커 확장) 감지 시 즉시 엔진 중지 및 캔버스 소거**를 수행합니다.
- UI 애니메이션이 완료된 것으로 판단되는 **500ms** 후에 드로잉을 재개하여, 인터랙션의 부드러움과 결과물의 정확도를 모두 확보합니다.

---

## 7. 문제 해결 및 서버 관리 (Troubleshooting)

### 7-1. 좀비 프로세스 관리 (Zombie Process)

윈도우 환경에서 서버 재시작 시 이전 프로세스가 포트(3000)를 점유하여 요청이 증발하거나 구버전 코드가 실행되는 현상이 발생할 수 있습니다. 

- **증상**: 코드를 수정했는데 반영이 안 됨, API 요청이 무한 대기(Pending) 상태에 빠짐.
- **해결**: 아래 명령어를 터미널에서 실행하여 모든 노드 프로세스를 강제 종료한 후 다시 실행합니다.
  ```powershell
  taskkill /F /IM node.exe
  ```

### 7-2. 데이터 정합성 체크

발행 과정에서 문제가 발생할 경우, 다음 스크립트로 실제 Sanity에 데이터가 도달했는지 확인할 수 있습니다.
```bash
node scripts/sanity-check.js
```
