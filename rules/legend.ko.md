## 근거 수준

| 수준 | 뜻 |
| --- | --- |
| 실측 | 게임 안에서 측정한 기록이 있다 |
| 바닐라 | 바닐라 리소스팩 `ui/` 파일에서 실제로 쓰인다 |
| 작동팩 | 배포되어 동작하는 팩이 그렇게 쓴다 |
| 코드 | 소스나 컴파일 결과를 읽어 확인했다. 게임 동작까지는 보장하지 않는다 |
| 추론 | 위 근거들로부터 판단했다 |
| 미검증 | 출처가 주장했지만 근거를 확인하지 못했다 |
| 충돌 | 출처끼리 다르고 완전히 해소되지 않았다. 판정은 [충돌 판정표](../json-ui/conflicts.mdx)에 있다 |

판정 우선순위는 실측, 바닐라, 작동팩, 코드, 추론 순이다. 같은 수준끼리 다르면 더 나중의 측정을 따르고, 그래도 다르면 `충돌`로 남긴다.

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

출처 약어(`VN`, `BC`, `BW` 등)는 [JSON UI 개요](../json-ui/index.mdx)의 출처 약어 표에 있다.
