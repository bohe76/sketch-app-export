---
title: 이미지 등장 마스크 리빌(Dynamic Mask Reveal) 효과 적용
date: 2025-12-25
status: resolved
priority: medium
author: Antigravity
---

## 이슈 010: 이미지 등장 마스크 리빌(Dynamic Mask Reveal) 효과 적용

## 현상

- 단순히 투명도(Opacity)만 조절하는 기존 1.2초 페이드인 방식은 부드럽지만, 시각적인 극적인 연출이 부족함.

## 해결 방안

1.  **다이내믹 마스크 리빌(Dynamic Mask Reveal)**:
    - `radial-gradient` 마스크를 사용하여 이미지가 어둠 속에서 빛이 퍼지듯 드러나는 효과를 구현함.
2.  **랜덤 시작점 (Random Origin)**:
    - 매번 똑같은 방향이 아니라, **좌상단(Top-Left)** 또는 **우상단(Top-Right)** 중 하나를 무작위로 선택하여 시작점을 다변화함.
3.  **애니메이션 튜닝**:
    - `Framer Motion`을 활용하여 1.5초 동안 마스크 크기를 0%에서 150%까지 확장하며, `easeOut` 이징으로 웅장함을 더함.

## 결과 및 효과

- 작품이 전시회 조명을 받는 듯한 고급스럽고 예술적인 등장 연출 완성.
- 매번 조금씩 다른 느낌을 주어 사용자에게 시각적 즐거움을 제공함.
