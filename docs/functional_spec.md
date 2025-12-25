# 상세 기능 명세서 (Functional Specification)

## 1. 인증 및 사용자 관리 (Auth)

### 1-1. 전용 로그인 모달 (LoginModal)

- '게시하기'나 '좋아요' 클릭 시 현재 화면을 유지한 채로 소셜 로그인 유도.
- 로그인 성공 시 모달이 닫히고 중단되었던 액션이 자연스럽게 이어지도록 설계.

### 4-1. Masonry Grid & Responsive Motion

- **Grid Capacity**: 최대 **9컬럼** 무한 스크롤 연동 기반의 Masonry 레이아웃 제공.
- **Smart Reflow**:
  - 창 크기 변경 시 `ResizeObserver`가 실시간으로 최적 컬럼 수를 재계산함.
  - **Desktop Mode**: 0.15초 감속 애니메이션과 함께 부동운 위치 재배치 제공. 마우스 호버 시 액션 버튼(Like, Download, Share) 노출.
  - **Mobile Mode**: 즉각적인 레이아웃 변환(Snap)을 통해 기기 성능 최적화. 호버 제약 극복을 위해 액션 버튼 상시 노출. 또한, 상세 모달 진입 시 `h-[85vh]`로 높이를 고정하여 레이아웃 안정성을 보장하며, 이미지는 좌/우 상단 랜덤 마스크 리빌(Mask Reveal) 효과로 웅장하게 등장함.
  - **Admin Policy**: 지정된 어드민 UID으로 로그인 시, 모든 작품 카드 및 상세 모달에서 '삭제' 권한을 행사할 수 있는 독점적 인터페이스가 활성화됨.

---

### 1-2. 프로필 관리

- 상단/하단 내비게이션에 사용자 아바타 노출. 로그아웃 기능 포함.

---

## 2. 스케치 (Sketch)

### 2-1. SketchEngine 분석 로직

-2.  **CORS & Cache Control**:
    - 외부 이미지 분석 시 픽셀 데이터를 읽기 위해 `crossOrigin="anonymous"` 속성을 명시적으로 사용합니다. (실서버 렌더링 정상화)
    - 브라우저 캐시 충돌 방지를 위해 **Timestamp Cache Buster**를 URL에 추가합니다.
3.  **Layout Stability**:
    - `prepareCanvas`는 뷰포트 레이아웃 정착 후(`requestAnimationFrame`) 실행되어 정확한 좌표 계산을 보정합니다.
4. **Runtime Specification**:
    - 모든 서버리스 함수는 Node.js 런타임을 표준으로 하며, Edge Runtime 환경 배제 정책을 준수하여 라이브러리 호환성을 확보합니다.

### 2-1-1. 파일 용량 제한 (Payload Constraints)

- **Client-side Limit**: 업로드 시 파일 크기를 체크하여 **4MB** 초과 시 업로드를 차단하고 경고 모달을 노출합니다.
- **UX Policy**: 경고 모달은 별도의 취소(Cancel) 버튼 없이 'Understood' 버튼만 제공하여, 시스템 제약 사항에 대한 사용자의 명확한 인지를 유도합니다.
- **Reason**: 서버(Vercel) 페이로드 제한 준수 및 안정적인 데이터 전송을 보장하기 위함입니다.

### 2-2. 튜닝 및 미리보기

- 옵션 변경 시 캔버스 즉시 재시작(Live Re-draw).
- **Rendering Strategies**:
    - **Live Animation**: `requestAnimationFrame`을 사용하여 과정을 보여줌 (UX용).
    - **Instant Completion**: 동기 루프를 통해 결과물을 즉시 생성 (썸네일/다운로드용).
- 모바일에서는 엄지손가락 영역 내 **Bottom Sheet** 형태의 컨트롤 패널 제공.
- **Studio Navigation**:
  - **Back Button**: 스튜디오 좌측 상단에 배치된 원형 버튼을 통해 언제든지 갤러리 피드로 복귀 가능 (`setViewMode('feed')`).
  - **Tooltip Support**: 호버 시 이동 경로를 명시적으로 안내하여 UX 심리적 안전감 확보.
- **Style Selection UI**:
  - 카드 간 구분 명확화를 위해 평상시 `Zinc-300` 테두리 적용.
  - 마우스 호버 및 스타일 선택 시 `Zinc-800`으로 테두리 색상 강화 피드백 제공.
  - 모든 테두리 두께는 시스템 툴팁과 동일하게 유지하여 시각적 일관성 확보.
- **Thumbnail Snapshot Strategy**: 썸네일 스타일 카드에서 실시간 캔버스 대신 정적 이미지(Base64) 스냅샷을 사용하여 줌 애니메이션 깜빡임 현상을 제거하고 성능 최적화 완료.
- **Signature Hover**: PC 뷰에서 마우스 오버 시 소스 이미지가 **3초**에 걸쳐 서서히 사라지며 그 뒤에서 실시간으로 그려지는 스케치 과정을 노출합니다.
- **Vintage Tinting**: Vintage 스타일 선택 시 전용 색상 선택기(Color Picker)가 활성화되어 결과물의 틴트 톤을 실시간으로 조절할 수 있습니다.
- **Mobile UX Optimization**:
  - **가로 썸네일 뷰**: 하단 가로 스크롤 및 상단 텍스트 정보 배치를 통해 캔버스 가림 현상 해결.
  - **Zero Delay**: 스타일 변경 시 엔진을 즉시 업데이트하여 빠릿한 반응성 제공 (인위적 딜레이 제거).
  - **Smart Overlay**: `Vintage` 선택 시 틴트 피커가 독립 패널로 오버레이되며, `Classic` 및 `Vivid` 선택 시 패널이 자동 닫힘.
  - **Style Synchronization (Vintage)**: `Vintage` 모드는 `Momentum`과 `Alpha` 등 드로잉 질감 파라미터를 `Classic`과 동일하게 동기화하여 일관된 펜 터치를 제공하되, 독자적인 `Tint Color` 기능을 통해 감성적인 차별화를 둡니다.

### 2-3. 수정 및 리믹스 (Edit/Remix)

- **Edit**: 본인 작품 클릭 시 기존 옵션을 그대로 스튜디오로 로드.
- **Remix**: 타인 작품 클릭 시 설정값을 복제하여 새로 그리기.
- **UX**: 해당 모드 진입 시 불필요한 알림 토스트를 제거하여 즉각적인 편집 경험 제공.

---

## 3. 소셜 피드 (Social Feed)

### 3-1. 아트워크 카드 인터랙션

- **Glassmorphism Buttons**: 카드 호버 시 좋아요, 다운로드, 공유 버튼 노출.
- **Signature Hover**: PC 뷰(1024px 이상)에서 호버 시 썸네일이 **3초**간 사라지며 실시간 스케치 드로잉 중첩 노출. (모바일 판단 기준: 화면 너비)
- **Stop Propagation**: 카드 내 버튼 클릭 시 상세 모달이 중복으로 열리지 않도록 이벤트 전파 차단.
- **Robust Counter Interface**: 좋아요, 다운로드, 공유, 리믹스 버튼은 **Async Queue Engine** 기반의 고성능 백그라운드 동기화가 적용되어 있습니다. 사용자가 연타하더라도 UI는 즉시 반응하며, 서버 통신은 순차적으로 처리되어 수치 정합성이 깨지지 않는 안정적인 사용자 경험을 제공합니다.

### 3-2. 상세보기 모달

- **Deep Linking**: `?artwork=ID` 파라미터 감지 시 모달 즉시 실행.
- **Tooltips**: 모든 액션 버튼에 전역 공통 스타일이 적용된 대문자(UPPERCASE) 툴팁 적용.
- **Dynamic SEO Preview**: 
    - **Architecture**: Vercel의 Serverless Function(`api/seo.js`)을 활용하여 루트(`/?artwork=ID`) 접속 시 실시간으로 HTML 메타 태그를 동적 주입합니다.
    - **Metadata**: 카카오톡, 트위터 등 SNS 공유 시 작품의 **제목**과 **이미지**가 카드 형태로 완벽하게 노출되도록 Open Graph(OG) 및 Twitter Card 표준을 준수합니다.
    - **Description Strategy**: "누가 만들었는지"보다 **"작품의 제목"**을 최우선으로 노출하여 클릭률(CTR)과 사용자 흥미를 극대화합니다.

---

## 4. 게시 및 공유 (Publish Flow)

### 4-1. 전용 게시 모달 (PublishModal)

- **Preview**: 캔버스 내용을 실시간 캡처하여 미리보기 제공.
- **Background Pre-upload**: 
    - 모달이 활성화되는 즉시 백그라운드에서 **원본 및 스케치 이미지 업로드**를 병렬로 시작하여 사용자 대기 시간을 활용함.
    - 게시 확정 시점에서 업로드가 미완료된 상태라면 완료될 때까지 대기하도록 설계.
- **Fail-safe Logic (Safety Net)**: 
    - **User Availability Check**: 게시(`finalizePublish`) 직전에 유저 정보가 Sanity에 존재하는지 런타임에 보장하여 DB 초기화 중에도 게시 실패 차단.
    - `AbortController`를 연동하여 모달 폐쇄 시 진행 중인 모든 네트워크 요청을 즉시 중단함.
    - 발행 성공 후에는 스튜디오 상태를 초기화하여 새로운 작업 준비 보장.
- **Error Feedback**: 발행 실패 시 상세한 원인을 토스트로 노출하며, 취소된 요청에 대해서는 불필요한 에러 알림을 생략함.등)를 토스트로 노출하여 근본 원인 파악 지원.

---

## 5. 관리용 스크립트 (Admin Utilities)

### 5-1. 데이터셋 누킹 (`nuke-dataset.js`)

- 테스트 중 쌓인 불필요한 데이터를 한 번에 정리.
- 작품(`artwork`) 뿐만 아니라 연결된 **Sanity Image Asset**까지 전수 조사하여 삭제함으로써 저장소 효율성 관리.

### 5-2. 배포 환경 대응

- 모든 API 호출 시 `VITE_SANITY_DATASET` 환경 변수를 자동 매핑하여, 한 번의 코드 수정 없이 로컬(`development`)과 실서버(`production`) 데이터를 유연하게 제어.

---

## 6. 레이아웃 및 성능

### 5-0. Responsive Grid (Masonry)

- **Logic Separation**: `useResponsiveGrid` 훅을 통해 화면 너비에 따라 최적의 컬럼 수를 계산합니다. (TDD 검증 완료)
- **Performance**: ResizeObserver를 활용하여 불필요한 리렌더링을 최소화합니다.

### 5-1. 포트 관리 (Port 3000)

- 모든 API 요청 및 프론트엔드 서빙은 `localhost:3000`을 기준으로 동작하며, Sanity CORS 설정도 이에 맞춰 관리됩니다.

### 5-2. 로딩 애니메이션

- 이미지 로딩 시 **Fade-in Reveal** 효과 (0.7s)를 통해 고급스러운 이미지 노출 구현.

### 6-2. Mobile Resource Management

- 기기 성능 편차를 고려하여, 하단 컨트롤 패널의 확장이 수반되는 스타일 변경 시 **즉시 드로잉 엔진을 정지하고 캔버스를 비웁니다.**
- 레이아웃 애니메이션 완료 후 (**500ms 지연**) 새 스타일의 드로잉을 시작하여 UI 뚝끊김(Visual Stuttering)을 방지합니다.
