# PRD: Sketchrang (스케치랑)

## 1. 개요 (Product Overview)

### 1.1 제품 소개

사용자가 사진을 업로드하면, 독자적인 알고리즘(Sketch Engine)이 이를 실시간으로 감각적인 드로잉으로 변환해 주는 웹 서비스입니다. 단순한 변환 도구를 넘어, 결과물과 그 **생성 과정**을 공유하고 서로 '좋아요'를 누르며 경쟁하는 **창작 소셜 놀이터**입니다.

### 1.2 핵심 가치 (Core Value)

- **Everyone is an Artist**: 그림 실력이 없어도, 감각적인 옵션 조절(Tuning)만으로 멋진 작품을 만들 수 있습니다.
- **Visual Satisfaction**: 결과물뿐만 아니라, 펜들이 움직이며 그림을 완성해가는 **과정의 시각적 쾌감**을 제공합니다.
- **Social Recognition**: 나의 감각(옵션 튜닝 능력)을 랭킹 시스템을 통해 인정받을 수 있습니다.

### 1.3 핵심 용어 (Core Terminology)

서비스의 정체성과 직관성을 유지하기 위해 다음의 라벨(Label)은 고유 명사로 취급하며 임의로 변경하거나 번역하지 않습니다.
- **Sketch**: 드로잉 창작 공간 (Studio Mode)
- **Gallery**: 창작물 공유 피드 (Feed Mode)
- **Change Image**: 이미지 업로드/교체 버튼 (기능 라벨)

### 1.4 리팩토링 및 마이그레이션 원칙
- **Visual Integrity**: 기술적 스택 전환(예: Next.js 마이그레이션) 시 기존의 레이아웃, 여백, 폰트 굵기를 1:1로 보존하는 것을 제1원칙으로 합니다. (시각적 오차 제로 지향)
- **Label Consistency**: AI나 개발자의 자의적인 판단으로 UI 텍스트를 변경하는 것을 금지합니다.

---

## 2. 타겟 사용자 (Target User)

- **SNS 헤비 유저**: 인스타그램, 프로필 사진 등에 사용할 유니크한 이미지를 찾는 사람.
- **창작 욕구 보유자**: 그림을 잘 그리고 싶지만 기술이 부족해 대리 만족을 원하는 사람.
- **관찰자**: 멍하니 그림이 그려지는 과정을 보며 힐링(ASMR적 시각 경험)하고 싶은 사람.

---

## 3. 핵심 기능 (Key Features)

### 3.1 Sketch (창작 스케치)

사용자가 작품을 만드는 공간입니다.

- **이미지 업로드**: 드래그 앤 드롭으로 사진 업로드.
- **실시간 튜닝 (Live Tuning)**:
  - **Style**: Classic(흑백), Vintage, Vivid(컬러 등)
  - **Texture**: 부드럽게(Realistic) <-> 거칠게(Expressive)
  - **Detail**: 펜 굵기, 잉크 농도 조절.
- **Preview**: 옵션을 만질 때마다 즉각적으로 반응하는 썸네일 프리뷰.
- **Publish**: 제목과 설명을 달아 피드에 게시. **전용 게시 모달(PublishModal)**을 통해 미리보기 및 제목 작성이 가능합니다.
- **Snappy Response**: 모든 레이아웃 전환은 0.15초 내에 이루어져야 하며, 쫀득한 감속 효과를 통해 고급스러운 UX를 지향합니다.
- **Ultra-High-Res Support**: 고해상도 환경에서 최대 9컬럼까지 확장되는 압도적인 시각적 갤러리 경험 제공.
- **Mobile First Accessibility**: 호버가 불가능한 환경을 고려하여 좋아요/다운로드/공유 등 핵심 액션 버튼 항시 노출.
- **Download**: 완성된 작품을 내 기기에 고화질 이미지(PNG)로 즉시 저장. (개인 소장용)
- **Flicker-free Performance**: 줌인/줌아웃 시 캔버스 대신 고화질 스냅샷 이미지를 사용하여 깜빡임 방지.
- **Visual Stability (CLS)**: 모바일 상세 모달의 초기 로딩 시 최소 높이(`80vh`)를 확보하여 레이아웃 점프 현상 완전 제거.
- **Responsive Layout**: PC/Mobile 디바이스에 따른 최적화된 그리드 시스템 (Masonry Layout).
- **Interactive Share**: 브라우저 기본 공유가 아닌, 직관적이고 아름다운 커스텀 공유 시트(Share Sheet).

### 3.2 Feed (소셜 피드)

다른 사람들의 작품을 감상하는 공간입니다.

- 모바일에서는 엄지손가락 영역 내 **Bottom Sheet** 형태의 컨트롤 패널 제공.
- **Thumbnail Snapshot Strategy (New)**: 스타일 카드의 썸네일을 캔버스가 아닌 정적 이미지(Base64)로 렌더링하도록 캡처하여, 줌 동작이나 스크롤 시 CPU 부하와 깜빡임을 근본적으로 제거함.
- **Studio Navigation**:
  - **Back Button**: 스튜디오 좌측 상단에 배치된 원형 버튼을 통해 언제든지 갤러리 피드로 복귀 가능 (`setViewMode('feed')`).
  - **Tooltip Support**: 호버 시 이동 경로를 명시적으로 안내하여 UX 심리적 안전감 확보.
  - **Share (공유)**: Web Share API를 활용한 PC/Mobile 통합 공유.
  - **Download (다운로드)**: 고화질 PNG 저장 및 횟수 트래킹.
  - **Remix & Edit (리믹스 및 수정)**: 다른 사람의 설정값을 가져와 그리거나(Remix), 본인의 작품을 다시 수정(Edit)할 수 있습니다.
- **Tabs**: `[Trending | Latest | My Gallery]`. 별도의 마이페이지 없이 탭으로 내 작품 관리.

---

## 4. 데이터 구조 (Data Structure - Draft)

### 4.1 Artwork (작품)

서버에는 완성된 그림 파일만 저장하는 것이 아니라, **그림을 다시 그릴 수 있는 레시피**를 저장합니다.

```json
{
  "id": "uuid",
  "author_id": "user_123",
  "source_image_url": "s3://path/to/original.jpg",
  "final_image_url": "s3://path/to/result.png",
  "options": {
      "momentum": 0.5,
      "alpha": 0.1,
      "head_count": 64,
      "style_mode": "black_white"
  },
  "likes_count": 120,
  "created_at": "2025-12-20T..."
}
```

---

## 5. 사용자 시나리오 (User Journey)

1. **접속**: 멋진 그림들이 라이브로 그려지고 있는 메인 화면에 접속.
2. **영감**: 'Weekly Best'에 걸린 사자 그림을 보고 감탄함. "나도 해볼까?"
3. **창작**: `Sketch` 버튼 클릭 -> 내 강아지 사진 업로드.
4. **튜닝**: 처음엔 너무 사실적이라 재미없음. '관성'을 낮추고 '펜 굵기'를 키우니 힙한 크로키 느낌이 남. 만족.
5. **공유**: "우리 집 댕댕이 크로키"라는 제목으로 게시.
6. **확산**: 다음 날, 내 그림이 'Daily Best' 3위에 올라가 있고 알림이 옴. 뿌듯함을 느낌.
- **Fail-safe Logic (Safety Net)**: 
    - **User Availability Check**: 게시(`finalizePublish`) 직전에 유저 데이터 존재 여부를 런타임에 확인하고 필요 시 즉시 동기화(Sync)하여 DB 초기화 상황에서도 게시 실패를 방지함.
    - `AbortController`를 연동하여 모달 폐쇄 시 진행 중인 모든 네트워크 요청을 즉시 중단함.
    - 발행 성공 후에는 스튜디오 상태를 초기화하여 새로운 작업 준비 보장.
- **Error Feedback**: 발행 실패 시 상세한 원인을 토스트로 노출하며, 취소된 요청에 대해서는 불필요한 에러 알림을 생략함.

---

## 6. 기술 스택 (Tech Stack Optimization)

- **Frontend**: Next.js / Vite (React), Zustand (State Management), Framer Motion (Animation), Vitest (Testing)
- **Backend API**: Node.js Express (Unified Server with Vite Middleware - `api/server.js`)
- **Database**: Sanity.io (Headless CMS & Image Assets)
- **Auth**: Firebase Authentication (Google / Kakao OAuth)
- **Hosting**: Vercel

---

## 7. Authentication Strategy (계정 및 인증 전략)

진입 장벽을 낮추기 위해 **"선 사용, 후 로그인"** 방식을 채택합니다.

### 7.1 Hybrid Access Policy

- **Guest (비로그인)**:
  - 이미지 업로드 및 드로잉 (무제한)
  - 옵션 튜닝 및 결과물 **다운로드** 가능
  - 피드 구경하기
- **Member (로그인)**:
  - 피드에 내 작품 **게시(Publish)**
  - 다른 작품에 **좋아요(Like)**
  - **[My Gallery]** 탭 접근 및 본인 작품 관리(수정/삭제)
- **CORS & Cache**:
    - 외부 이미지 분석 시 픽셀 데이터를 읽기 위해 `crossOrigin="anonymous"` 속성을 명시적으로 할당합니다.
    - 브라우저 캐시로 인한 분석 실패를 막기 위해 항상 **Timestamp Cache Buster**를 결합하여 로드합니다.
- **Layout Stability**:
    - `prepareCanvas`는 뷰포트 레이아웃이 완전히 정착된 후(`requestAnimationFrame`) 실행되어 정확한 좌표 계산을 보장합니다.
- **Runtime Specification**:
    - 모든 연동 API는 Node.js 런타임을 표준으로 하며, Edge Runtime 환경에서의 비표준 API(Buffer 등) 호환성 이슈를 원천 차단합니다.

### 7.2 Login Flow

- 중요 액션(게시, 좋아요) 시 **전용 로그인 모달(LoginModal)**을 띄워 흐름을 방해하지 않고 로그인을 유도합니다.

---

## 8. 운영 및 안전 (Legal & Moderation)

- **Content Integrity**: 전용 트랜잭션 로직을 통해 작품 삭제 시 연관된 모든 이미지 에셋을 동시에 제거하여 서버 공간 낭비를 방지합니다.

---

## 9. Marketing & SEO Strategy

- **Dynamic SEO Strategy**: 
    - **Single Page Application (SPA) SEO Optimization**: Vite 기반의 SPA 환경에서 Vercel Serverless Function(`api/seo.js`)을 활용해 개별 작품 상세 페이지마다 제목과 이미지를 동적으로 주입합니다.
    - **Vercel Static Priority Bypass**: `index.html`을 `template.html`로 전환하고 `vercel.json` 리라이트 설정을 통해 정적 파일 서빙 우선순위를 제어함으로써 런타임 메타 데이터 주입을 보장합니다.
    - **Social Media CTR Optimization**: 카카오톡, 트위터, 페이스북 등 주요 SNS 공유 시 작품의 실시간 썸네일과 제목이 노출되도록 Open Graph(OG) 및 Twitter Card 표준을 100% 준수합니다.
- **Google Analytics Integration & Data Strategy**:
    - **User Behavior Funnel Analysis**: 진입 경로(`app_entry`)부터 창작(`studio_style_change`), 게시(`studio_publish`), 확산(`interaction_share`)에 이르는 사용자 여정을 데이터로 정밀 추적.
    - **Social Viral Measurement**: 카카오톡, X, 페이스북, 쓰레드 등 구체적인 채널별 공유 선호도를 분석하여 바이럴 성과를 측정하고 마케팅 예산 및 리소스 배분의 근거로 활용.
    - **Feature Popularity Insights**: 스타일 모드별 선택 비중 및 인터랙션(좋아요, 리믹스) 수치를 분석하여 사용자 취향에 맞춘 알고리즘 고도화 및 신규 스타일 개발 방향 설정.
