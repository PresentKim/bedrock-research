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
- 게임규칙 레지스트리 생성 함수: `0x14070a410`(호출자 `0x14070a210`이 `GameRules` 객체, 가상 표 `0x14f08c6b8`를 만든다). 규칙 배열은 39개이고 원소 크기가 `0x118`이다(확장 `0x14071f5c0`). 규칙 기록의 오프셋: `+0` 활성 표식, `+1`과 `+8` 형식(1 불리언, 2 정수, 3 실수), `+4` 값, `+0x10` 이름, `+0x30` 명령 열거형 포함, `+0x31`, `+0x32` 값을 바꾸면 0, `+0x33` 치트 필요, `+0xb0` 값 검증 콜백. 형식 읽기와 쓰기 `0x1407091c0`, `0x14070a060`, `0x14070e500`. 등록 함수 `0x140709c60`은 네 바이트(`+0x30`에서 `+0x33`)를 `0x1010101`로 시작한다. `/gamerule` 등록 `0x14be769b0`(치트 필요 규칙은 두 번째 목록에 따로 넣는다), 실행 `0x14be7b550` 안(`commands.gamerule.type.nocheatsenabled` 분기 `0x14be7b988`, 규칙 번호 `0x2b` 분기). 열거형 포함 검사 `0x14be76e04`. 예전 세이브의 `locatorbar` 키를 `playerWaypoints` 초기값으로 바꾸는 곳은 `0x140729430`이다. 세계 생성 텔레메트리는 `0x14a95c8c0`.
- 출처 종류 이름과 호스트 권한: 실행 주체 종류의 이름은 이 바이너리에 없다. 호스트 플레이어의 권한 수준은 `PlayerCommandOrigin`에 RTTI가 없어 못 읽었다.
- 실행 게이트 `0x145560ea0`의 세부(호출 위치 21곳, 그중 하나가 `CommandRegistry` 실행 함수 `0x14576ea70`): 명령 기록의 권한 바이트는 `+0x1c`, 16비트 플래그는 `+0x1e`다. 레지스트리 편집기 표식 `+0x80`, 실행 주체 가상 함수 `+0xc8`, `+0x40`, `+0x48`(권한 수준), `+0xb8`(종류 객체, 그 `+0xc8`이 종류 숫자), `+0x30`(엔티티), 엔티티 판정 `+0x8f8`. 거부 문구 `commands.generic.error.permissions`와 `commands.generic.blocked_edu`. 실행 함수 `0x14576ea70`은 종류 4, 5, 7, 14를 따로 묶는다. 등록 함수 `0x1455aaab0`는 레지스트리 훅(`+0x390` 객체의 가상 함수 `+0x10`)을 부르고 전역 서비스 불리언이 참이면 `0xe`를 지운다. `0xe`가 모두 켜진 명령은 `0x1455ab370`으로, 아니면 `0x1455aae27` 쪽으로 간다. 이 서비스는 `gettopsolidblock`과 `querytarget` 권한 계산용 서비스(`0x1528c2508`, 가상 함수 `+0x988`)와 다르다(`0x1528c2ae8`).
- `gettopsolidblock` 실행 `0x14be884a0`, `querytarget` 실행 `0x148562810`, `listd` 실행 `0x14be9cc90`, `party` 실행 `0x146944dd0`(등록은 `0x14258a4b0`와 서비스 불리언 조건 뒤), `gametips` 실행 `0x146943ca0`. `codebuilder`의 두 번째 등록 이름은 `codebuilder_actorinfo`(`0x1457a2770`). 오버로드 등록 함수는 인자 0개 `0x146945a40`, 1개 `0x1457b4660`, 2개 `0x1457b2020`, 3개 `0x1457b2f50`, 4개 `0x1457b49e0`(`getchunkdata`). 인자 형식 객체: 액터 선택자 `0x1529ca3c8`, 플레이어 선택자 `0x1529ca418`, 좌표 `0x1529ca430`, 실수 좌표 `0x1529ca498`, 메시지 `0x1529ca3b0`, 불리언 `0x1529cc920`, 정수 `0x1529ca448`, 차원 `0x1529cc8e0`.

## 스크립트 모듈과 권한

짝: `docs/scripting/versions-and-beta.mdx`, `docs/basics/manifest.mdx` "스크립트 모듈 의존성 버전", `docs/scripting/overview-and-modules.mdx` "실행 권한 3종".

- 의존성 필터 조립: `0x1468e9450`(서버 엔진은 같은 등록 함수를 14회 부른다). 에디터 모듈 필터 `0x147dbb560`, 게임테스트 필터 `0x147dbbbe0`, 릴리스 필터 `0x147dbbea0`, server-net 필터 `0x147dbc300`, 멀티플레이어 게임 필터 `0x147dbc980`, 모듈 허용 목록 필터 `0x147dbcbb0`. 모듈 발견 함수 `0x1468d31e0`(호출자는 서버 엔진 `0x1468f18d0`이 type 3, 클라이언트 엔진 `0x142806600`이 type 4를 넘긴다).
- 모듈 type 열거 표: rdata `0x14efff768`부터 32바이트 간격. 매니페스트 파서 `0x141850050`, 쓰기 `0x1418338e0`.
- 모듈 버전 등록: `@minecraft/client` `0x1416089e0`(전역 `0x1528ee580`, 초기화 `0x141673760`), `server` 표 초기화 `0x147d00970`과 `_addVersions` `0x147cfc090`(`2.12.0-beta` 전역 `0x152a1f208`, internal `0x152a1f230`, `3.0.0-alpha` `0x152a1ed48`, 계산부 `0x147dbe220` 부근), `server-bindings` `0x147d0e070`, `server-ui` `0x147d62270`, `server-ui-bindings` `0x147d51a70`, `server-gametest` `0x147ce3b90`, `server-net` `0x147d06c70`, `debug-utilities` `0x147cdd4d0`, `diagnostics` `0x147ce2620`, `server-graphics` `0x14ba0f850`, `server-admin` 후보 `0x14ba0e810`.
- 모듈 UUID 묶음 생성자 `0x147d6cce0`(0xe0 바이트, 16바이트 UUID 14칸). 14칸 중 3칸은 이 빌드에서 "미설정" 상수로 대체되고 `@minecraft/app-multiplayer-game`의 칸(`+0xd0`)도 그중 하나다.
- 클라이언트 스크립트 엔진을 켜는 옵션 `options.hidden.enable_client_script`(옵션 id `0x27e`)는 옵션 등록 함수 `0x145b0c2c0`에서 등록된다. 레벨 설정 워드 `+0x160`의 비트 1과 레벨의 가상 불리언은 매니저가 이미 있을 때 `onClientCreatedLevel`이 옵션과 함께 보는 조건이다.
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

## 블록과 아이템 컴포넌트

짝: `docs/content/blocks.mdx`의 "format_version"과 "충돌/선택 박스", `docs/content/items.mdx`의 "개념".

- 블록 컴포넌트 스키마(`BlockDefinition::BlockComponents`) 함수 `0x149515ae0`(55766바이트). 새 이름 세 개의 위치: `minecraft:enchantment_power_transmitter` 제목 `0x1486e2000`, `minecraft:neighbor_change` 스키마 `0x1486e3d50`과 방향 열거형 `0x1486e25a0`. `vibration_properties`와 비슷한 이름 `can_dampen_vibrations`, `can_occlude_vibrations`는 별개 키로 `internal_vanilla_data`(`0x149934300`, `0x1431b9450`)에서 읽는다. 스크립트 쪽 `BlockVibrationPropertiesComponent` 이름 문자열은 `0x14c8541d0`에 있다. "experimental creator features" 게이트는 `0x14328a950` 계열이다.
- 조합 제약 구조체 형식 정보 함수 7개: `0x14952f7a0`, `0x14952fd20`, `0x149530200`, `0x149530730`, `0x149530af0`, `0x149530ef0`, `0x149532e10`. 검사 문장 위치: `NoRandomOffsetIfUnitBlock` `0x14f535603`(사용 `0x1431cb720`), `NoRedstoneConsumerIfProducer` `0x14f545f2a`, `NoCollisionSnowLog` `0x14f5b3929`와 `0x14f5f9d9f`(사용 `0x14952fdc0`, `0x14996a030`), `CrossComponentsConstraint` `0x14f541a11`(사용 `0x1431e7a60`), `RandomOffsetInBound` `0x14f50fc0c`에서 `0x14f50fdbf`(사용 `0x14952ebb0`), `MultipleBoundingBox` `0x14f50ff9a`와 `0x14f50fff2`(사용 `0x14994bac0`, `0x14996ffb0`, `0x14994b3b0`, `0x14994b910`). 충돌 상자의 범위 상수는 `0x14f3b2a20`에 있고 상한은 (16, 24, 16)이다(아래 "충돌/선택 박스 검사" 참고). `min`/`max` 형태의 실험 문구는 같은 함수군의 문자열이다.
- 아이템 컴포넌트 맵을 만드는 함수 `0x1447e0720`(77547바이트, 얇은 중계 `0x1447e0680`, `0x1447fbd20`). 맵은 인자 `this`의 `+0x278`에 있는 `std::map<std::string, 16바이트 값>`이다. 삽입 `0x1449036a0`. 아이콘 없음 로그 `0x1447f0b2f`. 이름 44개는 직선 코드로 풀어 쓰여 있고 입력 키를 순회하지 않는다. 스키마 레지스트리는 `0x1447fbd70`(이름 53개). `fuel` 관련 읽기 `0x1447f2bb7`.

## 클라이언트 스크립트 엔진과 숨은 옵션

짝: `docs/scripting/server-net-and-admin.mdx`의 "JSON UI -> 스크립트 채널 없음".

- 옵션 `options.hidden.enable_client_script`는 옵션 id `0x27e`(638), 열거 이름 `ENABLE_CLIENT_SCRIPT`다. 등록 위치 `0x145b3d0e2`에서 `0x145b3d106`이 표시 이름만 받는 불리언 템플릿 `0x145bc0360`을 부른다. 이 템플릿은 옵션 생성자 `0x1409be250`에 표시 이름을 넘기고 저장 키 칸에는 빈 문자열 상수 `0x14f278ed0`를 넘긴다. 같은 템플릿을 쓰는 옵션은 열 개다(`options.dev_disableRenderTerrain`, `_Sky`, `_Weather`, `_Hud`, `_ItemInHand`, `options.dev_renderBoundingBox`, `_renderPaths`, `_renderSensorState`, `options.multiplayergame`, 이 옵션). 일반 옵션은 `0x145bbf8b0`으로 표시 이름과 저장 키를 둘 다 넘긴다. options.txt를 쓰는 함수 `0x145b68a10`은 저장 키 길이(`+0x198`)가 0인 옵션을 건너뛴다. 줄을 만드는 함수 `0x1409c16b0`, 서식 함수 `0x1409c6950`.
- 옵션 레지스트리 생성자 `0x145b0aba0`(가상 표 `0x14f278f10`)가 등록 함수 `0x145b0c2c0`을 한 번 부른다. 슬롯은 825칸이고 등록 가상 함수는 `0x145af8ba0`이다. 옵션 열거 이름 표는 826개(id 825는 `COUNT`)이고 rdata `0x14f292a70`부터 16바이트 간격이다. 등록 함수 안에서 등록되는 옵션이 484개이고 341개는 이 exe에서 등록 코드를 못 찾았다. 등록 지점이 따로 다섯 곳 있고 읽지 않았다(`0x1413389a0`, `0x14263f5e0`, `0x142644450`, `0x142646930`, `0x1426447c0`). `0x14263f5e0`는 `mc-` 원격 기능 플래그 이름을 만든다.
- 옵션 객체는 0x58바이트이고 `+8`이 0x2a0바이트 내부 구조체를 가리킨다. 내부 구조체의 `+0x1cc` id, `+0x1d0` 등록 인자, `+0x1d8` 표시 이름, `+0x188` 저장 키다(생성자 `0x1409be330`). 파생 생성자 `0x1409c3160`, `0x1409c1ed0`, `0x1409c45d0`, `0x1409c5050`, `0x1409c57f0`, 열거형 정수 옵션 `0x1409c4de0`, `0x145bc0640`, `0x145bbf000`.
- 클라이언트 스크립트 매니저 생성자 `0x142806440`(세 번째 인자 불리언을 `+0x20`에 저장, 호출자는 `0x1465eaab9` 하나). 그 호출을 감싼 함수 `0x1465ea960`은 옵션 값 노드의 바이트 `+0x10`을 읽어 1이면 매니저가 없을 때 만들고 아니면 지운다. 그러므로 매니저는 시작 때가 아니라 옵션 변경 콜백에서 만들어진다. `onClientCreatedLevel` 처리 `0x142806600`(가상 표 포인터 `0x14f149bb0`)에는 Beta APIs와 Upcoming Creator Features를 켠 월드에서도 진입 훅이 한 번도 호출되지 않았다. 게임 초기화 `0x14658ce30`은 옵션 `0x27e`를 읽어 변경 관찰자를 등록한다(`0x14658d83f`). 클라이언트 인스턴스 쪽 `0x1408ab820`도 같은 세 조건을 조합한다(옵션 읽기 `0x1408aba8c`).
- 엔진 조건 읽기: 클라이언트 인스턴스 가상 함수 `+0x970`의 불리언이 매니저 불리언(`+0x20`)과 같아야 계속한다. 레벨 설정 구조체는 Level 가상 함수 `+0x568`의 반환값(그 `+0x160`이 가리키는 정수)이고 비트 1을 본다. 레벨 불리언은 Level 가상 함수 `+0xac8`(슬롯 345)이다. 모듈 레지스트리에 `@minecraft/client` 팩토리를 등록하는 곳은 `0x147bf3a50`이다. 팩 스택은 클라이언트 인스턴스 가상 함수 `+0x2f0`가 돌려주는 객체의 `+0x130` 또는 `+0x148`(레벨 불리언이 거짓이면 앞, 참이면 뒤, `0x1428069a5`, `0x1428069ae`)이다. 발견 함수 `0x1468d31e0`을 `0x142806a86`에서 인자 4(`client_script`)로 부른다. `scripts/` 접두 상수는 `0x1428069cd`.
- 클라이언트 스크립트 API 바인딩: 모듈 바인딩 `0x141638290`, 호출하는 함수 `0x141608da0`, `0x14160cdd0`. `client` `0x1416391ab`, `Client` `0x1416383c0`, `Client.events` `0x1416385a0`(반환 클래스 `Events`, `0x141608dfa`), `messageReceive` 신호(타입 이름 `MessageReceiveEventSignal_deprecated`, `0x141608fc9`, `0x141608fda`, rdata `0x14f5f5132`, `0x14f5f5142`), `subscribe` `0x14160983a`, `unsubscribe` `0x14160a16f`, `postServerMessage` `0x1416388a3`, `0x1416387e8`, 이벤트 클래스 `MessageEvent` `0x14160ce14`(`id` `0x14160cfd3`, `message` rdata `0x14f5e305c`). `ScriptMessagePacket`은 id `0xB1`, 직렬화 설명 `0x1443aac40`(문자열 `0x14f53fbee`, 필드 `Message Id` `0x14f605f4c`, `Message Value` `0x14f5c0862`, 페이로드 `ScriptMessagePacketPayload` `0x14f60061e`). `postServerMessage`의 송신 지점은 추적하지 않았다.
- 옵션 `dev_file_watcher`(id 53, 기본 켜짐)와 `dev_enable_texture_hot_reloader`(id 558, 기본 꺼짐)는 등록 함수 `0x145b0c2c0`에서 등록되고 두 `options.txt`에 키가 있다. 소비 코드는 읽지 않았다. `dev_*` 키가 있는 옵션 58개는 `options.txt`에 쓰이지 않는다. 이유는 아래 "개발 옵션 저장 키 비우기"에 있다. 옵션 `options.dev_enableOreUIEditWorldPreviewButton`은 id 553이 이 문자열을 저장 키 칸에 넣어 등록한다.
- 열거 이름 표 중 등록 코드가 없는 묶음: 렌더링 조정값 id 54에서 245와 250, 자동화와 시험 장비 id 436에서 470 등, 화면 재정의 `DEV_NEW_*_SCREEN_OVERRIDE`와 `NEW_*_SCREEN_BETA` id 583에서 592, 595, 596, Ore UI 개발 옵션 id 593과 816에서 820, `SCRIPT_FACET`에서 `CUSTOM_TOUCH_ZONE` id 639에서 643.
- 실측 중 크래시 한 번: `Minecraft.Windows.exe` 예외 `0xc0000005`, 오류 오프셋 `0x2680991`(VA `0x142680991`). 직접 읽은 명령은 `mov rcx,[rax+0x200]` 직전의 가상 호출 반환이 null인 경로다. 호출자는 읽지 않았고 팩 구성 때문인지 타이밍 때문인지 가르지 못했다.

## Ore UI 선택기 조건

짝: `docs/ore-ui/overview.mdx` "화면 선택과 문자열".

- 12개 `register*Screen` 함수는 초기화 함수 `0x14010dda0`에 인라인돼 있다(설정 화면만 `0x14011dec0`으로 분리). 게임 초기화 `0x14658ce30`이 `0x146590955`에서 한 번 부른다. 인자 `p3`은 `0x1465908e9`, `0x1465908ff`, `0x14659091b`에서 채워진다(객체 가상 `0x500`, `[+0x1c8]` 객체의 가상 `0x700`). 경로마다 기록에 함수 A는 `+0x10`, 함수 B는 `+0x50`이다. 조회 핸들러 `getTechStackForScreen` `0x14c18b940`, 선택 핸들러 `0x14c18b930`, 보조 옵션 조회 `0x14010d6c0`.
- 조건 함수 몸체(`std::function` 호출 슬롯): `0x14efcc3e0`에서 `0x14efcc820`. 서비스 질의를 하는 함수 `0x14011d900`(서비스 객체 전역 `0x1528c2a68`, 인자 2), `/player-permissions`의 B `0x14011dc10`(전역 서비스 `0x1528c2508`), `/send-invites` `0x14011dde0`, `/oreui-marketplace/search`의 A `0x14011e900`(전역 인자 `0x1528c2ae0`), 설정 화면 경로 비교 `0x14011e550`.
- opt-in 이름 세 개는 화면 컨트롤러의 가상 표 항목이다: `0x1428fbd90`, `0x1428fbff0`, `0x1452a6cc0`. 컨트롤러 `0x1428c3940`과 `0x1452a5eb0`이 그 표를 만든다.

## 충돌/선택 박스 검사

짝: `docs/content/blocks.mdx`의 "충돌/선택 박스".

- 충돌 박스 검사: 배열용 `0x149bc6230`, 객체 하나용 `0x149bc57b0`. 개수 17 이상 처리 `0x149bc6050`(문장 `0x14f50fbdd`). 범위 오류 문장 `0x14f830320`. 변환 `0x143192df0`(`min`/`max`를 원점 = (min.x - 8, min.y, min.z - 8), 크기 = max - min으로 바꿈). 범위 상수 `0x14f3b2a20`. 실험 게이트 문장 `0x14f568e43`과 제약 검사 `0x14328abc0`.
- 선택 박스 검사 `0x147aabaa0`(문장 `0x14f830256`, `0x14f8302b3`). 높이 상한 16.
- 스키마 설명 문자열: `0x14f803f2a`, `0x14f803fc1`, `0x14f804056`, `0x14f8040ea`, `0x14f80417e`. 설명 함수 `0x149c39870`. Vec3 읽기 함수 `0x141685a00`(블록 컴포넌트에 쓰이는지는 미확정).
- 코드 읽기는 범위 밖 값을 내용 로그에만 쓰고 박스를 저장하는 것이었으나 측정에서는 블록 정의가 거부됐다. 이 거부를 하는 코드의 주소는 찾지 못했다.
- 크래시 오프셋 `0x2680991`은 월드 시작 쪽 함수 `0x142680900` 안의 가상 호출 반환값 null 참조로 읽혔고 박스 값을 읽는 코드가 아니다.

## `query.is_on_screen`과 `q.distance_from_camera`

짝: `docs/rendering/render-controllers.mdx`, `docs/rendering/particles.mdx`, `docs/design/json-ui-claims.mdx`.

- `is_on_screen` 값 읽기 `0x142cbff40`(액터 바이트 `+0x376`). 값 쓰기는 `DataDrivenRenderer` 가상 함수 `0x145987cb0`(가상 표 `0x14f26c680`, 슬롯 주소 `0x14f26c820`)이고 호출자는 찾지 못했다.
- `distance_from_camera` 쿼리 본체 `0x142cbfa80`(컨텍스트 float `+0x100`). 파티클 이미터 생성 `0x146b59000`, 갱신 `0x146b48e00`을 이미터 갱신 `0x146b47d90`이 `0x146b47ee2`에서 먼저 부른다. 만료 검사 컴포넌트 `0x14bf405b0`은 `0x146b488af` 근처 파티클 루프에서 이미터 `+0xd8` 컨텍스트로 불린다. 이미터 `+0x570` 객체(기준점)의 정체는 미확정이다. 액터 쪽 값은 `0x145987cb0`이 렌더 상태 객체 `+0x188`에 쓴다.

## 명령 자동완성 숨김

짝: `docs/content/functions-and-commands.mdx` 7.1과 7.2.

- 판정 함수 `0x1455b9f50`(서명 권한 `+0x70`, 플래그 `+0x7c`). 자동완성 이름 목록 `0x1455ba2b0`(레지스트리 `+0x1b0` 서명 맵), `/help` 실행 `0x148575130`과 목록 `0x1455b9ca0`, `0x1455c3350`. 호출 사슬 `0x144e104a0`에서 `0x1455bfe10`과 `0x1455c41e0`. 인수와 블록 상태 완성 `0x1455c02d0`, `0x1455ba910`. 같은 비트 변환의 인라인 복사본 `0x1455c02d0`, `0x1455c43f0`. 실행 게이트 `0x145560ea0`. 권한 그룹 검사 `0x1455c3f80`(내용 미확인).
- 등록 함수 `0x1455aaab0`가 `0x1455aad1c` 이하에서 항목 번호 4의 토글 값을 읽고 참이면 `0x1455aae0b`에서 플래그 `0xe`를 지운다. 토글 등록 `0x14132bbd0`(60개, 번호 4 호출 `0x14132cf72`), 토글 생성 `0x1413389a0`, 초기화 `0x141338310`(`feature_options.txt` 상수 `0x14f524a94`).

## 개발 옵션 저장 키 비우기

짝: `docs/basics/loading-and-debugging.mdx`의 "개발 옵션과 options.txt".

- 등록 함수 `0x145b0c2c0`은 58개 옵션에서 객체를 만든 직후 저장 키 문자열을 비운다(예: `LOG_TIMESTAMP` id 326은 `0x145b357af`에서 비우고 `0x145b357f2`에서 등록, id 553은 `0x145b3413f`). 쓰기 `0x145b68a10`, 줄 서식 `0x1409c6950`, 읽기 `0x1409c0930`(불리언)과 `0x1409c0990`(문자열)은 키 길이 `+0x198`이 0이면 건너뛴다. 로드 뒤 보정 `0x145b66cc0`(`DEBUG_HUD`가 2이면 0, `0x145b671c8` 이하).
- 처음부터 키가 빈 옵션 37개는 템플릿 `0x145bc0360`(10개)과 생성자 `0x1409be250`에 빈 문자열 주소를 넘기는 27개다.
- `dev_file_watcher` 관찰 함수 `0x1400768f0`(가상 표 `0x14f097470`, 설치 `MinecraftGame::_initUser` `0x1408f7e70`). `dev_enable_texture_hot_reloader` 읽는 곳 `0x1408c43d0`, `0x1408fdc30`, `0x140958ee0`, `0x14095a7f0`, `0x1409616f0`, `0x1451cd7d0`와 호출되는 함수 `0x144e2cc50`, `0x144e2d030`. `switch_coin_debug` 쓰기 `0x145b000d0`. 마켓플레이스 스킨 회전 `0x14575cff0`.
- `mc-` 원격 기능 플래그 등록은 `0x14263f5e0`(33개, 보조 `0x142644450`, `0x1426447c0`)과 `0x1426470f0`이 부르는 `0x142646930`(94개).
- 설정 화면 디버그 섹션 변수 `$debug_settings`는 `0x1450e9cd0`의 열여섯째 인자이고 호출자는 `0x1450e95a0`(`0x1450e9748` 이하)이다. 값의 출처 객체는 미확인이다.

## 클라이언트 스크립트 레벨 불리언

짝: `docs/scripting/server-net-and-admin.mdx`의 "JSON UI와의 데이터 전달".

- Level 가상 `0xac8`(슬롯 345)은 가상 표 `0x14f0c59a0`, `0x14f1370e0`, `0x14f2d0770`에서 같은 함수 `0x14232fe10`이다. 이 함수는 레벨 데이터 객체(`0x14232c340`이 돌려줌)의 정수 필드 `+0x3e8`이 1인지 비교하고, 슬롯 346(`0xad0`, `0x14232fe40`)은 2인지 비교한다. 필드는 레벨 데이터 생성자 `0x1410683a0`이 `LevelSettings` `+0x6c`에서 복사한다. StartGame 설정 직렬화 `0x1444fc760`의 "Education Edition Offer"와 같은 자리로 보인다(추론).
- 매니저는 옵션 `0x27e`가 참이 되는 콜백 `0x1465ea960`에서만 만들어지고 생성자 `0x142806440`의 호출자는 이 하나다. 옵션 `0x27e`를 읽는 곳은 `0x14280668a`, `0x1408aba8c`, `0x14658d83f`다. `onClientCreatedLevel` `0x142806600`이 세 조건을 `0x1428066b8` 이하에서 본다.

## 엔티티 컴포넌트 멤버와 description 검증

짝: `docs/content/entities.mdx`의 17절.

- 컴포넌트 구조체는 구조체 이름의 FNV-1a 32 해시를 즉시값으로 가진 함수에서 찾고, 멤버 이름 문자열을 LEA하는 작은 함수가 멤버 정의 함수다. 같은 이름을 LEA하는 큰 함수가 스키마 문서 생성 함수이고 숫자와 불리언 기본값을 읽을 수 있다. 이름이 8바이트 이하면 즉시값으로 쪼개져 문자열 검색에 안 잡힌다.
- 버전별 컴포넌트 등록 함수: 1.21.100 `0x145f5b310`, 1.21.110 `0x148d6fe40`, 1.21.120 `0x14915bdd0`, 1.26.0 `0x149edf260`, 1.26.10 `0x14963cea0`, 1.26.20 `0x14ad87240`, 1.26.30 `0x14ae7e3a0`, 1.26.40 `0x149726cb0`, 1.26.50 `0x148e09f00`, 1.26.60 `0x148fe3810`, 구버전 `0x141dc6ac0`. 버전은 구조체 이름 투표로 정한 추정이다.
- 멤버 정의 함수: `minecraft:behavior.panic` `0x149503950`, `minecraft:rideable` `0x149503e70`(생성 `0x14aff8e60`), `minecraft:teleport` `0x14950c680`(생성 `0x14b00dcc0`), `minecraft:trail` `0x14950d0f0`, `movement.fly` `0x149502ce0`, `movement.glide` `0x149503560`, `minecraft:healable` `0x1494ff540`, `dash_action` 생성 `0x14af98940`, `buoyant` 생성 `0x146aaf560`, `economy_trade_table` `0x1494fb240`(생성 `0x14af9a770`), `shareables` `0x14950c020`, `timer` `0x14950cc70`, `transformation` `0x14950ece0`, `AngerLevel`(1.26.50) 등록 `0x148e09f00`, `Projectile`(1.26.50) `0x148fc6bb0`. `leashable` 기본값 `0x143c8d020`. 구버전 목표 읽기 `0x147c0dd00`(키 조회 `0x14e933ea0`).
- buoyant 고쳐 읽기 문장 위치 `0x14f818975`, `0x14f816025`(함수 `0x146abca30`), `0x14f818f53`, `0x14f815d41`(`0x146abcb80`), `0x14f818f93`(`0x146abcbf0`).
- Brain 컴포넌트 25개는 위 등록 함수들의 `memory_behavior.*`, `memory_sensor.*` 이름이다. 센서 항목 구조체는 `SharedTypes::v1_26_xx::Brain::MemorySensors::*SensorEntryDefinition`이다.
- 같은 컴포넌트 두 버전 충돌 문장 `0x14f7e8b0f`, 검사 함수 `0x1417149e0`, `0x141714ba0`, 생성자 `0x141714750`. 베타 format 문장 `0x14f81026a`, `0x14f7f4640`. 문서 구조체 `Beta::ActorDefinitions` `0x14925cdc0`, `Beta::ActorDocument` `0x1492479b0`. 최상위 `upgrades`는 v1_26_30 문서 구조체 `0x14aea5e70`에 있고 v1_26_20 `0x14ada0630`에는 없다.
- description 읽기 구간은 함수 경계 정보가 없는 `0x1436cb000`에서 `0x1436d1800`이다. `spawn_category` `0x1436cfa60`, `entity_version` 이름 `0x1436cfded`, `aliases` 이름 `0x1436cd160`, 별칭 문장 `0x14f516179`, 업그레이드 문장 `0x1436d0695`에서 `0x1436d1974`.
- 속성 읽기 `0x142be75b0`. 이름 검사 문장 `0x14f5eac68`, `missing a 'default'` `0x14f5c0378`, 형 일치 `0x14f83bffc`, `type` 값 `0x14f81f72e`, `client_sync` `0x14f82214e`(함수 `0x142be6ad0`), 범위 밖 `default` `0x14f5bfebf`(정수 `0x142be91b0`, 실수 `0x142be93b0`), Molang 문자열 경로 `0x142be8cf0`, enum 개수 `0x142be9b90`, enum 값 문장 `0x14f54ca9a`. 측정에서 개수 한도 32가 나왔으나 개수를 검사하는 코드는 이 함수 안에서 찾지 못했다.

## 루트 테이블, 레시피, 거래, 스폰 규칙, 피처, 차원

짝: `docs/content/loot-and-trading.mdx`의 5절, `docs/content/recipes.mdx`, `docs/content/biomes-and-dimensions.mdx`, `docs/content/worldgen-and-features.mdx`.

- 루트 함수 레지스트리 `0x1455597b0`(정적 표 `0x1529c9c60`, `0x1529c9ca0`). 함수 목록 파서 `0x1455541f0`(실험 게이트와 네임스페이스 자르기), 풀과 엔트리 파서 `0x14554d2f0`, 테이블 로더 `0x145548830`. 함수 팩토리는 `set_count` `0x145555380`, `set_data`와 `random_aux_value` `0x145555410`, `enchant_book_for_trading` `0x145555770`, `exploration_map` `0x145556cb0`, `set_stew_effect` `0x145557770`, `set_ominous_bottle_amplifier` `0x145557800`, `carry_over_block_entity_data` `0x1455579b0`.
- 루트 조건 파서 `0x14bc52ef0`(`operator`), 목록 `0x14bc54b00`. 조건 팩토리는 `damaged_by_entity` `0x147bd2b70`, `passenger_of_entity` `0x147bd59b0`, `is_baby` `0x147bd33c0`, `has_property` `0x147bd30e0`, `bool_property` `0x147bd6570`, `int_property` `0x147bd5f20`, `float_property` `0x147bd6270`, `enum_property` `0x147bd6870`, `biome_has_tag` `0x14bc52bf0`, `random_chance` `0x147bd6cd0`, `match_tool` `0x147bd4250`.
- 레시피 종류 이름 표 `0x14f1a7b70`이 있는 함수 `0x1436468e0`, 스미딩 변환과 재료 감소 `0x143689b10`, 재료 서술자 `0x143686fa0`, 해금 `0x143688e80`, 모양 레시피 추가 `0x143690970`. `minecraft:transform_materials` 정적 변수 `0x1528c6e88`(초기화 `0x1402ef5a0`), 태그 레지스트리 `0x1447447e0`.
- 거래 테이블 파서 `0x1432a6fc0`(테이블), `0x1432a5b70`(거래), `0x1432e0c70`(거래 아이템), `0x1432dfe20`(`choice`), `0x1432ddcc0`(`filters`, `functions`), 변환 `0x1432e27d0`, `0x1432e0f40`, `0x1432e2e00`, `0x1432e3e20`.
- 스폰 규칙 레거시 파서 `0x142d9e820`, 조건 구성요소 `0x142da78c0`과 `0x142c49e00`, 단순 형식 스키마 `0x14980cb40`, 레거시 형식 스키마 `0x149c6cd40`, `placement` 검증 `0x142f24e70`.
- 피처 규칙 스키마 `0x1492d87f0`, 검증 `0x14a2ab710`. 사용 불가로 적힌 네 피처의 코드: `conditional_list_feature` 배치 `0x14a2b90e0`와 스키마 `0x14a2b9740`, scan_surface `0x14a257a00`, rect_layout `0x14a252380`, beards_and_shavers `0x14a2b35d0`. 피처 이름 표 후보 `0x14721e4d0`(약 256KB, 디컴파일 시간 초과).
- 바이옴 경고 `0x1471afe10`(multinoise), `0x1471b0a30`(overworld), 호출 `0x1471b0000`. `replace_biomes` 스키마 `0x14962d150`, 검사 `0x1471b1320`.
- 차원 스키마 `0x148fd8fd0`(옛 스키마 `0x149809260`), 검증 `0x142957ef0`, 높이 서식 `0x142958710`. 측정에서는 스키마 범위 [16, 1024]가 먼저 걸렸고 `min_y` 16의 배수 검사와 `minecraft` 네임스페이스 거부 문장이 나왔다.

## 화면 전용 변수와 바인딩 이름

짝: `docs/json-ui/files-and-definitions.mdx`의 1.11절, `docs/json-ui/bindings.mdx`의 4.11절.

- 화면 변수 맵 함수: 일시정지 `0x1428a9190`, 컨테이너 계열 `0x1450099e0`(가상 함수 표 13곳), 데이터 구동 컨테이너 추정 `0x147475750`, 상자 `0x14708e8b0`와 `0x1470ad490`, 인벤토리 `0x145027c50`와 `0x147085cb0`, 거래 `0x145249960`와 `0x145244ea0`, 대장장이 `0x147099840`, 베틀과 석재 절단기 `0x147093580`와 `0x14709caf0`, 채팅 화면 `0x144ff5490`, 책 `0x144ce6000`, 표지판 `0x144f0b100`, 칠판 `0x144fe7e20`, 모달 `0x145250e80`, 사진첩 `0x1428cbad0`, 진행 화면 `0x1428d2670`와 `0x1450b3410`, 서버 추가 `0x144ce00f0`, 월드 템플릿 `0x145282f00`, HUD 폭 `0x144b5b130`, 스크린샷 번쩍임 `0x1450d7fe0`, 팝업 `0x145240580`.
- HUD 팩토리 변수 함수: 제목, 부제목, 아이템 이름 `0x144b5eb40`, 액션바 `0x144b6ed20`, 채팅 항목 `0x140682580`, 자막 `0x144b75030`, 자막 위치 `0x144b63a70`, 콘텐츠 로그 `0x145010e20`, 게임 팁 `0x1451c2820`, 토스트 `0x145240840`와 `0x145028360`, 분할 화면 참가 `0x14523fe40`. 변경 알림 `0x141c9dea0`. JSON 값 생성자: 정수 `0x14e932570`, 불리언 `0x14e932780`, 문자열 `0x14e9326a0`, 객체 `0x14e932460`. `$container_title`과 `$actionbar_text` 객체는 컨테이너 계열 함수 `0x1450099e0`과 액션바 함수 `0x144b6ed20`이 만들고, 속성값 해석 함수 `0x1400f3d10`이 푼다(아래 "바인딩 적용과 화면 변수 객체").
- 서버 폼 컨트롤러 생성자 `0x1450dd6b0`(바인딩 12개 등록), 커스텀 폼 `0x145497a00`, NPC `0x142896b80`. 서버 폼 가상 함수 표 `0x14f22d1b0`, 채팅 `0x14f21c860`.
- 바인딩 응답: 기반 전역 `0x144b49880`, 기반 컬렉션 `0x144b692f0`, HUD 전역 `0x144b69300`, HUD 컬렉션 `0x144b648a0`, 게임 이벤트 `0x144b6ea20`. 값 저장 함수: 불리언 `0x14050aba0`, 정수 `0x1405b3c00`, 실수 `0x1405b3d70`, 문자열 `0x1405b38c0`. 컨트롤 속성 대상 `0x141919fb0`.
- 이름 해시는 FNV-1a 32(오프셋 `0x811C9DC5`, 소수 `0x01000193`)이고 `#`를 포함해 계산한다. 풀린 숨은 이름의 해시: `#vr` `0x4538cf3a`, `#is_riding` `0x7263217a`, `#show_cursor` `0x23e4d0da`, `#inventory_button_enabled` `0x45d6c675`, `#shield_is_active` `0x1b88726f`, `#show_item_pickup` `0x61003c94`, `#editor_chat_visible` `0x01d9c3db`, `#editor_chat_offset` `0x5933e5ac`, `#editor_chat_layout_active` `0x8930bce0`, `#is_realm_level` `0x0ac12133`. 식별자 조각 조합으로 찾은 이름: `#descend_description` `0x99ab4661`(HUD 전역 문자열, case 몸체 `0x144b6d8c0`가 `hudScreen.tooltip.scaffoldingDescend`를 씀), `#is_not_riding` `0xf4a535a4`(HUD 전역, `#is_riding`과 같은 탈것 질의 `0x144d56210`의 결과를 뒤집음), 이 둘은 case 코드와 이름이 맞는다. `#controller_select_icon` `0x1712dc81`(기반 문자열), `right_helper_collection` `0x414b5d8f`, `left_helper_collection` `0xae68bf86`(HUD 컬렉션 이름)은 이웃 이름 문맥으로 받아들였다. 보류 `0x82c8b5c6`(상수 거짓, 후보 `#vr_riding`, `#unlocking_compost`), 버림 `0xbae00f52`(불리언 `0x144b6d020`), `0x9d8ad1a5`. 남은 해시는 `0x82c8b5c6`, `0xbae00f52`, `0x9d8ad1a5`, `0x242d2dc1`(배열 {1, 10}), `0x26738120`(필드 `+0x10e8`, `#show_cursor` 옆), `0xb1f98a12`, `0xd833a7ef`(상수 거짓), `0x37987a59`, `0xe421a2ac`(컬렉션), `0xc9fa6f37`(기반 불리언) 10개다. 사전은 실행 파일 식별자 문자열을 `.`, `:`로 자르고 snake_case로 바꾼 낱말 54,069개(토큰 15,941개)와 en_US.lang 키 조각이고, 토큰 2개 조합은 전수, 3개 조합은 상위 1,000개를 시험했다. 우연 일치 기대값은 2개 조합에서 약 2개, 3개 조합에서 약 7개다.
- 설치본 바닐라 UI는 `data\resource_packs\vanilla\__brarchive\ui.brarchive`(183개 파일)이다.

## 바인딩 적용과 화면 변수 객체

짝: `docs/json-ui/bindings.mdx`의 4.11절, 4.12절, BND-09, BND-26, BND-27, BND-28, `docs/json-ui/screen-hosts-and-data.mdx`의 HOST-19, HOST-28, HOST-48, `docs/json-ui/files-and-definitions.mdx`의 FILE-28, FILE-39, FILE-44, FILE-48, 1.11절, `docs/json-ui/expressions.mdx`의 EXP-57.

- JSON 값의 형 바이트(값 `+8`): 0 null, 1 int, 2 uint, 3 real, 4 string, 5 bool, 6 array, 7 object(`0x14e9334f0`, `0x14e933500`, `0x14e933510`, `0x14e933520`, `0x14e933590`, `0x14e9335b0`).
- 바인딩 갱신 루프 `0x141919b40`: 종류 1(global)은 컨트롤러 가상 함수 표 `+0x90`, 종류 2(collection)는 `+0x98`을 부르고 돌려받은 참 거짓을 버린다(`0x141919ca8`의 호출 뒤 `0x141919e80`으로 가서 적용 함수를 부름). 식 평가는 종류 4(view)만 하고 `0x141919d20` 이후에 있다. 항목은 배열 순서대로 돈다.
- 적용 함수 `0x141919fb0`: 주머니가 객체이면 대상 이름 키를 꺼내고 아니면 null, 대상 이름 해시로 case를 고른다. 엔진 속성 case가 없는 이름은 끝 레이블로 간다. `#visible` `0x5a338454`는 불리언 읽기 `0x14191ef70`를 기본값 1로 부르고, 이 읽기는 형 바이트가 5일 때만 값을 쓴다. `#enabled` `0xa79a3c9f`와 `#focus_enabled` `0x259d4320` 기본 참, `#focus_wrap_enabled` `0x3013bf4d` 기본 참(포커스 부품이 있는 컨트롤만). 기본값 0인 불리언 case `0xc3987d4b`, `0xd22661b9`, `0x1c8f8e00`. case `0x291b1ee6`는 기본값으로 지금 값을 넘긴다. 기반 전역 `0x144b49880`는 끝에서 등록 맵, 하위 컨트롤러에 차례로 묻고 거짓을 돌려줄 뿐 주머니에 쓰지 않는다.
- 화면 변수 객체를 푸는 곳은 속성값 해석 `0x1400f3d10` 하나다. 정의 속성 공통 읽기 `0x1400f0fa0`(속성 형별 읽기 229곳이 부름)도 같은 몸체로 들어간다. 값이 `$`로 시작하면 변수 조회 `0x1400e4de0`, 결과 객체의 `__string`이 참이면 `value`로 바꾸고 `__rawtext`가 참이면 식 평가 허용을 끈다. 그 뒤 `(`로 시작하는 문자열은 상수식으로 계산한다. `__string`, `__rawtext` 문자열을 쓰는 코드는 이 셋뿐이다.
- 식 쪽: 식 파서 `0x1400eb2b0`는 식 안의 `$이름`을 `0x1400e4de0`로 바로 조회해 객체를 그대로 둔다(토큰 형 5). `=`는 `0x1400e74a0` case 5. 복사 쪽: 정의 처리 `0x1400ee590`가 `$` 키 이름을 모으고(`0x1400f37b0`) 키마다 람다 `0x140133190`가 `0x1400f0fa0`로 읽어 지역 스코프에 넣는다. `variables` 적용 `0x1400f8a80`(Android `0x09844f5c`도 같음)은 `$`로 시작하는 값마다 `0x1400f3d10`을 부르고 `requires`를 강제 평가해 null이면 건너뛴다(`0x1400ee590` 231~256행). `factory_variables`는 팩토리 해석 `0x141c8ca00`가 풀지 않는 해석 `0x1400f3190`을 쓴다. `property_bag`과 `property_bag_for_children`는 `0x141c84d80`에서 `0x1400f7d90`로 읽고 멤버마다 `0x1400f3d10`을 부른다.
- HUD 필터 플래그 `+0x1116`: HUD 생성자로 보이는 `0x144b4b9a0`가 `0x142683020`의 결과를 넣고(`0x144b4fd3f`) 변경 콜백을 등록한다(`0x142682d30`, 람다 함수 표 `0x14f201de0`, 호출 칸 `0x144bd2000`). 콜백은 `+0x1116`에 쓰고 `+0x1115`를 1로 둔다. `0x142683020`는 HUD `+0xd48` 객체의 하위 구조에서 `+0x19`, `+0x1a` 두 바이트를 AND하고, `0x142682d30`는 같은 구조의 신호 목록 `+0x178`에 콜백을 넣는다. 읽는 곳: 제목 팩토리 `0x144b5eb40`(3곳), 액션바 `0x144b6ed20`, HUD 전역 `0x144b69300`(`#hud_subtitle_text_string` case `0x8c0610a2` 등 2곳), HUD 컬렉션 `0x144b648a0`, `0x144b704f0`. 플래그가 1이면 두 문자열 고르기 `0x14015ffc0`(첫 인자의 `+0x20` 바이트가 "값 있음"). 부제목 원문 `+0x1000`, 선택적 문자열 `+0x1020`. 문자열 `Filtered Title Message`(`0x1444d2440`, `0x1444d5720`), `Filtered Message`(`0x1429c7560`, `0x143d67710`), `isFilteringProfanity`, `New filter profanity value`. 같은 getter를 쓰는 곳: 책 `0x144ce3790`, 채팅 컨트롤러 생성자 `0x144fea000`, `0x14709dc10`, `0x147469820`, `0x147472770`, `0x147475b50`(`+0xdf1`에 저장). 문자열과 플래그를 직접 잇는 코드는 찾지 못했다.
- 채팅 `+0xdb3`: 생성자 `0x144fea000`가 네 번째 인자를 그대로 넣는다. `chat.chat_screen`(`0x140536400`, `0x140537060`)은 0, `dev_console.dev_console_screen`(`0x1409b8ba0`는 직접 1, `0x140538a60`는 1을 담은 바이트의 주소)은 1을 넘긴다. `$max_text_edit_length`는 `0x144ff5490`. 다른 `+0xdb3` 쓰기 `0x144bf2c30`, `0x144b8ff90`은 다른 클래스로 보인다(추론).

## 레이아웃, 입력, 컨트롤 생성

짝: `docs/json-ui/controls-and-layout.mdx`, `docs/json-ui/images-and-animation.mdx`, `docs/json-ui/files-and-definitions.mdx`의 FILE-39.

- 크기 문자열 파서 `0x141911f80`(`%` 다음 토큰만 수식자), 크기 항 `0x14050ecb0`(case 5, 6 `%c` 합, case 7~10 `%cm`, `%sm` 계수 버림), 그리드 크기 `0x140513350` 2792~2933행(차원 x 템플릿), 스택 진행 축 1878~1977행과 2579~2669행. 숨은 자식 크기 노드 0 `0x141c680d0`, `0x140509b40`. use_priority `0x14050ad30` case 0x14와 `0x140587550`, 그리드 세로 재조정 case 0x11.
- `inherit_max_sibling_width`/`_height` 해석 `0x141c938b0`(문자열 참조 `0x141c943b9`), 지연 작업 `0x14051b580` 107~272행, `0x1405911a0`. 레이아웃 플래그 0x20과 0x40.
- `screen_not_flushable` 해석 `0x141c7415d`, getter `0x144cd2500`(ScreenView 가상 함수 표 `0x14f210c40`의 `+0x148`, 항목 `0x14f210d88`). 이 슬롯을 부르는 쪽은 찾지 못했다.
- `always_listen_to_input` 해석 `0x141c91e20`(문자열 참조 `0x141c93158`), 입력 목록 등록 `0x144cc1cd0`(참이면 `+0x100`, 아니면 `+0x70`), `0x14192c790`, `0x144cbc150`.
- 글 크기: 그리기 요청 `0x141c4c1e0`, `font_size` 표 `0x14f110280`(0.5, 1.0, 2.0, 4.0), flush 변환 `0x146c0c220` 257행, 줄 너비와 줄 간격 `0x140e6ba60`, `0x146c06f90`.
- 휠: 스크롤 뷰 `0x141c3bf70` 698~706행(`-scroll_speed`를 정적 변수 `0x1529411b4`에 처음 한 번 저장), ScreenView `+0xd8` 슬롯 `0x144cd0520` 272~276행, 이벤트 생성 `0x144cba660`, `vertical_scroll_delta` getter `0x144cd25f0`(`+0x190`, 기본 20.0, int로 자름). 휠 입력에서 id 2 호출까지의 경로는 찾지 못했다. 스크롤 박스 `0x141c3b050`, `0x141c3b910`.
- 컨트롤 생성 `0x141c7ea10` 116~120행과 249~301행(`controls` 문자열 `0x14f55205c`, 정의 풀기 `0x1400f2310`, 이름 비교 없음), 자식 붙이기 `0x141c68fa0`(모드 1이면 `+0x98` 끝에 push_back). 이름 찾기 요청 등록 `0x141c6a0b0`, `0x141c69e60`(항목 0x68바이트), 버튼 해석 `0x141c85bb0` 211~270행. 요청을 처리하는 찾기 함수는 찾지 못했다. `destroy_at_end` `0x141c64790`.
- 적용 함수 `0x141919fb0`의 배치 키: `#alpha` `0x46c12dca`(실수 읽기 `0x141914d40`, 컨트롤 `+0x60`, 750~760행), `#clip_ratio` `0x21592b48`(`0x14191fb50` 기본 0.0, [0, 1]로 자름, 이미지 `+0x1dc`, 분기 `0x14191b569`, `0x14191c5be`~`0x14191c61c`, 상수 1.0 `0x14eec9060`), `#size_binding_x`/`_y` `0x3c7cd832`/`0x3d7cd9c5`(1053~1090행, `0x141913060`, `0x141913140`, `0x141914f60`, `0x141915250`), `_absolute` `0xf8a28f2a`/`0x8feb27ef`(944~959행), `#anchored_offset_value_x`/`_y` `0xd79dd4c9`/`0xd69dd336`(`0x141914740`), `#anchored_offset_value_x_absolute` `0xb0b2801b`는 분기에 없음, `#offset` `0x1a8939d5`(983~1006행, 배열이면 `0x14191fe40`, `0x141912f70`).
- 그리기 순서: 레이어 정렬 `0x144cf04d0`, `0x144ca63f0` 134~156행, 절대 레이어 `0x144cbfe20`. `clip` 애니메이션 `0x141c88360`, 플립북 `0x141c5ea10`, Aseprite `frames` 읽기 `0x1400ed150` 590~620행.
