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

### 3-5. Parallel Pre-upload & Payload Optimization (게시 성능 최적화)

- **Parallel Pre-upload**: Vercel의 4.5MB 페이로드 제한을 준수하면서도 업로드 대기 시간을 0에 수렴시키기 위해 **선행 병렬 업로드** 전략을 사용합니다.
    1. **Trigger**: 사용자가 'Publish' 클릭 시 모달이 열림과 동시에 백그라운드에서 원본과 스케치 어셋 업로드를 병렬로 시작.
    2. **Wait-free UX**: 사용자가 제목을 입력하는 대기 시간을 활용해 업로드를 완료함으로써 최종 버튼 클릭 시 지연 최소화.
    3. **Finalize**: `/api/publish-v2` 엔드포인트를 통해 이미 업로드된 Asset ID들만 연결하여 최종 문서를 생성.
- **Payload Management**: 
    - 이미지 전송을 독립적인 요청으로 분리하여 각 요청당 **4.5MB** 제한을 안전하게 확보.
    - `AbortController`를 통해 모달 닫기나 취소 시 진행 중인 모든 네트워크 요청을 즉시 중단하여 리소스 낭비 및 상태 꼬임 방지.

### 3-6. Idempotent Metrics Synchronization (좋아요/수치 정합성)
좋아요 연타 시 데이터가 꼬이는 것을 방지하기 위해 서버와 클라이언트 모두 기술적 장치를 마련했습니다.
- **Server-Side**: `api/like.js`에서 현재 `likedBy` 배열 상태를 사전 조회하여 물리적으로 중복 요청을 무력화하는 멱등성 로직을 적용했습니다.
- **Client-Side**: `AsyncQueueManager`를 활용하여 연타 시 UI는 즉시 반영하되, 서버 통신은 순차적으로 처리하여 최종 의도(Final State)를 동기화합니다.

### 3-8. Universal Async Queue Engine (`AsyncQueueManager`)
고주파 인터랙션(연타 등)에 대응하기 위해 범용 비동기 큐 관리자를 도입했습니다.
- **위치**: `src/shared/utils/asyncQueue.ts`
- **역할**: 동일 ID에 대한 비동기 요청을 순차적으로 처리하며, 실행 중 추가 요청이 올 경우 마지막 상태만 버퍼링하여 불필요한 네트워크 비용을 절감합니다.
- **적용 대상**: 좋아요(`syncLike`), 다운로드/공유/리믹스(`syncMetric`).
- **Closure-Safe State Access**: 비동기 핸들러(`handleLike` 등) 내부에서 렌더링 시점의 Props(스냅샷)를 참조할 경우 발생하는 '과거 데이터 버그'를 방지하기 위해, 실행 시점에 `useStore.getState()`를 명시적으로 호출하여 **Zustand 스토어의 절대적 최신 상태**를 기반으로 연산을 수행합니다.

### 3-7. User Session Sync (Initial Setup)

---

## 4. 서버 아키텍처 (Unified Server)

Vite 개발 서버와 Express API 서버의 충돌을 방지하기 위한 통합 구조를 사용합니다. (`api/server.js`)

- **Unified Entry**: `api/server.js`에서 Express를 실행하고, Vite를 미들웨어로 주입합니다.
- **Single Port**: 모든 요청(API, Static, Frontend)은 단일 포트(3000)에서 처리되어 CORS 설정을 단순화합니다.
- **API Handling**: `/api/*` 요청은 로컬 Express 핸들러(`api/*.js`)가 처리하고, 그 외 요청은 Vite가 SPA로 서빙합니다.
- **Dynamic SEO Injection (Serverless)**: 
    - **Local**: `api/server.js` 미들웨어가 SEO 태그를 주입.
    - **Production (Vercel)**: `vercel.json`의 Rewrites 설정을 통해 루트(`/`) 요청을 `api/seo.js` 서버리스 함수로 라우팅하여, 정적 호스팅 환경에서도 동적 메타 태그(OGP)를 완벽하게 지원합니다.
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

### 6-3. Thumbnail Snapshot Strategy (Performance Optimization)

- **Scenario**: 스튜디오 모드에서 수십 개의 스타일 썸네일을 동시에 렌더링할 때 발생하는 CPU 부하 방지.
- **Implementation**: 
    1. 이미지가 로드되면 `renderInstant`를 통해 스타일별 스케치를 딱 1회 생성.
    2. 생성 완료 즉시 `toDataURL`을 사용하여 Base64 이미지 스냅샷 캡처.
    3. 이후 실시간 캔버스 대신 `<img>` 태그로 렌더링하여 브라우저 하드웨어 가속을 통한 부드러운 줌인 효과 확보.
- **Benefit**: 캔버스의 '지우기-그리기' 주기가 제거되어 전환 시 깜빡임(Flash) 현상을 근본적으로 해결하고, 스타일 개수 증가에도 안정적인 메모리 점유율을 유지.

### 6-4. ESM Environment Reliability (Hosting & Defaulting)

- **Issue**: ESM 모듈 시스템의 호이스팅 특성상 `dotenv.config()` 호출 전 모듈이 먼저 로드되어 환경 변수 참조에 실패하는 현상 대응.
- **Solution**: 
    - `api/server.js` 최상단에 `import 'dotenv/config'`를 배치하여 절대적 우선순위 확보.
    - API 핸들러 내에서 Sanity 클라이언트를 요청 시점마다 생성하는 팩토리 패턴(`getClient()`) 적용으로 런타임 환경 변수 정합성 보장.
    - 서버 부팅 및 API 요청 시 현재 사용 중인 `dataset` 명칭을 로그로 명시하여 육안 감시(Visual Monitoring) 체계 구축.

### 6-5. User Availability Safety Net (Fault Tolerance)

- **Principle**: 데이터베이스 초기화나 일시적 동기화 오류로 인해 Sanity에 유저 정보가 존재하지 않는 경우에도 서비스 연속성을 보장합니다.
- **Implementation**: 
    - `Publish` 최종 단계(`finalizePublish`) 직전에 `syncUserToSanity`를 명시적으로 호출하여, 유저 문서의 존재 여부를 런타임에 보장(Ensure)합니다.
    - 이는 '무중단 배포' 및 '데이터 정제 작업' 중에도 사용자의 핵심 액션(게시)이 중단 없이 수행되도록 하는 방어적 프로그래밍 전략입니다.

### 6-6. Admin Moderation & Content Safety

- **Principle**: 유해 콘텐츠를 즉각 관리하기 위해 신뢰할 수 있는 사용자에게 수퍼 어드민 권한을 부여합니다.
- **Implementation**: 
    - 환경 변수(`VITE_ADMIN_UIDS`)에 등록된 UID는 런타임에 서비스 전체의 삭제 권한을 가집니다.
    - 백엔드 삭제 API는 '소유자 본인' 혹은 '어드민'인 경우에만 Sanity 트랜잭션을 승인하도록 설계되었습니다.

### 6-7. Security & Protocol Integrity (Mixed Content Prevention)

- **Principle**: 실서버(HTTPS) 환경에서 비보안 리소스(HTTP) 요청으로 인한 보안 취약점 및 브라우저 경고를 방지합니다.
- **Implementation**: 
    - 카카오 등 외부 Provider로부터 유입되는 프로필 이미지 주소가 `http`일 경우, 런타임 및 DB 저장 단계에서 즉시 `https`로 강제 변환합니다.
    - 이를 통해 브라우저의 자동 업스트림 업그레이드에 의존하지 않고 명시적인 보안 통신을 유지합니다.

### 6-7. Lean Development Logging

- **Policy**: 프로덕션 빌드에서 불필요한 시스템 로그 노출을 최소화합니다.
- **Implementation**: 
    - 개발 단계의 검증용 로그(`Main.tsx 실행 확인` 등)는 배포 전 전수 제거합니다.
    - 서버 로그(`api/server.js`)는 환경 변수와 데이터셋 식별 등 핵심 운영 정보로 한정하여 보안성과 가독성을 높입니다.

---

## 7. 문제 해결 및 서버 관리 (Troubleshooting)

### 7-1. 좀비 프로세스 관리 (Zombie Process)

윈도우 환경에서 서버 재시작 시 이전 프로세스가 포트(3000)를 점유하여 요청이 증발하거나 구버전 코드가 실행되는 현상이 발생할 수 있습니다. 

- **증상**: 코드를 수정했는데 반영이 안 됨, API 요청이 무한 대기(Pending) 상태에 빠짐.
- **해결**: 아래 명령어를 터미널에서 실행하여 모든 노드 프로세스를 강제 종료한 후 다시 실행합니다.
  ```powershell
  taskkill /F /IM node.exe
  ```

### 7-2. API Runtime Guide (Standardization)

- **Runtime**: 모든 API 핸들러는 Vercel **Node.js Runtime**을 표준으로 사용합니다.
- **Warning**: `Edge Runtime`은 `@sanity/client` 일부 기능 및 Node.js 표준 API(`Buffer` 등)와 호환성 이슈가 발생할 수 있으므로, 명시적인 이유가 없는 한 사용을 금지합니다.
- **Sync Issue**: `sync-user.js`와 같은 동기화 모듈에서 런타임 설정이 잘못될 경우 유저 정보가 유실되어 서비스 전반에 장애를 초래할 수 있으니 `export const config = { runtime: 'nodejs' }` 또는 기본값을 준수합니다.

### 7-3. Data Management Procedure (Maintenance)

- **전수 초기화**: 데이터셋을 완전히 비우고 다시 시작해야 할 경우 `scripts/clear-sanity-data.js`를 사용합니다.
- **주의 사항**: 참조 관계(References) 에러 방지를 위해 스크립트 내부적으로 `artwork` -> `user` -> `assets` 순서로 정교하게 삭제를 수행합니다.
