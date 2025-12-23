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
  - **Mobile Mode**: 즉각적인 레이아웃 변환(Snap)을 통해 기기 성능 최적화. 호버 제약 극복을 위해 액션 버튼 상시 노출.

---

### 1-2. 프로필 관리

- 상단/하단 내비게이션에 사용자 아바타 노출. 로그아웃 기능 포함.

---

## 2. 스케치 (Sketch)

### 2-1. SketchEngine 분석 로직

- **CORS 대응**: Sanity CDN 이미지 로드 시 캐시 충돌을 방지하기 위해 **Cache Buster (`?t=Timestamp`)**를 URL에 추가합니다.
- **Blob 예외 처리**: 사용자가 로컬에서 갓 업로드한 이미지(`blob:`)에는 쿼리 스트링을 붙이지 않아 로드 오류를 원천 차단합니다.

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
- **Vintage Tinting**: Vintage 스타일 선택 시 전용 색상 선택기(Color Picker)가 활성화되어 결과물의 틴트 톤을 실시간으로 조절할 수 있습니다.

### 2-3. 수정 및 리믹스 (Edit/Remix)

- **Edit**: 본인 작품 클릭 시 기존 옵션을 그대로 스튜디오로 로드.
- **Remix**: 타인 작품 클릭 시 설정값을 복제하여 새로 그리기.
- **UX**: 해당 모드 진입 시 불필요한 알림 토스트를 제거하여 즉각적인 편집 경험 제공.

---

## 3. 소셜 피드 (Social Feed)

### 3-1. 아트워크 카드 인터랙션

- **Glassmorphism Buttons**: 카드 호버 시 좋아요, 다운로드, 공유 버튼 노출.
- **Stop Propagation**: 카드 내 버튼 클릭 시 상세 모달이 중복으로 열리지 않도록 이벤트 전파 차단.

### 3-2. 상세보기 모달

- **Deep Linking**: `?artwork=ID` 파라미터 감지 시 모달 즉시 실행.
- **Tooltips**: 모든 액션 버튼에 전역 공통 스타일이 적용된 대문자(UPPERCASE) 툴팁 적용.

---

## 4. 게시 및 공유 (Publish Flow)

### 4-1. 전용 게시 모달 (PublishModal)

- **Preview**: 캔버스 내용을 실시간 캡처하여 미리보기 제공.
- **Sequential Integrity**: 
    1. 발행 버튼 클릭 시 즉시 데이터 **Snapshot** 생성 (캔버스, 옵션, 소스 이미지).
    2. 서버로 비동기 전송 시작.
    3. 서버 성공 응답 확인 후 모달 폐쇄 및 상태 초기화 시작. (청소는 반드시 전송 완료 후에 수행)
- **Error Feedback**: 발행 실패 시 상세한 에러 메시지(예: 캔버스 데이터 누락, 서버 500 에러 내용 등)를 토스트로 노출하여 근본 원인 파악 지원.

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
