# 대시보드 화면 정의서 (design_spec_dashboard)

작성일: 2026-04-30
대상 파일: `dashboard.html` (스타일: `dashboard.css`, 스크립트: `visualizations.js`)

> **차트 영역(`.data-area` 내부 결과 렌더링)은 본 문서에서 _확인 예정(TBD)_ 으로 둔다.**
> 영역의 위치·컨테이너·진입점만 기록하고, 시각화 종류·동작·옵션은 별도 문서에서 정리한다.

---

## 1. 화면 개요 / 목적

### 1.1 화면 정보
- 화면명: 설문조사 분석 대시보드
- 파일명: `dashboard.html`
- 의존 파일: `dashboard.css`, `visualizations.js`, `xlsx@0.18.5`
- `<title>`: `설문조사 분석 대시보드 | purple6studio`
- 진입 경로: 홈 화면(`home.html`)에서 분석 시작 또는 저장된 대시보드 진입 시. `sessionStorage`에 `survey.currentId` / `survey.title`이 세팅된 상태로 진입한다.

### 1.2 목적
1. 홈에서 업로드된 코드북을 기준으로 **문항 트리**를 보여주고 검색·확장할 수 있게 한다.
2. 응답자 모집단을 좁히기 위한 **필터 바**를 제공한다.
3. 사용자가 좌측 패널의 문항 카드를 메인 영역의 두 드롭존(보고 싶은 문항 / 그룹별 비교)으로 드래그해 분석 구조를 정의한다.
4. 정의된 분석 구조에 따라 **차트와 표를 렌더링**한다. (TBD)
5. 현재 대시보드를 저장하고, 저장된 대시보드 목록을 열람·진입할 수 있는 진입점을 제공한다.
6. 데이터 파일을 교체할 수 있는 **데이터 업데이트** 기능을 제공한다.

### 1.3 사용자 여정
1. 진입 → 헤더 제목·문항 트리 확인
2. (선택) 필터 적용 → 우측 N 카운트가 줄어드는 것을 확인
3. 좌측 문항을 "보고 싶은 문항" 영역으로 드래그 (최대 20개)
4. 좌측 문항을 "그룹별 비교" 영역으로 드래그 (최대 1개)
5. 결과 영역에서 차트/표 확인 (TBD)
6. 필요 시 `현재 대시보드 저장하기` 클릭

---

## 2. 레이아웃 구조 / 영역 구분

### 2.1 전체 구조
```
[ .dash-header                         ] (상단 헤더)
[ .dash-body                           ]
  [ .left-panel-shell ] [ .main-area  ]
  ( 좌측 문항 패널  ) ( 메인 분석 영역 )
[ .dash-footer                         ]
```
- `.dash-body`는 가로 2분할 (좌측 패널 + 메인 영역)
- 모달 4종은 페이지 위에 오버레이로 떠있음 (z-index: 50)

### 2.2 영역별 위치
| 영역 | 위치 | 비고 |
| --- | --- | --- |
| 헤더 메인 (로고 + 제목) | 헤더 좌측 | 제목은 `1차 정보` 위계 |
| 헤더 액션 | 헤더 우측 | 데이터 업데이트 / 저장 / 리스트 / 새 대시보드 |
| 좌측 문항 패널 | 본문 좌측 | 독립 스크롤 |
| 패널 확장 핸들 | 좌측 패널의 우측 가장자리 | 오버레이형 확장 토글 |
| 필터 바 | 메인 영역 상단 | sticky로 메인 스크롤 시 고정 |
| 보고 싶은 문항 / 그룹별 비교 | 필터 바 아래 | 가로 2열 zone-card |
| 결과 영역 (`.data-area`) | 두 zone 아래 | **차트 렌더링 영역 — TBD** |
| 푸터 | 페이지 최하단 | |

### 2.3 좌표·치수 메모
- 좌측 패널: 기본 폭 (CSS 변수 기반), 확장 시 메인을 밀지 않고 위로 덮음(오버레이)
- 메인 영역: 패널 확장 시 위치/크기 유지
- 필터 바: 메인 영역 내부 상단 sticky

---

## 3. UI 컴포넌트 상세 스펙

### 3.1 상단 헤더 `.dash-header`

#### 3.1.1 헤더 좌측 `.header-main`
- 로고 `.logo-link` — `assets/purple6studio_한줄_black.png`
  - 마크업: `<a href="home.html" class="logo-link" aria-label="purple6studio 홈으로 이동">`
  - 동작: 클릭 시 홈 화면(`home.html`)으로 이동 (같은 탭, 표준 앵커 동작)
- 제목 영역 `.title-wrap`
  - `#project-title` — sessionStorage `survey.title`을 표시
  - `#title-edit-btn` — edit 아이콘. 클릭 시 인라인 input(`#project-title-input`)으로 전환
  - input `maxlength="50"`. Enter로 확정, Escape로 취소
  - 확정 시 localStorage `p6s.surveys`의 해당 설문 title도 업데이트

#### 3.1.2 헤더 우측 `.header-actions`
| 버튼 | id | 스타일 | 역할 |
| --- | --- | --- | --- |
| 데이터 업데이트 | `#dashboard-data-update-btn` | `.header-btn` | 데이터 업데이트 모달 열기 |
| 현재 대시보드 저장하기 | `#dashboard-save-btn` | `.header-btn.primary` (검정 배경) | 현재 분석 상태 저장 |
| 세로 구분선 | — | `.header-divider` | 시각 구분 |
| 저장된 대시보드 리스트 | `#dashboard-list-btn` | `.list-btn` (홈 화면과 동일 패턴) | 리스트 모달 + 카운트 뱃지 `#saved-count` |
| 새 대시보드 만들기 | `#new-analysis-btn` | `.create-btn` | `home.html`로 이동 |

### 3.2 좌측 문항 패널 `.left-panel`

#### 3.2.1 상단 툴바 `.panel-toolbar` (sticky)
- 패널 타이틀: `문항 리스트`
- 검색 인풋 `#panel-search`
  - placeholder: `문항 검색`
  - 우측에 search 아이콘
  - 검색 대상: `category_1`, `category_2`, `question_label`, `question_full`, `question_no`
  - 검색 시 매칭되는 아코디언 자동 확장
  - 결과 없을 때: `검색 결과가 없습니다.` 표시

#### 3.2.2 문항 트리 `#question-tree`
- 초기 표시: `코드북을 불러오는 중입니다...` (`.question-list-empty`)
- 데이터 매핑
  - `category_1` → 1차 아코디언
  - `category_2` → 2차 아코디언
  - `question_label` → 카드(`.question-item`)
  - `question_full` → 패널 확장 시 보조 설명으로 노출
- 초기 상태: 모든 아코디언 닫힘. 검색을 비우면 다시 모두 닫힘
- 화살표 아이콘
  - 닫힘 `>` (`assets/icons/arrow_forward_ios_24dp_…`)
  - 열림 `v` (회전 또는 별도 아이콘)
  - 1·2차 모두 우측 정렬

#### 3.2.3 문항 카드 `.question-item`
- 기본: `question_label`만 표시
- 패널 확장 시: `question_full` 값이 있는 항목만 `question_label | Q. question_full`
- 드래그 페이로드: 항상 `question_label` 기준 (질문 식별은 `question_no`로 매칭)
- 선택 상태 `.selected` — 다른 zone에 이미 배치된 경우 시각 구분

#### 3.2.4 선택 상태 바 `#selection-status`
- `aria-live="polite"`
- 표기: `<count>개 선택됨` + `전체 해제` 버튼 `#selection-clear-btn`
- 선택이 0개일 때는 숨김 (`.show` 클래스로 토글)

#### 3.2.5 패널 확장 핸들 `#panel-toggle`
- 위치: 패널의 우측 가장자리에 붙은 세로 핸들 (떠 있는 버튼처럼 보이지 않게)
- 클릭 시 `page.panel-expanded` 토글
- 확장 동작: 메인을 밀지 않고 위로 덮는 **오버레이형 확장**
- 확장 상태에서는 카드에 `question_full` 보조 텍스트가 함께 노출됨

### 3.3 메인 분석 영역 `.main-area`

#### 3.3.1 필터 바 `.filter-bar` (메인 영역 내부 sticky)
- `필터` 라벨
- 필터 칩 리스트 `#filter-list`
  - 칩 항목 `.filter-control` — 드래그 가능 (`.draggable`), 드롭 위치 표시 (`.drop-before` / `.drop-after`)
  - 표기: 필터 이름 + 선택 요약 + 적용 카운트 + ✕ 제거 마크
- 필터 추가 `#filter-add` — `+ 필터 추가` 버튼 클릭 시 `.filter-add-menu` 펼침. 메뉴 비어있을 때는 `.filter-add-empty`
- N 카운트 `.n-count` — `N = <strong id="n-count">1,248</strong>`
  - 현재 동작: 필터가 늘어남에 따라 N이 줄어드는 **목업 동작** (실데이터 연결은 향후)

#### 3.3.2 Zone 1 — 보고 싶은 문항 (`#drop-target`)
- zone 타이틀: `보고 싶은 문항`
- 데이터 속성: `data-zone="target"`, **`data-limit="20"`** (최대 20개)
- 액션 버튼
  - `#target-scale-compare-btn` — `여러 문항 한 번에 비교하기` (기본 `disabled`. 같은 척도 길이 문항이 2개 이상 모이면 활성)
  - `#target-clear-btn` — `모두 삭제` (`.is-delete`)
- 빈 상태 안내 `.empty-hint`
  - 메인: `좌측 문항을 여기로 드래그해 주세요.`
  - 서브: `같은 척도 길이의 문항을 2개 이상 올리면, 여러 문항을 한 번에 비교할 수 있어요.`
- 칩 표시 `.chip` — 검정 pill, 라벨 + ✕ 삭제 버튼. 텍스트는 `question_label`만 사용
- 드래그 오버 시 `.drag-over` 강조

#### 3.3.3 Zone 2 — 그룹별 비교 (`#drop-criterion`)
- zone 타이틀: `그룹별 비교`
- 데이터 속성: `data-zone="criterion"`, **`data-limit="1"`** (최대 1개)
- 액션 버튼
  - `#criterion-year-btn` — `연도별 비교하기` (기본 `hidden`. 연도 관련 필터 활성 시 노출)
  - `#criterion-clear-btn` — `삭제`
- 빈 상태 안내: `좌측 문항을 여기로 드래그해 주세요.`
- 한도(1개) 초과 시 alert 또는 기존 칩 교체 (구현은 visualizations.js에서 처리)

#### 3.3.4 결과 영역 `.data-area` / `#result-container` — **차트 영역 (TBD, 확인 예정)**
- 빈 상태 메시지(`.result-empty`): `보고 싶은 문항을 드래그하면 차트가 생성됩니다`
- 본 문서에서 다루는 사항: 결과 영역의 위치·컨테이너·빈 상태 메시지까지
- 본 문서에서 다루지 않는 사항(=TBD)
  - 결과 섹션 내부의 차트 종류·옵션 (단일 막대 / 가로 막대 / 척도 분포 / 평균 비교 / 등)
  - 정렬·뷰 토글·범례·평균 라벨 등 차트 관련 컨트롤
  - 시각화 → CSV/이미지 export 동작
  - 결과 영역 데이터 바인딩 규칙
- 별도 문서에서 정리 예정

### 3.4 모달 4종

| 모달 ID | 트리거 | 헤더 타이틀 | 핵심 내용 |
| --- | --- | --- | --- |
| `#list-modal` | `#dashboard-list-btn` | `저장된 대시보드 리스트` | 홈 화면과 동일한 리스트(이름 바꾸기 / 삭제 / 클릭 진입) |
| `#data-update-modal` | `#dashboard-data-update-btn` | `데이터 업데이트` | 3종 파일 교체 + `분석하기` 버튼으로 일괄 검증·반영 |
| `#other-response-modal` | (결과 영역에서 기타 응답 클릭) | `기타 응답` | 자유응답(`기타_텍스트`) 목록을 리스트로 노출 |
| `#scale-compare-modal` | `#target-scale-compare-btn` | `다른 문항과 묶어서 보기` | 같은 척도 길이 문항 후보를 다중 선택 후 묶어서 비교 |

#### 3.4.1 데이터 업데이트 모달 `#data-update-modal`
- 안내 문구 `.update-note`: `업로드된 CSV/XLSX 파일을 파일별로 교체할 수 있어요. 파일을 모두 고른 뒤 아래의 분석하기 버튼을 누르면 세 파일을 함께 검증한 다음 반영합니다.`
- `#data-update-list` — 코드북 / 숫자형 / 라벨형 3행. 각 행에 현재 파일명 + 교체 버튼
- 모달 푸터 `#apply-data-update-btn` — `분석하기` (primary)
- 숨겨진 파일 input `#data-update-file-input` (`accept=".csv,.xlsx"`)
- 검증 로직은 홈 화면과 동일 (`validateFileForKey` + `validateBundleConsistency`)

#### 3.4.2 기타 응답 모달 `#other-response-modal`
- 서브타이틀 `#other-response-modal-subtitle` — 어떤 문항의 기타 응답인지 표기
- 리스트 `#other-response-modal-list` — 응답자별 자유 응답 텍스트

#### 3.4.3 척도 비교 모달 `#scale-compare-modal`
- 노트 `#scale-compare-modal-note` — 어떤 척도 길이 기준으로 묶을지 안내
- 후보 리스트 `#scale-compare-modal-list` — 같은 척도 길이의 문항 다중 선택
- 푸터: `취소` / `적용` (`#apply-scale-compare-btn`)

### 3.5 푸터
- 텍스트: `(주)퍼시스 Copyright 2026 fursys Inc.`

---

## 4. 데이터 / API 연동

이 화면도 외부 API 없이 **로컬 브라우저 저장소만** 사용한다.

### 4.1 진입 시 읽는 데이터
| 항목 | 출처 | 사용처 |
| --- | --- | --- |
| `survey.currentId` | sessionStorage | `localStorage.p6s.surveys`에서 해당 설문 메타 조회 |
| `survey.title` | sessionStorage | 헤더의 `#project-title`에 표시 (이후 `p6s.surveys`에서 다시 동기화) |
| 코드북 파일 | IndexedDB `p6s.surveyFiles`(`files.codebook.idbKey` 참조) | 좌측 문항 트리 렌더링 |
| 숫자형 / 라벨형 응답 | IndexedDB | 필터 / 결과 영역 (TBD) |

### 4.2 코드북 → 문항 트리 매핑
- `category_1` → 1차 아코디언 노드
- `category_2` → 2차 아코디언 노드 (동일 `category_1` 아래로 그룹)
- `question_no` → 키
- `question_label` → 카드 라벨, 드래그 페이로드
- `question_full` → 확장 시 보조 설명 (`undefined`면 라벨만 유지)
- `response_type` → 결과 영역에서 차트 종류 결정 (TBD에서 다룸)

### 4.3 필터 바 데이터
- 필터 후보는 코드북에서 `data_column_role`이 필터 대상으로 표시된 컬럼 또는 사전 정의된 인구통계 항목
- 응답 데이터셋에서 해당 컬럼의 unique 값을 옵션으로 추출
- N 카운트는 현재 필터 조건을 만족하는 응답자 수 (현재는 목업 감소 로직)

### 4.4 zone 동작 규약
- 분석 대상(target): 최대 20개. 같은 척도 길이 문항 ≥ 2이면 `여러 문항 한 번에 비교하기` 활성
- 분석 기준(criterion): 최대 1개. 한도 초과 시 alert 또는 기존 칩 교체
- 칩 텍스트는 `question_label` 사용. 내부 식별은 `question_no`

### 4.5 저장 동작 (`#dashboard-save-btn`)
- 현재 분석 상태(드롭된 문항 / 선택 옵션 / 필터 등)를 `localStorage.p6s.surveys`의 해당 설문 엔트리에 병합
- 본 문서에서는 헤더 진입점만 정의. 저장 페이로드 형상은 추후 확장 (TBD)

### 4.6 데이터 업데이트 (`#apply-data-update-btn`)
1. 모달에서 교체된 파일을 받아 `validateFileForKey`로 단건 검증
2. `validateBundleConsistency`로 3종 정합성 재검증
3. 통과 시 IndexedDB의 해당 idbKey 갱신, 메타 업데이트, 좌측 트리·필터 다시 렌더

### 4.7 외부 의존성
- 폰트: Pretendard Variable (CDN)
- 라이브러리: `xlsx@0.18.5` (CDN)
- 시각화 스크립트: `visualizations.js` (로컬, 결과 영역 담당 → TBD)

---

## 5. 상태·동작 규칙 요약

### 5.1 페이지 클래스 상태
| 클래스 | 적용 위치 | 의미 |
| --- | --- | --- |
| `.panel-expanded` | `.page` | 좌측 패널 확장 (오버레이형) |
| `.show` | `.modal-backdrop` | 모달 표시 |
| `.drag-over` | `.drop-area` / 패널 칩 | 드래그 호버 강조 |
| `.has-chip` | `.drop-area` | 칩이 1개 이상 들어있는 상태 |
| `.selected` | `.question-item` | 이미 zone에 배치된 문항 |
| `.dragging` / `.drop-before` / `.drop-after` | `.filter-control` | 필터 칩 재정렬 시 |

### 5.2 키보드 / 단축키
- 모달: Escape로 닫기
- 제목 인라인 편집: Enter 확정 / Escape 취소

---

## 6. 본 문서에서 다루지 않는 범위 (별도 문서로 분리)
- **결과 영역(`.data-area` / `#result-container`) 내부의 차트·표 시각화 (TBD)**
  - 차트 종류 분기 (`response_type` 별 매트릭스)
  - 척도 비교·연도 비교 등 묶음 시각화
  - 범례·정렬·평균 라벨 등 결과 영역 컨트롤
  - 결과 영역 export·복사 동작
- 설문별 동적 필터 추천 규칙 / N 실데이터 연결
- 저장 페이로드 상세 형상 (드롭 상태·필터·뷰 옵션 포함 여부)
- 다국어 처리
