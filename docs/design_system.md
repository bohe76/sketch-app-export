# Design System: Sketchrang

## 1. Color Palette (Updated)

- **Primary**: Pure Black (`#000000`) & White (`#FFFFFF`) using Tailwind `black` / `white`.
- **Skeleton Background**: `bg-zinc-200` (부드럽고 덜 자극적인 로딩 시각화 표준)
- **Accent**: Red (`#FF3040` / `text-red-500`) for errors/required, Blue (`#0095F6`) for links.
- **Emphasis**: `text-red-500 font-bold` - 용량 제한(Max 4MB) 등 사용자가 즉시 인지해야 하는 핵심 제약 사항에 사용.
- **Border**: 
  - 기본 가이드라인: `Zinc-200`
  - 대화형 카드(StyleCard) 평상시: `Zinc-300`
  - 대화형 카드(StyleCard) 호버/활성: `Zinc-800`
  - 두께 표준: 시스템 말풍선(Tooltip)과 동일한 `1px` (border) 사용.
- **Motion**: 
  - Layout Transitions: `0.15s` duration, `easeOut` easing (Tween type).
  - Hover Interactions: `0.3s` duration for vignetting/glow 효과.
  - **Thumbnail Signature Hover**: `3.0s` duration `easeOut` fade-out (3000ms 동안 서서히 투명해지며 실시간 드로잉 노출).
  - Action Buttons (ArtworkCard): 
    - Desktop (≥1024px): Reveal on Hover (0.3s transition).
    - Mobile/Tablet (<1024px): Always Visible (Opacity 100%) for accessibility. (판단 기준: 화면 너비 < 1024px)
  - **Studio Exit Button**:
    - Position: `top-24`, `left-6` (고정 헤더 아래 균형 배치)
    - Style: `bg-white/90 backdrop-blur-md` 원형 버튼 + `shadow-xl`
    - Interaction: 호버 시 `scale-110` 확대 강조.

---

## 2. Layout & Spacing

- **Mobile-First Layout**: 하단 탭 바(`z-50`)와 엄지 영역 중심의 버튼 배치.
- **Desktop Sidebar**: 튜닝 패널은 우측 고정 사이드바(`z-10`)로 구성. 
  - 표준 패딩: `px-6 py-4`
  - 섹션 간격: `space-y-6`
  - 슬라이더 간 간격: `space-y-4`
  - 슬라이더 내부(Label-Bar) 간격: `space-y-1.5`
- **Responsive Grid**:
  - Desktop (≥1024px): Max 9 컬럼, 카드당 `232px` 고정 너비, 0.15s 이동 애니메이션 적용, 버튼 호버 노출.
  - Mobile/Tablet (<1024px): 2~3컬럼 자동 조절, 100% 가변 너비, 즉각적 레이아웃 전환(0s) 적용, 버튼 상시 노출.
- **Layering (Z-Index Hierarchy)**:
  - `z-0`: 캔버스/피드
  - `z-[100]`: 글로벌 헤더
  - `z-[200]`: 작품 상세보기 모달
  - `z-[300]`: 시스템 로그인/게시 모달
  - `z-[500]`: 최상단 토스트 알림

---

## 3. Components & Interaction

### 3-1. Glassmorphism Buttons

- **Style**: `bg-white/80 backdrop-blur-md`
- **Icon Color**: `Zinc-600` (표준 아이콘 색상)
- **Shadow**: `shadow-soft` (은은한 5% 불투명도 그림자)

### 3-2. Standardized Tooltips

- **Animation**: `animate-tooltip-in` (10px 솟아오름 효과)
- **Text**: **UPPERCASE** (강조된 기능 안내)
- **Position**: 버튼 상단 중앙(`left: 50%`, `translate-x: -50%`)

### 3-3. Standardized Toast Notifications

- **Animation**: `animate-toast-in`
  - **Timing**: `0.3s` cubic-bezier `(0.16, 1, 0.3, 1)` (Soft Expo Out)
  - **Movement**: `translateY(10px)` → `translateY(0)` (아래에서 위로 부드럽게 등장)
  - **Scale**: `scale(0.95)` → `scale(1)` (약간 커지며 등장)
- **Usage**: 모든 시스템 성공/실패 알림에 공통 적용.

### 3-4. Modal Action Standards

- **Actionable (Confirmation)**: 중요한 결정 시 'Confirm' + 'Cancel' 버튼을 모두 제공합니다. (예: 옵션 초기화, 작품 삭제)
- **Informational (Constraints)**: 시스템 제약 사항 안내 시 'Confirm' (Understood) 버튼만 제공하여 사용자 동선을 단순화합니다. (예: 4MB 용량 초과 안내)
  - `cancelText`가 빈 문자열(`""`)일 경우 취소 버튼이 자동으로 숨겨집니다.

---

## 4. Motion Guidelines

- **Duration**: `200ms` ~ `300ms` (Snappy Interaction)
- **Fade-in Reveal**: 이미지 로딩 완료 시 전용 스케일 & 페이드 효과 적용.
- **Thumbnail Fade-out**: 실시간 드로잉 연출을 위한 3000ms 장기 페이드 아웃 효과.
- **Pulsing Skeleton**: 은은한 무브먼트를 동반한 박동 효과.

---

## 5. CSS Architecture

- **Modular Inheritance**: 모든 툴팁과 버튼은 `layout.css` 등에 정의된 공용 베이스 클래스를 상속받아 사용하며, 인라인 스타일링을 지양합니다.
- **Layout Preservation**: `.app-container`, `.header-overlay`, `.viewport-studio` 등의 핵심 레이아웃 클래스는 절대 무시되어서는 안 되며, Tailwind 하드코딩으로 이를 대체하는 것을 금지합니다.
- **Visual Regression Prevention**: 기술적 전환 시 AI의 자의적인 판단에 의한 UI 재해석을 금지하며, 반드시 원본 코드의 HTML/CSS 구조를 우선적으로 분석하여 계승합니다.
- **Scrollbar Reserve**: `scrollbar-gutter: stable`을 통해 갤러리 로딩 시 레이아웃 흔들림 방지.
