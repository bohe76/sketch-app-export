---
title: Sketch Studio Control Panel Specification
date: 2025-12-22
status: official
author: Antigravity
---

## Sketch Studio Control Panel (UI/UX)

이 문서는 스튜디오 창작 모드에서 사용자에게 노출되는 **조절 패널(Control Panel)**의 구성과 엔진 파라미터 간의 매핑 로직을 정의합니다.

## 1. Panel Layout Strategy

사용자가 기술적인 이해 없이도 직관적으로 창작을 즐길 수 있도록 옵션을 재구성합니다.

### 1-1. Visible Group (사용자 노출)

사용자가 직접 슬라이더나 셀렉트 박스로 조절하는 핵심 예술적 옵션입니다.

- **Style (화풍)**: 색상 모드 및 엔진의 전반적인 분위기를 결정하는 프리셋.
- **Texture (질감)**: 선의 유기적인 정도(직선 vs 곡선)를 결정.
- **Opacity (농도)**: 선의 진하기와 겹침 효과를 결정.
- **Thickness (굵기)**: 펜의 물리적인 두께를 결정.
- **Sensitivity (민감도)**: 사진의 어두운 영역을 감지하는 정도. 값이 높을수록 더 많은 영역을 스케치합니다.

### 1-2. Hidden Group (기술적 고정)

연출의 일관성과 성능 최적화를 위해 사용자에게 노출하지 않고 내부적으로 고정한 옵션입니다.

- **Speed (`drawSpeed`)**: 항상 최적의 속도(`100`) 유지.
- **Quantity (`maxHeads`)**: 항상 풍성한 선 연출(`64`) 유지.
- **Algorithm Config**: `branchProbability`, `scaleFactor` 등.

---

## 2. Parameter Mapping Logic

UI 수치가 실제 엔진 파라미터로 변환되는 규격입니다.

| UI Labels | Engine Parameter | UI Range (Step) | Mapping Logic / Default |
| :--- | :--- | :--- | :--- |
| **Texture** | `momentum` | 0.0 ~ 1.0 (0.1) | `High(1.0)`: 직선적/사실적 ; `Low(0.0)`: 자유로운 곡선 ; **Default: 0.5** |
| **Opacity** | `alpha` | 0.1 ~ 1.0 (0.1) | `High(1.0)`: 즉각적인 발색 ; `Low(0.1)`: 섬세한 수채화식 중첩 ; **Default: 0.1** |
| **Thickness** | `lineWidth` | 0.1 ~ 2.0 (0.1) | `0.1 ~ 2.0` 수치를 엔진에 직접 전달 ; **Default: 0.5** |
| **Sensitivity**| `threshold` | 100 ~ 765 (5) | `High(765)`: 어두운 인지 영역 확대(빽빽함) ; `Low(100)`: 아주 어두운 부분만(여백많음) ; **Default: 640** |

---

## 3. Style Presets (Proposed)

`Style` 셀렉트 메뉴 선택 시 엔진 내부 옵션들의 하이브리드 조합입니다.

| Style Name | Mode | Linked Tuning | Description |
| :--- | :--- | :--- | :--- |
| **Classic** | `B&W` | Default Params | 순수한 느낌의 흑백 연필 소묘 |
| **Vintage** | `Sepia` | alpha += 0.1 | 빛바랜 필름 같은 분위기의 스케치 |
| **Vivid** | `Color` | alpha += 0.2 | 원본 사진의 색상을 살린 세밀화 |
| **Scratch** | `Invert` | background: Black | 검은 종이를 긁어내는 듯한 반전 효과 |

---

## 4. Action Buttons (Tooltips Mapping)

- **Reset**: 모든 `Visible Group` 수치를 기본값(Default)으로 초기화합니다.
- **Download**: 캔버스 내용을 이미지로 저장합니다.
- **Publish**: 작성된 레시피와 스케치를 갤러리에 공유합니다.
- **Image**: 다른 소스 사진으로 교체합니다.
