규칙 ID는 JSON UI 규칙에만 붙는다. 애드온 콘텐츠, Script API, 렌더링, 서버, 도구 같은 다른 주제는 [섹션 지도](../index.mdx#섹션-지도)에서 그 섹션 첫 페이지로 가서 페이지 지도와 요약을 보고, 각 페이지 항목 끝의 [검증 수준 표기](../index.mdx#검증-수준-표기)로 신뢰도를 판단한다.

## 근거 수준

수준 표기(`실측`, `바닐라`, `작동팩`, `코드(소스)`, `코드(바이너리)`, `추론`, `미검증`, `충돌`)의 뜻과 판정 우선순위는 [위키 첫 페이지의 검증 수준 표기](../index.mdx#검증-수준-표기)에 있다. 장별 표와 주제 페이지는 같은 범례를 쓴다.

## 근거 환경

장별 표의 "근거 환경" 칸은 그 규칙의 실측이나 바이너리 근거에 적힌 플랫폼과 버전이다. 규칙 본문과 출처에 적힌 것만 옮기고, 출처 약어에 환경이 정해진 경우(`TP`, `DF`는 Windows 1.26.52, `NB`는 Android 1.26.52.3, `EML`, `E2048`, `HXC`, `IUC`는 모바일 1.26.63)는 그 환경을 쓴다. 실측이나 바이너리 근거가 있는데 환경이 적혀 있지 않으면 `모름`, 그런 근거가 없으면 `-`다. 버전은 `1.26.65.1`처럼 `1.`로 시작하는 꼴로 적는다. 게임이 쓰는 `26.65`는 `1.26.65`와 같다([버전 체계](../basics/versions.mdx)).

## ID 접두어

| 접두어 | 뜻 | 정의한 곳 |
| --- | --- | --- |
| `FILE`, `MOD`, `LAY`, `BND`, `EXP`, `COL`, `INP`, `TXT`, `ANI`, `HOST`, `PAT`, `ALT`, `DBG` | JSON UI 규칙. 장마다 접두어가 하나다 | 아래 장별 표 |
| `C` | 출처끼리 주장이 다른 곳의 충돌 판정 | [충돌 판정표](../json-ui/conflicts.mdx) |
| `D` | 커뮤니티 보고와 규칙을 맞춰 본 대조 항목 | [커뮤니티 보고와 대조](../json-ui/community-reports.mdx) |
| `NB` | 네이티브 클라이언트 바이너리 분석의 발견 | [발견 색인](../internals/findings-index.mdx) |
| `R` | 바이너리 분석으로 새로 알게 된 사실 | [JSON UI 엔진 발견](../internals/json-ui-engine-findings.mdx), [Ore UI 엔진 발견](../internals/ore-ui-engine-findings.mdx) |
| `RV` | 바이너리 분석으로 다른 출처의 주장을 확인하거나 바로잡은 것 | [JSON UI 엔진 발견](../internals/json-ui-engine-findings.mdx), [Ore UI 엔진 발견](../internals/ore-ui-engine-findings.mdx) |
| `CN` | Cinnabar(`CN`) 분석 기록의 항목 번호. 이 위키에는 번호별 표가 없다 | 없음 |

출처 약어(`VN`, `BC`, `BW` 등)는 [출처 약어](./source-abbreviations.mdx)에 있다.
