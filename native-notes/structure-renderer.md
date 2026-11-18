# 3d_structure_renderer 속성: 바이너리 세부

짝이 되는 사이트 페이지: `docs/design/structure-renderer.mdx`, "2. 속성 전체" 절.

분석 대상: Windows 1.26.65.1(`Microsoft.MinecraftUWP_1.26.6501.0_x64`), `Minecraft.Windows.exe` 323,828,088바이트. 주소는 이 빌드의 RVA이고 판이 바뀌면 달라진다.

## 방법

- 실행 파일에서 속성 이름 문자열의 파일 오프셋을 찾고, `.text` 구역 전체에서 RIP 상대 `lea`(`48/4C 8D` + ModRM `05..3D`)의 대상이 그 문자열인 곳을 찾았다.
- 그 명령 주위 ±0x3000바이트에서 `lea`가 가리키는 다른 문자열을 모두 모았다. 함수 경계를 나누지 않았으므로 "그 영역의 코드가 참조하는 문자열"이다.
- 문자열 풀은 접미사 순으로 정리되어 있어 문자열 주위 바이트는 관련이 없다(예: `#top_right_block` 옆은 `minecraft:shroomlight_block`).

## 렌더러 코드가 참조하는 속성 이름

`0x157a655`~`0x1580655`에서 찾은 참조는 아래 9곳이고, 서로 다른 이름은 8개다(`#remove_blocks`가 두 번).

| RVA | 문자열 |
| --- | --- |
| `0x157b849` | `#bottom_left_block` |
| `0x157b8b3` | `#top_right_block` |
| `0x157bd86` | `#gesture_delta_source` |
| `0x157bfc7` | `#has_focus` |
| `0x157d2c4` | `#include_players` |
| `0x157d655` | `#include_entities` |
| `0x157daf9` | `#remove_blocks` |
| `0x157db78` | `#remove_blocks` |
| `0x157ddb7` | `#block_position` |

- `#gesture_mouse_delta_x`, `#gesture_mouse_delta_y`는 이 영역에 없다. 둘은 `0x1925b26`~`0x1925ec1`에서 `#gesture_delta_source`와 네 번씩 함께 나온다(입력 패널이 값을 쓰는 쪽으로 추정). 그 밖에 `0x575c45f`, `0x575fd1d`, `0x8815886` 근처에도 나온다.
- 렌더러 이름 `3d_structure_renderer`는 `0x1c7a62a`에서 다른 렌더러 이름(`bohr_model_renderer`, `web_view_renderer`, `actor_portrait_renderer` 등)과 함께 참조된다. 렌더러 이름표로 보인다.
