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

## 4. Default State (초기화 상태 요약)

엔진이 처음 구동될 때의 "Balanced Sketch" 표준 상태입니다.

- **Speed & Performance**: Mid-High Speed (160) / Swarm Effect (64 Heads)
- **Selection Mode**: Brightness-based Gray Analysis (Threshold: 640)
- **Standard Look**: momentum: 0.5 / alpha: 0.1 / lineWidth: 0.5
