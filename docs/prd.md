# PRD: Sketchrang (스케치랑)

## 1. 개요 (Product Overview)

### 1.1 제품 소개

사용자가 사진을 업로드하면, 독자적인 알고리즘(Sketch Engine)이 이를 실시간으로 감각적인 드로잉으로 변환해 주는 웹 서비스입니다. 단순한 변환 도구를 넘어, 결과물과 그 **생성 과정**을 공유하고 서로 '좋아요'를 누르며 경쟁하는 **창작 소셜 놀이터**입니다.

### 1.2 핵심 가치 (Core Value)

- **Everyone is an Artist**: 그림 실력이 없어도, 감각적인 옵션 조절(Tuning)만으로 멋진 작품을 만들 수 있습니다.
- **Visual Satisfaction**: 결과물뿐만 아니라, 펜들이 움직이며 그림을 완성해가는 **과정의 시각적 쾌감**을 제공합니다.
- **Social Recognition**: 나의 감각(옵션 튜닝 능력)을 랭킹 시스템을 통해 인정받을 수 있습니다.

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
- **Download**: 완성된 작품을 내 기기에 고화질 이미지(PNG)로 즉시 저장. (개인 소장용)

### 3.2 Feed (소셜 피드)

다른 사람들의 작품을 감상하는 공간입니다.

- **Infinite Gallery**: 무한 스크롤 형태의 갤러리 뷰.
- **Interaction (SSOT)**: 모든 인터랙션은 단일 진실 공급원(Single Source of Truth) 기반으로 실시간 동기화됩니다.
  - **Likes (좋아요)**: 하트 토글 및 인기 랭킹 산정 기준.
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

---

## 6. 기술 스택 (Tech Stack Optimization)

<<<<<<< HEAD
- **Frontend**: Next.js / Vite (React), Zustand (State Management), Framer Motion (Animation)
- **Backend API**: Node.js Express (Unified Server with Vite Middleware - `api/server.js`)
=======
- **Frontend**: Next.js / Vite (React), Zustand (State), Framer Motion (Animation), **Vitest (Testing)**
- **Backend API**: Node.js Express (Unified Server with Vite Middleware)
>>>>>>> refactor/all
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

### 7.2 Login Flow

- 중요 액션(게시, 좋아요) 시 **전용 로그인 모달(LoginModal)**을 띄워 흐름을 방해하지 않고 로그인을 유도합니다.

---

## 8. 운영 및 안전 (Legal & Moderation)

- **Content Integrity**: 전용 트랜잭션 로직을 통해 작품 삭제 시 연관된 모든 이미지 에셋을 동시에 제거하여 서버 공간 낭비를 방지합니다.

---

## 9. Marketing & SEO Strategy

- **Dynamic Meta Tags**: 개별 작품 상세 페이지마다 제목과 이미지를 동적으로 설정하여 SNS 공유 시 높은 클릭률(CTR)을 유도합니다.
