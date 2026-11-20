# Windows 1.26.65.1 클라이언트 분석: 주소 모음

짝이 되는 사이트 페이지는 절마다 적었다. 분석 대상은 Windows 1.26.65.1 `Minecraft.Windows.exe`(이미지 베이스 `0x140000000`)이고 주소는 이 판의 VA다. 판 번호가 바뀌면 주소도 바뀐다. 증거 수준은 `코드`(디컴파일이나 디스어셈블로 읽음), `문자열`, `추론`, `미확인`이다.

## 엔진 변수와 화면 이름

짝: `docs/json-ui/files-and-definitions.mdx` 1.11절, `docs/ore-ui/overview.mdx` "화면 선택과 문자열".

- 전역 변수 맵 함수: `0x147463150`(가상 함수 슬롯, 변수 맵 하나를 채운다). 입력 모드는 컨트롤러 번호를 키로 FNV-1a 해시 맵에서 찾는다. 에디션 문자열은 에디션 서비스 플래그가 참이면 `edu`로 덮은 뒤 비교한다. 안전 영역 4개는 `0x14055f080`이 계산한다. 이 함수를 부르는 쪽(변수 맵을 UI 해석기에 넘기는 곳)은 추적하지 않았다.
- `$is_big_screen`을 넣는 일시정지 화면 함수: `0x1428a9190`.
- 화면 전용 변수를 넣는 함수: 설정 계열 `0x1450e9cd0`, 인벤토리 계열 `0x145027c50`과 `0x147085cb0`, HUD 제목 팩토리 `0x144b5eb40`(`$actionbar_text`는 `0x144b6ed20`), 채팅 `0x140682580`, 재료 색 `0x1400dfae0`, 게임 팁 `0x1451c2820`, 토스트 `0x145240840`과 `0x145028360`, `$chest_size` `0x14708e8b0`과 `0x1470ad490`, `$container_size` `0x147475750`, `$use_smithing_table_2_ui` `0x147099840`, `$container_title` `0x1450099e0`, `$left_tab_index_*` `0x145244ea0`. `$` 이름 431개 중 142개 함수가 이름을 넣고 전역 맵 함수가 그중 하나다.
- 화면 생성 함수: `namespace.control` 형태 화면 이름 145개(화면 아닌 것 2개). 대부분 `0x14053xxxx`에서 `0x14055exxx` 사이의 작은 함수 하나가 만들고 씬 생성 공용 함수 `0x140535300`을 부른다(예 `0x1405387c0`, `0x14054b200`, `0x140547db0`). 상자 계열 5개는 `0x146f3c720` 한 함수가 인자로 고른다.
- 화면 선택기: RTTI 이름 `UIScreenTechStackSelectorInitializerAnon`의 등록 함수 12개(이름은 사이트 페이지에 있다). opt-in 함수는 `OreUI_PlayScreen_OptIn` `0x1428fbd90`, `OreUI_PlayScreen_Servers_OptIn` `0x1428fbff0`, `OreUI_EditWorldScreen_OptIn` `0x1452a6cc0`이고 서비스 객체의 가상 슬롯 `+0x688`에 이름을 넘긴다. 앞의 둘이 부르는 처리 함수는 `0x1428c0f10`이다. facet 등록 함수는 `0x14c18b7d0`이다. `mc-` 접두 원격 플래그를 등록하는 함수는 `0x1426470f0`이다.
- 내장 팩 목록 함수: `0x14773ec70`(조건 없이 항목을 추가하는 긴 함수). 실험 팩이 실험을 켰을 때만 들어가는지는 이 함수에서 읽을 수 없다.

## 실험 토글

짝: `docs/scripting/versions-and-beta.mdx` "실험 토글 id 32개".

- id 표를 만드는 정적 초기화 함수: `0x14196a290`(77KB). Ghidra 디컴파일이 시간 초과라 capstone 디스어셈블로 읽었다. 읽은 구역은 `0x141978674`에서 `0x141979c70`이다. 짧은 이름은 8바이트 즉시값이다. id와 약어는 같은 순서이고 스택 슬롯 간격이 32바이트다.
- 직렬화 함수: `0x147f1ea40`(`Experiments` 객체, `Toggles` 배열, `ExperimentsEverToggled`).
- 이 표를 소비하는 함수와 약어의 용도는 찾지 못했다.

## 명령어

짝: `docs/content/functions-and-commands.mdx` 7절.

- 등록 함수 `0x1455aaab0`(레지스트리, 이름, 설명 키, 권한 바이트, 플래그1, 플래그2). 호출 위치 104곳. 등록 전체 묶음 `0x14577f740`. 등록 때 전역 조건이 참이면 플래그에서 `0xe`를 지운다(조건의 출처는 모른다). 열거형 등록 `0x1455ac290`과 `0x1455acd00`.
- 실행 직전 검사: `0x145560ea0`(출처 종류를 비트로 바꾼다. 종류 0은 `0x4`, 1과 2는 `0x2`, 5와 6은 `0x8`. `0x400`과 편집기 객체로 `commands.generic.disabled.editorLocked`로 가는 분기도 여기에 있다).
- 서버가 보낸 명령 목록을 등록하는 경로: `0x1455caf00`. 스크립트 커스텀 명령 별칭 문구는 `0x14bd1f560`.
- 개별 명령 등록 함수: `ability` `0x145785a90`, `immutableworld` `0x14578c6d0`, `takepicture` `0x148568610`, `resourceuri` `0x148564af0`, `worldbuilder` `0x148569ee0`, `classroommode` `0x146f34880`, `code` `0x146f34cd0`, `gametips`와 `party`와 `closechat`와 `getlocalplayername`와 `geteduclientinfo` `0x1469413d0`(묶음), `lesson` `0x14578c960`, `codebuilder` `0x1457867b0`과 `0x1457a2770`, `agent` `0x145795c20`, `closewebsocket` `0x148573180`, `enableencryption` `0x148573550`, `gettopsolidblock` `0x14be88080`, `querytarget` `0x148562420`, `listd` `0x14be9c110`, `kill` `0x14be9a5f0`, `kick` `0x14be95de0`, `gamerule` `0x14be769b0`. `getchunkdata`, `getchunks`, `getspawnpoint`, `globalpause`는 `0x14577f740` 안이다.
- 이름 정정: `particle` `0x14beeadc0`, `camerashake` `0x1485a3f00`, `transfer` `0x14be51210`. 이 셋의 설명 키만 `commands.spawnParticleEmitter.description`, `commands.screenshake.description`, `commands.transferserver.description`이다.
- 열거형 값 등록 `0x1455a8b60`, 오버로드 등록 `0x1457b2020`. 소문자 키워드 오류 문구 근처 `0x145771000`. 핵심 매개변수 등록 `0x14558b4b0`.
- 게임규칙 이름이 나오는 곳: 속성 묶음 정의 `0x14070a410`, 세계 생성 텔레메트리 `0x14a95c8c0`. 게임규칙 레지스트리 생성 함수는 찾지 못했다.

## 스크립트 모듈과 권한

짝: `docs/scripting/versions-and-beta.mdx`, `docs/basics/manifest.mdx` "스크립트 모듈 의존성 버전", `docs/scripting/overview-and-modules.mdx` "실행 권한 3종".

- 의존성 필터 조립: `0x1468e9450`(서버 엔진은 같은 등록 함수를 14회 부른다). 에디터 모듈 필터 `0x147dbb560`, 게임테스트 필터 `0x147dbbbe0`, 릴리스 필터 `0x147dbbea0`, server-net 필터 `0x147dbc300`, 멀티플레이어 게임 필터 `0x147dbc980`, 모듈 허용 목록 필터 `0x147dbcbb0`. 모듈 발견 함수 `0x1468d31e0`(호출자는 서버 엔진 `0x1468f18d0`이 type 3, 클라이언트 엔진 `0x142806600`이 type 4를 넘긴다).
- 모듈 type 열거 표: rdata `0x14efff768`부터 32바이트 간격. 매니페스트 파서 `0x141850050`, 쓰기 `0x1418338e0`.
- 모듈 버전 등록: `@minecraft/client` `0x1416089e0`(전역 `0x1528ee580`, 초기화 `0x141673760`), `server` 표 초기화 `0x147d00970`과 `_addVersions` `0x147cfc090`(`2.12.0-beta` 전역 `0x152a1f208`, internal `0x152a1f230`, `3.0.0-alpha` `0x152a1ed48`, 계산부 `0x147dbe220` 부근), `server-bindings` `0x147d0e070`, `server-ui` `0x147d62270`, `server-ui-bindings` `0x147d51a70`, `server-gametest` `0x147ce3b90`, `server-net` `0x147d06c70`, `debug-utilities` `0x147cdd4d0`, `diagnostics` `0x147ce2620`, `server-graphics` `0x14ba0f850`, `server-admin` 후보 `0x14ba0e810`.
- 모듈 UUID 묶음 생성자 `0x147d6cce0`(0xe0 바이트, 16바이트 UUID 14칸). 14칸 중 3칸은 이 빌드에서 "미설정" 상수로 대체되고 `@minecraft/app-multiplayer-game`의 칸(`+0xd0`)도 그중 하나다.
- 클라이언트 스크립트 엔진을 켜는 옵션 `options.hidden.enable_client_script`(옵션 id `0x27e`)는 옵션 등록 함수 `0x145b0c2c0`에서 등록된다. 레벨 설정 워드 `+0x160`의 비트 1이나 레벨의 가상 불리언과 OR로 묶인다.
- 권한 게이트: 네이티브 함수 `0x14a3cef80`, 생성자 `0x14a3c9a80`, getter `0x14a3d02a0`, setter `0x14a3d2190`. 컨텍스트 값은 객체 `+0x1b0`의 1바이트이고 문구 선택은 `0x14a3cf0b0` 부근이다.
- `3.0.0-alpha` 전역을 읽는 클래스 바인딩 함수: `Duration` `0x14b54aa00`, 효과 지속시간 `0x14dffe0c0`, `0x14e006d30`, `0x14a5b20f0`, `0x14c304d70`, `StartupEvent` `0x14a47eab0`.
- server-ui 바인딩에서 `styleId`를 가진 옵션 함수: `0x14b697e70`, `0x14b699de0`, `0x14b69b940`, `0x14b69ce90`, `0x14b69ee10`, `0x14b6a0db0`, `0x14b6a3760`, `0x14b6a9640`, `0x14b6aa410`, `0x14b6b22f0`, `0x14b6b3870`, `0x14b6b4660`. `MessageBox` `button3` 계열 `0x14b6b5bd0`과 `0x14b6c2330`, 폼 JSON 키 `0x14b6800c0`, `CustomForm` `0x14b6667d0`.
- 동적 속성 한도: 길이 검사 `0x143d221b0`, 총량 검사 `0x143d22e00`과 `0x143d22f50`, World 호출 `0x14d59a490`, 다른 한 종류 `0x14c37eca0`. watchdog 옵션 등록 `0x145b0c2c0`(옵션 id `0x26e`에서 `0x272`).

## 머티리얼, 파티클, Molang

짝: `docs/rendering/materials-and-shaders.mdx`, `docs/rendering/particles.mdx`, `docs/rendering/sounds.mdx`, `docs/rendering/render-controllers.mdx`, `docs/rendering/animations-and-controllers.mdx`, `docs/rendering/textures-and-atlases.mdx`.

- 머티리얼 상태 JSON `0x144df2730`, 상태 이름 해석 `0x145a49e80`, 상태 배열 처리 `0x145a4f0f0`과 `0x145a4fcb0`, 열거형 표 정적 초기화 `0x1456e1aa0`(65KB), 상태 이름 표 `0x145a54570`, 샘플러 항목 `0x144df5730`. 키 접두사 표 `0x14f275498`. 열거형 해시 맵은 `0x1529cb058`(depthFunc)부터 이어진다. `PolygonOffset`을 담은 무시 이름 맵은 `0x1529d0460`이다. `msaaSupport`를 덮는 전역은 `0x1528c21f0 + 0xc`.
- 30번째 파티클 컴포넌트 등록 `0x146b5be00`, 생성 `0x146b6e7a0`, 갱신 `0x14bf39790`, 가상 함수 표 `0x14f2cf9d0`.
- 파티클 이미터 초기화 `0x146b46770`, 갱신 `0x146b48e00`(`entity_scale`은 이미터 데이터 `+0x31c`).
- 변수 이름 표 `0x15295eb50`, 이름 등록 `0x142ca0440`, `context.*` 5개 선등록 `0x142c9fcc0`.
- `sounds.json` 엔티티 소리 파서 `0x140af4690`, `interactive_sounds` 파서 `0x140aefb80`. 블록 정의 쪽 Molang 버전 처리 `0x1431bd2a0`.
- `query.is_on_screen`: 실행 `0x142cbff40`, 등록 `0x142c96f93`, 액터 플래그 `+0x376`, 플래그를 쓰는 `DataDrivenRenderer` 가상 함수 `0x145987cb0`.
- 쿼리 조회 `0x142c89090`, 쿼리 등록 함수 `0x142c89600`, 월드젠 쿼리 `0x145e2b930`, 호출자(해결 실패 로그) `0x141690eb0`. 토큰 표 `0x14f1c9660`(항목 109개), `unrecognized token` 로그 `0x14169dd20`. 배열 인덱스 AST 처리 `0x1416a25e0`.
- 변형 항목 파서(`tint_color` 등) `0x145a8f3b0`, 아틀라스 파서 `0x144e19e80`, `blocks.json` 파서 `0x1467f5d10`.
