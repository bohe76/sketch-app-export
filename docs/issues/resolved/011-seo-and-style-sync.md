# Issue Resolved: SEO & Style Synchronization

## 1. Issue Definition

#### 1.1 Social Share Link Preview Failure
- **Symptom**: 카카오톡 공유 버튼을 통한 공유는 정상(API 사용)했으나, URL을 복사하여 직접 채팅방에 붙여넣을 경우 봇이 크롤링한 미리보기 이미지(OG:Image)가 아닌 기본 정보가 노출됨.
- **Root Cause**:
    1.  **Vercel SPA Policy**: Vercel이 루트 경로(`/`)에 대해 정적 `index.html`을 바로 서빙하여 서버 측의 SEO 주입 로직이 실행되지 않음.
    2.  **Regex Multiline Bug**: `seo_helper.js`의 정규표현식(`.*`)이 줄바꿈이 있는 메타 태그를 인식하지 못해 교체에 실패함.

#### 1.2 Vintage Style Consistency
- **Symptom**: Vintage 스타일 선택 시 적용되는 펜 굵기나 질감이 Classic 스타일과 미묘하게 달라 사용자 경험의 불일치 발생.
- **Goal**: Vintage 스타일을 **"Classic 드로잉 + Sepia Tone"** 개념으로 재정의하여 드로잉 엔진 파라미터를 Classic과 완벽히 일치시킬 필요 있음.

---

## 2. Solution Implementation

### 2.1 Serverless SEO Handler (Vercel Support)
- **New Handler**: `api/seo.js`를 생성하여 요청된 `artworkId`를 기반으로 Sanity에서 데이터를 가져와 `index.html`에 메타 태그를 주입하는 전용 서버리스 함수 구현.
- **Rewrites Config**: `vercel.json`의 `rewrites` 설정을 수정하여 루트(`/`) 요청을 `api/seo.js`로 라우팅, 실서버 환경에서도 동적 OG 태그 생성을 보장함.

### 2.2 Robust SEO Helper
- **Regex Update**: 줄바꿈(`[\s\S]*?`)뿐만 아니라 **태그 속성 간의 공백(`\s+`)**과 **따옴표(`["']`)** 패턴을 유연하게 처리하여, HTML 압축(Minification)이나 포맷팅 변경 시에도 메타 태그를 안정적으로 찾도록 개선. (`api/utils/seo_helper.js`)
- **Dynamic URL**: `og:url` 및 `twitter:url` 태그를 현재 작품의 고유 주소(`siteUrl/?artwork=ID`)로 동적 교체하도록 로직 개선.
- **Title-First Description**: 공유 시 설명 문구를 "누가 만들었는지"에서 **"작품명"** 중심으로 변경하여 가독성과 클릭률 개선.

### 2.3 Style Preset Synchronization
- **Code Update**: `ControlPanel.tsx`의 `STYLES` 상수에서 Vintage의 `momentum`(0.5)과 `alpha`(0.1) 값을 Classic과 동일하게 수정.
- **Documentation**: `docs/sketch_engine_parameters.md`에 **Golden Values** 섹션을 추가하여 각 스타일의 핵심 파라미터를 불변 값으로 명시 및 보호.

### 2.4 OG Image Asset
- **Default Image**: 루트 경로 공유 시 노출될 고품질 스케치 스타일의 `public/og-image.png` 생성 및 배치.

---

## 3. Verification

### 3.1 Code Quality
- **Lint Check**: `npm run lint` 수행 결과 Error 없음 (Warning 20개 유지).

### 3.2 Expected Outcome
- **Social Sharing**: Vercel 배포 후 카카오톡, 트위터 등에 링크를 직접 붙여넣어도 작품의 썸네일과 제목이 포함된 Rich Card가 표시됨.
- **User Experience**: Vintage 모드 사용 시 Classic과 동일한 고품질 드로잉 경험을 유지하면서 감성적인 색감만 더해짐.
