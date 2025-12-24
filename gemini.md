# 프로젝트 가이드라인

사용자가 "업무준비"라고 말하면 다음의 필수 문서들을 학습하고 대기한다.

## 학습 대상 문서

1. @[docs/prd.md]
2. @[docs/architecture.md]
3. @[docs/functional_spec.md]
4. @[docs/design_system.md]
5. @[docs/issue_management.md]

## 동작 지침

- 위 5개의 문서를 순차적으로 읽고 프로젝트의 목적, 구조, 기능 명세 및 디자인 시스템을 파악한다.
- 학습을 마친 후에는 **로컬 서버를 실행(`node api/server.js`)**하고, 브라우저를 열어 `http://localhost:3000`에 접속할지를 사용자에게 묻는다.
- 이후 추가 지시를 위해 대기 상태를 유지한다.

## 개발 규칙

- 코드 수정 또는 추가 후에는 반드시 린트(`npm run lint`) 검사를 수행한다.

## 서버 실행 지침 (Unified Server)

- 로컬 개발 서버 실행 시 `node api/server.js` 명령어를 사용한다. (Frontend + Backend 통합)
- 이 명령어는 **백그라운드**에서 실행되어야 한다. (Background command ID 활용)
- `vercel dev` 또는 `npm run dev`는 더 이상 사용하지 않는다.

## 시스템 환경 및 터미널 사양

- **운영체제(OS)**: Windows
- **셸(Shell)**: PowerShell (pwsh)
- **동작 지침**: 터미널 명령어 실행 시 반드시 Windows/PowerShell 호환 명령어(예: `rm` 대신 `del` 또는 `Remove-Item`)를 사용하여 환경 충돌을 방지한다.
