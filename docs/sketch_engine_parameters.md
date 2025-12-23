---
title: Sketch Engine Parameters Definitions
date: 2025-12-22
status: official
author: Antigravity
---

## Sketch Engine Parameters

이 문서는 `SketchEngine` 내부에서 사용되는 모든 기술적 파라미터의 정의와 기본값을 관리합니다. 이 수치들은 엔진의 물리적 동작과 알고리즘의 세밀함을 결정합니다.

## 1. Core Engine Parameters (고정/내부 제어)

엔진의 성능과 기본적인 선 생성 로직을 담당하는 파라미터입니다.

| Parameter | Type | Default | Technical Description |
| :--- | :--- | :--- | :--- |
| `drawSpeed` | `number` | `160` | 한 프레임당 루프 횟수. 높을수록 그림이 그려지는 물리적 속도가 빨라집니다. |
| `maxHeads` | `number` | `64` | 동시에 활성화될 수 있는 '드로잉 헤드(펜)'의 최대 개수. |
| `branchProbability` | `number` | `0.05` | 인접 픽셀로 이동 시 펜이 두 개로 갈라져(Clone) 새로운 펜이 생성될 확률. |
| `threshold` | `number` | `640` | 이미지 분석 시 '검은색'으로 인지할 밝기 임계값. (R+G+B 합계 기준) |
| `scaleFactor` | `number` | `0.8` | 캔버스 대비 원본 이미지의 초기 배치 배율 (80%). |

## 2. Drawing Mechanics (선의 생명주기)

펜의 이동 및 소멸과 관련된 파라미터입니다.

| Parameter | Type | Default | Technical Description |
| :--- | :--- | :--- | :--- |
| `minLife` | `number` | `100` | 드로잉 헤드가 생성된 후 최소한으로 생존하며 선을 그리는 단계 수. |
| `maxLife` | `number` | `300` | 드로잉 헤드가 소멸하기 전까지 가질 수 있는 최대 생존 단계 수. |

## 3. Visual Style Parameters (사용자 조절 가능)

그림의 시각적 느낌을 결정하며, 사용자 패널(`ControlPanel`)과 직접적으로 연결되는 파라미터입니다.

| Parameter | Type | Default | Technical Description |
| :--- | :--- | :--- | :--- |
| `momentum` | `number` | `0.5` | **관성**: 이동 방향 결정 시 현재 속도(Vector)의 가중치. 높을수록 직선적이고 낮을수록 유기적인 곡선이 생성됩니다. |
| `alpha` | `number` | `0.1` | **기본 투명도**: 획 하나가 가지는 기본 투명도 값. 중첩을 통해 명암을 형성합니다. |
| `lineWidth` | `number` | `0.5` | **선 굵기**: Canvas `lineWidth` 속성에 직접 적용되는 수치입니다. |

---

## 4. 절대 수정 금지 원칙 (Absolute Protection Policy)

이 섹션에 정의된 **'Golden Values'**는 엔진의 고유한 질감을 유지하는 핵심 유산입니다. AI 어시스턴트는 다음 수칙을 반드시 준수해야 합니다.

1.  **수정 금지**: 사용자의 지시 없이 어떠한 수치나 수식도 임의로 최적화하거나 변경할 수 없습니다.
2.  **경고 및 2단계 컨펌**: 사용자가 수정을 요청하더라도, 해당 수정이 비주얼 품질(진하기, 질감 등)에 미칠 수 있는 영향을 먼저 설명하고 **반드시 2회 이상의 추가 컨펌**을 거친 후 수행합니다.
3.  **수식 보존**: 리팩토링 과정에서도 드로잉 수식 자체의 비즈니스 로직은 단 한 글자도 수정하지 않습니다.

## 5. Golden Values & Default State

### 5.1 Drawing Formulas (Essential Logic)
- **Alpha Calculation**: `Math.max(0.05, (intensity || 0.5) * (baseAlpha / 0.1) - (visitCount * 0.05))`
- **Brightness Analysis**: `R + G + B` (Sum-based Gray)
- **Intensity Filter**: `1.0 - (brightness / threshold)`

### 5.2 표준 초기 상태 (Balanced Sketch)
- **Speed & Performance**: `drawSpeed`: 160 / `maxHeads`: 64
- **Swarm Control**: `branchProbability`: 0.05 / `scaleFactor`: 0.8
- **Standard Look**: `momentum`: 0.5 / `alpha`: 0.1 / `lineWidth`: 0.5 / `threshold`: 640
- **Life Cycle**: `minLife`: 100 / `maxLife`: 300
