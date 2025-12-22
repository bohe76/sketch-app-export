# Design System: Sketchrang

## 1. Color Palette (Updated)

- **Primary**: Pure Black (`#000000`) & White (`#FFFFFF`) using Tailwind `black` / `white`.
- **Skeleton Background**: `bg-zinc-200` (부드럽고 덜 자극적인 로딩 시각화 표준)
- **Accent**: Red (`#FF3040` / `text-red-500`) for errors/required, Blue (`#0095F6`) for links.
- **Border**: `Zinc-200` - 표준 구분선 및 툴팁 테두리.

---

## 2. Layout & Spacing

- **Mobile-First Layout**: 하단 탭 바(`z-50`)와 엄지 영역 중심의 버튼 배치.
- **Desktop Sidebar**: 튜닝 패널은 우측 고정 사이드바(`z-10`)로 구성.
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

---

## 4. Motion Guidelines

- **Duration**: `200ms` ~ `300ms` (Snappy Interaction)
- **Fade-in Reveal**: 이미지 로딩 완료 시 전용 스케일 & 페이드 효과 적용.
- **Pulsing Skeleton**: 은은한 무브먼트를 동반한 박동 효과.

---

## 5. CSS Architecture

- **Modular Inheritance**: 모든 툴팁과 버튼은 `layout.css` 등에 정의된 공용 베이스 클래스를 상속받아 사용하며, 인라인 스타일링을 지양합니다.
- **Scrollbar Reserve**: `scrollbar-gutter: stable`을 통해 갤러리 로딩 시 레이아웃 흔들림 방지.
