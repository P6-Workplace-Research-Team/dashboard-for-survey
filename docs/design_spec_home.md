# 홈 화면 정의서 (design_spec_home)

작성일: 2026-04-30
대상 파일: `home.html` (진입 시 `index.html` → `home.html`로 자동 리다이렉트)

---

## 1. 화면 개요 / 목적

### 1.1 화면 정보
- 화면명: 홈 / 대시보드 생성 진입 화면
- 파일명: `home.html`
- 진입 경로: `/index.html` (meta refresh + `window.location.replace`로 즉시 이동)
- `<title>`: `설문조사 분석 대시보드 만들기 | purple6studio`

### 1.2 목적
1. 새로운 분석 대시보드를 만들기 위해 설문조사 제목을 입력받는다.
2. 분석에 필요한 3종 파일(문항 코드북 / 숫자형 응답 데이터셋 / 라벨형 응답 데이터셋)을 업로드받는다.
3. 업로드된 파일의 **형식·필수 컬럼·상호 정합성**을 사전에 검증한다.
4. 이미 만들어진 대시보드 목록을 조회·진입·이름 변경·삭제할 수 있는 진입점을 제공한다.
5. 검증을 통과하면 설문 데이터를 브라우저 저장소(localStorage + IndexedDB)에 저장한 뒤 `dashboard.html`로 이동시킨다.
6. 파일 준비가 되지 않은 사용자를 위해 가이드 문서로 이동할 수 있는 진입점을 제공한다.

### 1.3 사용자 여정
1. 홈 진입 → 저장된 대시보드가 있으면 우상단 뱃지 카운트로 인지
2. 제목 입력 → 3개 파일 업로드 → "대시보드 만들기" 클릭
3. 검증 실패 시 해당 박스에 인라인 오류, 검증 통과 시 대시보드로 이동

---

## 2. 레이아웃 구조 / 영역 구분

### 2.1 전체 레이아웃
- 단일 컬럼 / 중앙 정렬
- 컨테이너 기준 폭: `max-width: 840px` (`margin: 0 auto`로 뷰포트 가운데 정렬, 좌우 패딩 없음)
- `.top-bar`: `padding: 16px 0` (세로 16px만, 가로 0)
- `.container`: `padding: 0` (`margin: 16px auto 72px`)
- 페이지 구조 (위→아래)
  1. 상단 유틸 바 (`.top-bar`)
  2. 헤더 (`.header`) — 페이지 타이틀
  3. 본문 컨테이너 (`.container`) — 섹션 1 / 섹션 2 / 메인 액션 / 가이드 배너
  4. 푸터 (`.footer`)
  5. 모달 오버레이 — 저장된 대시보드 리스트 (`#list-modal`)

### 2.2 영역별 위치
| 영역 | 위치 | 정렬 |
| --- | --- | --- |
| `purple6studio` 로고 | 상단 좌측 | 좌측 정렬 |
| `저장된 대시보드 리스트` 버튼 | 상단 우측 | 우측 정렬 (저장 건수 뱃지 포함) |
| 페이지 타이틀 | 헤더 중앙 | 가운데 정렬 |
| 섹션 1: 제목 입력 | 본문 상단 | full width |
| 섹션 2: 파일 업로드 | 본문 중앙 | 3열 그리드 |
| 메인 액션 버튼 | 섹션 2 하단 | full width (54px 높이) |
| 가이드 배너 | 액션 버튼 아래 | full width |
| 푸터 | 페이지 최하단 | 가운데 정렬 |

### 2.3 반응형
- breakpoint: `max-width: 760px`
  - top-bar 줄바꿈 허용 (`flex-wrap: wrap`)
  - 페이지 타이틀 28px → 24px (heading-2 크기)
  - 업로드 그리드는 3열 유지
  - drop-zone 최소 높이 192px → 168px
  - 메인 액션 버튼 폰트 크기 16px → 18px

---

## 3. UI 컴포넌트 상세 스펙

### 3.1 상단 유틸 바 `.top-bar`
- 구성: 좌측 로고 링크, 우측 리스트 버튼
- 로고
  - 이미지: `assets/purple6studio_한줄_black.png`
  - 클릭 시 `home.html`로 이동 (자기 자신 새로고침과 동일)
  - 높이 16px
- 리스트 버튼 `#open-list-btn`
  - 텍스트: `저장된 대시보드 리스트`
  - 좌측 list 아이콘 (Material Symbols Rounded)
  - 우측 카운트 뱃지 `#saved-count` — pill 형태, 검정 배경, 흰색 숫자
  - 카운트 값: `loadSurveys().length` (페이지 로드 시·저장·삭제 시 갱신)
  - hover 시 테두리 색상 `neutral-300` → `neutral-900`

### 3.2 페이지 타이틀
- 텍스트: `설문조사 분석 대시보드 만들기`
- 스타일: heading-1 (28px / bold / letter-spacing -0.02em)
- 색상: `--Black`
- 정렬: 가운데

### 3.3 섹션 1 — 설문조사 제목 입력
- 섹션 타이틀: `1. 설문조사 제목을 입력해 주세요`
- 입력 필드 `#survey-title`
  - placeholder: `예: 2025 직장인 사무환경 조사`
  - `maxlength`: **30자**
  - `autocomplete="off"`
- 보조 문구 `.field-hint`: `최대 30자까지 입력할 수 있습니다.`
- 오류 문구 `#title-error` (`role="alert"`): `설문조사 제목을 입력해 주세요.`
  - 트리거: 메인 액션 버튼을 눌렀는데 공백만 있는 경우
  - `.show` 클래스로 표시, 입력 시 자동으로 제거
  - 입력창 테두리도 `--low-4` 컬러로 강조 (`.text-input.error`)

### 3.4 섹션 2 — 파일 업로드
- 섹션 타이틀: `2. 문항 코드북과 응답 데이터셋을 업로드해 주세요`
- 3열 그리드 (`grid-template-columns: repeat(3, 1fr)`, gap 15px)

#### 3.4.1 업로드 카드 공통 (3장)
| 항목 | 값 |
| --- | --- |
| 라벨 (위) | `문항 코드북` / `응답 데이터셋_숫자형` / `응답 데이터셋_라벨형` |
| input data-key | `codebook` / `value` / `label` |
| accept | `.csv,.xlsx` |
| 안내 문구 | `여기에 파일을 드래그하거나, 아래 버튼을 눌러 파일을 선택하세요.` |
| 허용 형식 표기 | `[ .csv · .xlsx ]` |
| 파일 선택 버튼 | 검정 배경, 화살표 업 아이콘, `파일 선택` |
| 드래그 동작 | dragenter/dragover 시 `.drag-over` 클래스로 강조 |

#### 3.4.2 카드 상태
| 상태 | 클래스 | 표시 |
| --- | --- | --- |
| 기본 | (없음) | 안내 문구 + 파일 선택 버튼 |
| 드래그 중 | `.drag-over` | 테두리 검정·배경 강조 |
| 완료 | `.done` | `업로드 완료!` 타이틀 + 체크 아이콘 + 파일명 + `다시 선택하기` 버튼 |
| 오류 | 부모에 `.has-error` | 카드 테두리 `--low-4`, 배경 `--low-2`, 카드 아래에 빨간 메시지 |

#### 3.4.3 카드 단위 검증 메시지 (`.dz-error-msg`)
- `파일을 읽는 중 오류가 발생했습니다.` — 파싱 실패
- `문항 코드북 형식이 올바르지 않습니다. 누락된 컬럼: {목록}`
- `응답 데이터셋 형식이 올바르지 않습니다. 누락된 컬럼: {목록}`
- `데이터 열을 찾을 수 없어 형식을 판별할 수 없습니다.`
- `라벨형 데이터로 보입니다. 숫자 코드가 담긴 숫자형 파일을 업로드해 주세요.` (숫자형 자리에 라벨형 업로드 시)
- `숫자형 데이터로 보입니다. 라벨이 담긴 라벨형 파일을 업로드해 주세요.` (반대)

#### 3.4.4 업로드 영역 공통 오류 (`#upload-error`)
- 위치: 업로드 그리드 바로 아래, 가운데 정렬
- 기본 메시지: `지원하지 않는 파일 형식입니다. .csv 또는 .xlsx 파일만 업로드할 수 있습니다.`
- 메인 액션 버튼 클릭 시 번들 검증 실패 메시지로 동적 교체 (3.6 참고)

### 3.5 메인 액션 버튼 `#start-btn`
- 텍스트: `대시보드 만들기`
- 크기: full width / 높이 54px
- 활성 조건 (`updateStart()`)
  1. 제목 입력 trim 결과 비어있지 않음
  2. `state.codebook` not null
  3. `state.value` not null
  4. `state.label` not null
- 비활성 시: 배경 `--neutral-300`, 커서 `not-allowed`
- 활성 시: 배경 `--Black`, hover `--neutral-900`, active 시 1px translateY

### 3.6 메인 액션 클릭 시 흐름
1. 제목 비어있으면 입력란에 포커스, `.error` 클래스, 오류 문구 표시 후 종료
2. 3개 파일을 다시 파싱하여 **번들 정합성 검증** (`validateBundleConsistency`)
   - 코드북 ↔ 숫자형: `question_label` 시퀀스가 응답 데이터 헤더(3번째 컬럼부터)와 일치하는지
   - 코드북 ↔ 라벨형: 동일 검증
   - 숫자형 ↔ 라벨형: 헤더 / 행 수 / 응답 위치(빈칸 패턴) / 첫 두 컬럼(`survey_year`, `respondent_no`)이 동일한지
3. 실패 시 `#upload-error`에 오류 메시지 + `파일을 다시 확인하고 다시 업로드해 주세요.` 표시
4. 통과 시 신규 surveyId 생성 → 파일 IndexedDB 저장 → 메타 localStorage 저장 → sessionStorage에 currentId·title 저장 → `dashboard.html`로 이동

### 3.7 가이드 배너 `#guide-link`
- 형태: 카드형 링크 (`.guide-banner`)
- 본문: `문항 코드북과 응답 데이터셋이 무엇인지 모르겠거나, 아직 만들지 않았다면 아래 가이드를 참고해 주세요.`
- 링크 텍스트: `가이드 보러 가기 →`
- 링크 URL: `https://fursys.atlassian.net/wiki/external/NjI0NWQ2YWZkYWI3NGQ2NmEzYWNlYWVhODdhNGQ1NjA` (Confluence 외부 공유 페이지)
- 동작: 클릭 시 새 탭(`target="_blank"`)으로 가이드 문서 열기. `rel="noopener noreferrer"` 적용
- 별도 JavaScript 핸들러 없음 — 표준 앵커 동작 사용

### 3.8 푸터
- 텍스트: `(주)퍼시스 Copyright 2026 fursys Inc.`
- 색상: `--neutral-600`, 폰트 12px

### 3.9 저장된 대시보드 리스트 모달 `#list-modal`
- 트리거: 우상단 리스트 버튼 클릭, 또는 `sessionStorage.openListOnLoad === '1'`인 채로 진입
- 닫기: ✕ 버튼 / 백드롭 클릭 / Esc 키
- 헤더: `저장된 대시보드 리스트`

#### 3.9.1 빈 상태
- 메시지: `아직 저장된 대시보드가 없습니다. 설문조사를 업로드하고 분석을 시작하면 여기에 쌓입니다.`

#### 3.9.2 리스트 아이템 `.saved-item`
- 좌측: 제목 + 저장일 (`YYYY-MM-DD HH:mm` 포맷)
- 우측 액션
  - `이름 바꾸기` — 인라인 input으로 전환, Enter로 확정 / Escape로 취소 / blur 시 자동 확정. 최대 50자
  - `삭제` — confirm 다이얼로그(`이 대시보드를 삭제하시겠습니까?`) → 메타·IndexedDB 파일 함께 삭제
- 제목/메타 영역 클릭 시 → 해당 설문을 currentId로 설정하고 `dashboard.html`로 이동

---

## 4. 데이터 / API 연동

이 화면은 외부 API 없이 **로컬 브라우저 저장소만** 사용한다.

### 4.1 입력 데이터
| 항목 | 출처 | 비고 |
| --- | --- | --- |
| 설문 제목 | 사용자 입력 (`#survey-title`) | trim 후 30자 이내 |
| 코드북 | 사용자 업로드 | `.csv` 또는 `.xlsx`, 첫 시트 사용 |
| 숫자형 응답 데이터 | 사용자 업로드 | 숫자 코드 위주 |
| 라벨형 응답 데이터 | 사용자 업로드 | 텍스트 라벨 위주 |

### 4.2 파일 파싱 규칙 (`readTabularFile`)
- CSV: UTF-8로 텍스트 읽기, BOM 제거, 자체 구현 CSV 파서 사용 (따옴표·이스케이프 지원)
- XLSX: ArrayBuffer로 읽고 `XLSX.read(...)` (CDN: `xlsx@0.18.5`) → 첫 시트만 사용
- 코드북은 전체 행, 응답 데이터셋은 검증용으로 상위 50행만 파싱

### 4.3 형식 판별 (`detectResponseType`)
- 4번째 컬럼부터 데이터 컬럼으로 간주 (앞 컬럼은 메타로 가정)
- 헤더 이름이 `기타_텍스트` / `기타 텍스트` / `other_text` / `__기타` / `__other`로 끝나면 자유응답 컬럼으로 간주, 판별에서 제외
- 비자유응답 셀에서 텍스트 비율 < 2% → `numeric`, ≥ 5% → `label`, 그 외 `ambiguous`

### 4.4 필수 컬럼
- 코드북: `question_no`, `question_label`, `response_type`, `data_column_role`
- 응답 데이터셋(숫자형·라벨형 공통): `survey_year`, `respondent_no`
- 헤더 비교 시 BOM 제거 + trim + lowercase 정규화

### 4.5 저장 키
| 저장소 | 키 | 용도 |
| --- | --- | --- |
| `localStorage` | `p6s.surveys` | 설문 메타 배열 (`id`, `title`, `createdAt`, `files`{key→{name,size,contentType,idbKey}}) |
| `IndexedDB` | DB `p6s.surveyFiles` / store `files` | 실제 파일 바이너리 (id = `file:sha256(name::size::contentType::content)`) |
| `sessionStorage` | `survey.currentId` | 다음 페이지에서 열 설문 id |
| `sessionStorage` | `survey.title` | 다음 페이지 헤더에 표시할 제목 |
| `sessionStorage` | `openListOnLoad` | 홈 진입 시 저장 모달을 즉시 열지 여부 |

### 4.6 파일 저장 정책 (`persistSurveyFiles` / `deleteSurveyFiles`)
- 동일한 파일은 SHA-256 해시 기반의 키로 중복 저장 방지 (다른 설문에서도 공유 가능)
- 삭제 시 다른 설문이 같은 idbKey를 참조 중이면 IndexedDB 레코드는 보존 (`isFileReferencedElsewhere`)
- 레거시(content를 localStorage에 직접 저장하던) 데이터는 페이지 로드 시 `migrateLegacySurveyStorage`가 자동으로 IndexedDB로 옮김

### 4.7 외부 의존성
- 폰트: Pretendard Variable (`cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9`)
- 아이콘: Material Symbols Rounded (Google Fonts)
- 라이브러리: `xlsx@0.18.5`(SheetJS, CDN)

---

## 5. 본 문서에서 다루지 않는 범위
- 저장된 대시보드 검색·정렬·페이지네이션
- 업로드 샘플 다운로드 기능
- 다국어 처리
