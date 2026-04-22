# UI Behavior Notes
## Rank Question Rules

The following rules apply to every `객관식 순위` question in the current dashboard behavior.

- Each rank percentage uses the full respondent base for that question as the denominator.
- In group comparison, each group's rank percentages use that group's full respondent count `n` as the denominator.
- Responses that exist only in the raw rank column and do not appear in any `__1순위`, `__2순위` style expanded column are still shown in the chart and data table.
- Raw-only non-ranked responses are excluded from `가중 점수` and `종합 순위`.
- `기타` remains visible in the rank chart and rank data table, but is excluded from overall ranking.
- `기타` free-text responses are opened from the data table via the same modal-style `응답 보기` button used for single and multiple choice questions.
- When a group is unchecked in the legend, that group disappears from both the rank chart area and the rank data table.
- Rank group comparison shows per-group ranking results in a table layout rather than inline sentence text.
- Rank data tables include a total row. The total row keeps per-rank percentage and count totals, while `가중 점수` and `종합 순위` remain `-`.


## 조사 연도 조건

- `survey_year`는 응답 데이터셋의 시스템 컬럼으로 취급한다.
- `조사 연도` 고정 필터는 `survey_year` 값이 2개 이상일 때만 노출한다.
- `survey_year` 값이 1개 이하이면 `조사 연도` 고정 필터는 만들지 않는다.
- `분석 기준 문항` 영역의 `연도별 비교하기` 버튼은 항상 보이지만, 실제 동작은 `survey_year` 값이 2개 이상일 때만 가능하다.
- `survey_year` 값이 1개 이하인 상태에서 `연도별 비교하기`를 누르면 비교에 사용할 조사 연도 데이터가 없다는 안내를 표시한다.
- 위 동작은 코드북을 수정하지 않고, 업로드된 응답 데이터셋의 `survey_year` 컬럼 존재 여부와 값 개수로만 판단한다.
