# Additional Feature Ideas (Engine Upgrade)

Sketch Engine에 추가할 수 있는 고급 시각 효과 및 연출 옵션 목록입니다.

## 1. Canvas Texture (배경 질감)

단순한 흰색 배경(`background-color: white`)을 넘어, 실제 종이나 캔버스의 질감을 적용하여 아날로그 감성을 극대화합니다.

- **Kraft Paper**: 누런 크라프트지. 빈티지 드로잉에 최적.
- **Watercolor Paper**: 올록볼록한 수채화지 텍스처.
- **Dark Canvas**: 어두운 천 질감 (Invert Mode와 결합 시 효과적).
- **Implementation**: Canvas의 맨 아래 레이어에 `drawImage`로 텍스처 이미지를 깔고 시작. `globalCompositeOperation`을 `multiply`로 설정하여 펜 자국과 합성.

## 2. Brush Style (펜촉 스타일)

HTML5 Canvas API의 `lineCap`, `lineJoin`, `shadow` 속성을 활용합니다.

- **Round (기본값)**: 둥근 펜촉. 부드러운 연결.
- **Square (마카/캘리그라피)**: 납작한 펜촉. 각진 시작과 끝.
- **Rough (거친 연필)**: 획마다 미세한 떨림(Jitter)을 주거나, `setLineDash`를 활용하여 끊어지는 선 연출.

## 3. Invert / Scratch Mode (반전/스크래치)

검은 종이를 긁어내는 듯한 스크래치 아트 기법입니다.

- **Logic**:
    1. 배경을 검은색(`#000`)으로 채움.
    2. 펜 색상을 흰색(`#FFF`) 또는 밝은 회색으로 설정.
    3. `analyzeImage`에서 밝기(Brightness) 값을 반전하여, '밝은 영역'을 따라 펜이 움직이도록 로직 수정 (`intensity = brightness / 255`).

- **Use Case**: 야경, 인물 초상화(Dramatic Lighting).

## 4. Spot Color (포인트 컬러 / 쉰들러 리스트 효과)

흑백 베이스에 특정 색상만 강조하는 기법입니다.

- **Logic**:
    1. 사용자가 강조할 `Target Color`(예: Red)를 선택.
    2. `spawnHead` 시점에 해당 픽셀의 색상을 분석.
    3. 픽셀 색상이 `Target Color`와 유사도(Color Distance)가 높으면 -> **True Color(Red) 펜** 생성.
    4. 유사도가 낮으면 -> **Black 펜** 생성.

- **Use Case**: 붉은 장미, 파란 눈동자 강조 등.

---

## 5. Implementation Priority (구현 우선순위)

1. **Invert Mode**: 로직이 간단하고 시각적 효과가 큼. (Algorithm Tweak)
2. **Paper Texture**: 리소스(이미지 파일)만 있으면 즉시 구현 가능. (Asset + CSS)
3. **Spot Color**: 픽셀 분석 로직 추가 필요. (Logic Upgrade)
4. **Brush Style**: 미세한 차이라 우선순위 낮음.
