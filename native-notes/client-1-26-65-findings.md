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

## 블록과 아이템 컴포넌트

짝: `docs/content/blocks.mdx`의 "format_version"과 "충돌/선택 박스", `docs/content/items.mdx`의 "개념".

- 블록 컴포넌트 스키마(`BlockDefinition::BlockComponents`) 함수 `0x149515ae0`(55766바이트). 새 이름 세 개의 위치: `minecraft:enchantment_power_transmitter` 제목 `0x1486e2000`, `minecraft:neighbor_change` 스키마 `0x1486e3d50`과 방향 열거형 `0x1486e25a0`. `vibration_properties`와 비슷한 이름 `can_dampen_vibrations`, `can_occlude_vibrations`는 별개 키로 `internal_vanilla_data`(`0x149934300`, `0x1431b9450`)에서 읽는다. 스크립트 쪽 `BlockVibrationPropertiesComponent` 이름 문자열은 `0x14c8541d0`에 있다. "experimental creator features" 게이트는 `0x14328a950` 계열이다.
- 조합 제약 구조체 형식 정보 함수 7개: `0x14952f7a0`, `0x14952fd20`, `0x149530200`, `0x149530730`, `0x149530af0`, `0x149530ef0`, `0x149532e10`. 검사 문장 위치: `NoRandomOffsetIfUnitBlock` `0x14f535603`(사용 `0x1431cb720`), `NoRedstoneConsumerIfProducer` `0x14f545f2a`, `NoCollisionSnowLog` `0x14f5b3929`와 `0x14f5f9d9f`(사용 `0x14952fdc0`, `0x14996a030`), `CrossComponentsConstraint` `0x14f541a11`(사용 `0x1431e7a60`), `RandomOffsetInBound` `0x14f50fc0c`에서 `0x14f50fdbf`(사용 `0x14952ebb0`), `MultipleBoundingBox` `0x14f50ff9a`와 `0x14f50fff2`(사용 `0x14994bac0`, `0x14996ffb0`, `0x14994b3b0`, `0x14994b910`). 충돌 상자 하한 Vec3 (-8, 0, -8)은 코드 상수로 보인다. 상한 값은 호출 쪽 인자로 넘어와 읽지 못했다. `min`/`max` 형태의 실험 문구는 같은 함수군의 문자열이다.
- 아이템 컴포넌트 맵을 만드는 함수 `0x1447e0720`(77547바이트, 얇은 중계 `0x1447e0680`, `0x1447fbd20`). 맵은 인자 `this`의 `+0x278`에 있는 `std::map<std::string, 16바이트 값>`이다. 삽입 `0x1449036a0`. 아이콘 없음 로그 `0x1447f0b2f`. 이름 44개는 직선 코드로 풀어 쓰여 있고 입력 키를 순회하지 않는다. 스키마 레지스트리는 `0x1447fbd70`(이름 53개). `fuel` 관련 읽기 `0x1447f2bb7`.

## 클라이언트 스크립트 엔진과 숨은 옵션

짝: `docs/scripting/server-net-and-admin.mdx`의 "JSON UI -> 스크립트 채널 없음".

- 옵션 `options.hidden.enable_client_script`는 옵션 id `0x27e`(638), 열거 이름 `ENABLE_CLIENT_SCRIPT`다. 등록 위치 `0x145b3d0e2`에서 `0x145b3d106`이 표시 이름만 받는 불리언 템플릿 `0x145bc0360`을 부른다. 이 템플릿은 옵션 생성자 `0x1409be250`에 표시 이름을 넘기고 저장 키 칸에는 빈 문자열 상수 `0x14f278ed0`를 넘긴다. 같은 템플릿을 쓰는 옵션은 열 개다(`options.dev_disableRenderTerrain`, `_Sky`, `_Weather`, `_Hud`, `_ItemInHand`, `options.dev_renderBoundingBox`, `_renderPaths`, `_renderSensorState`, `options.multiplayergame`, 이 옵션). 일반 옵션은 `0x145bbf8b0`으로 표시 이름과 저장 키를 둘 다 넘긴다. options.txt를 쓰는 함수 `0x145b68a10`은 저장 키 길이(`+0x198`)가 0인 옵션을 건너뛴다. 줄을 만드는 함수 `0x1409c16b0`, 서식 함수 `0x1409c6950`.
- 옵션 레지스트리 생성자 `0x145b0aba0`(가상 표 `0x14f278f10`)가 등록 함수 `0x145b0c2c0`을 한 번 부른다. 슬롯은 825칸이고 등록 가상 함수는 `0x145af8ba0`이다. 옵션 열거 이름 표는 826개(id 825는 `COUNT`)이고 rdata `0x14f292a70`부터 16바이트 간격이다. 등록 함수 안에서 등록되는 옵션이 484개이고 341개는 이 exe에서 등록 코드를 못 찾았다. 등록 지점이 따로 다섯 곳 있고 읽지 않았다(`0x1413389a0`, `0x14263f5e0`, `0x142644450`, `0x142646930`, `0x1426447c0`). `0x14263f5e0`는 `mc-` 원격 기능 플래그 이름을 만든다.
- 옵션 객체는 0x58바이트이고 `+8`이 0x2a0바이트 내부 구조체를 가리킨다. 내부 구조체의 `+0x1cc` id, `+0x1d0` 등록 인자, `+0x1d8` 표시 이름, `+0x188` 저장 키다(생성자 `0x1409be330`). 파생 생성자 `0x1409c3160`, `0x1409c1ed0`, `0x1409c45d0`, `0x1409c5050`, `0x1409c57f0`, 열거형 정수 옵션 `0x1409c4de0`, `0x145bc0640`, `0x145bbf000`.
- 클라이언트 스크립트 매니저 생성자 `0x142806440`(세 번째 인자 불리언을 `+0x20`에 저장, 호출자는 `0x1465eaab9` 하나). 그 호출을 감싼 함수 `0x1465ea960`은 옵션 값 노드의 바이트 `+0x10`을 읽어 1이면 매니저가 없을 때 만들고 아니면 지운다. 그러므로 매니저는 시작 때가 아니라 옵션 변경 콜백에서 만들어진다. `onClientCreatedLevel` 처리 `0x142806600`(가상 표 포인터 `0x14f149bb0`)에는 Beta APIs와 Upcoming Creator Features를 켠 월드에서도 진입 훅이 한 번도 호출되지 않았다. 게임 초기화 `0x14658ce30`은 옵션 `0x27e`를 읽어 변경 관찰자를 등록한다(`0x14658d83f`). 클라이언트 인스턴스 쪽 `0x1408ab820`도 같은 세 조건을 조합한다(옵션 읽기 `0x1408aba8c`).
- 엔진 조건 읽기: 클라이언트 인스턴스 가상 함수 `+0x970`의 불리언이 매니저 불리언(`+0x20`)과 같아야 계속한다. 레벨 설정 구조체는 Level 가상 함수 `+0x568`의 반환값(그 `+0x160`이 가리키는 정수)이고 비트 1을 본다. 레벨 불리언은 Level 가상 함수 `+0xac8`(슬롯 345)이다. 모듈 레지스트리에 `@minecraft/client` 팩토리를 등록하는 곳은 `0x147bf3a50`이다. 팩 스택은 클라이언트 인스턴스 가상 함수 `+0x2f0`가 돌려주는 객체의 `+0x130` 또는 `+0x148`(레벨 불리언이 거짓이면 앞, 참이면 뒤, `0x1428069a5`, `0x1428069ae`)이다. 발견 함수 `0x1468d31e0`을 `0x142806a86`에서 인자 4(`client_script`)로 부른다. `scripts/` 접두 상수는 `0x1428069cd`.
- 클라이언트 스크립트 API 바인딩: 모듈 바인딩 `0x141638290`, 호출하는 함수 `0x141608da0`, `0x14160cdd0`. `client` `0x1416391ab`, `Client` `0x1416383c0`, `Client.events` `0x1416385a0`(반환 클래스 `Events`, `0x141608dfa`), `messageReceive` 신호(타입 이름 `MessageReceiveEventSignal_deprecated`, `0x141608fc9`, `0x141608fda`, rdata `0x14f5f5132`, `0x14f5f5142`), `subscribe` `0x14160983a`, `unsubscribe` `0x14160a16f`, `postServerMessage` `0x1416388a3`, `0x1416387e8`, 이벤트 클래스 `MessageEvent` `0x14160ce14`(`id` `0x14160cfd3`, `message` rdata `0x14f5e305c`). `ScriptMessagePacket`은 id `0xB1`, 직렬화 설명 `0x1443aac40`(문자열 `0x14f53fbee`, 필드 `Message Id` `0x14f605f4c`, `Message Value` `0x14f5c0862`, 페이로드 `ScriptMessagePacketPayload` `0x14f60061e`). `postServerMessage`의 송신 지점은 추적하지 않았다.
- 옵션 `dev_file_watcher`(id 53, 기본 켜짐)와 `dev_enable_texture_hot_reloader`(id 558, 기본 꺼짐)는 등록 함수 `0x145b0c2c0`에서 등록되고 두 `options.txt`에 키가 있다. 소비 코드는 읽지 않았다. `dev_*` 키가 있는 옵션 약 60개는 `options.txt`에 쓰이지 않았고 이유를 못 찾았다. 옵션 `options.dev_enableOreUIEditWorldPreviewButton`은 id 553이 이 문자열을 저장 키 칸에 넣어 등록한다.
- 열거 이름 표 중 등록 코드가 없는 묶음: 렌더링 조정값 id 54에서 245와 250, 자동화와 시험 장비 id 436에서 470 등, 화면 재정의 `DEV_NEW_*_SCREEN_OVERRIDE`와 `NEW_*_SCREEN_BETA` id 583에서 592, 595, 596, Ore UI 개발 옵션 id 593과 816에서 820, `SCRIPT_FACET`에서 `CUSTOM_TOUCH_ZONE` id 639에서 643.
- 실측 중 크래시 한 번: `Minecraft.Windows.exe` 예외 `0xc0000005`, 오류 오프셋 `0x2680991`(VA `0x142680991`). 직접 읽은 명령은 `mov rcx,[rax+0x200]` 직전의 가상 호출 반환이 null인 경로다. 호출자는 읽지 않았고 팩 구성 때문인지 타이밍 때문인지 가르지 못했다.

## Ore UI 선택기 조건

짝: `docs/ore-ui/overview.mdx` "화면 선택과 문자열".

- 12개 `register*Screen` 함수는 초기화 함수 `0x14010dda0`에 인라인돼 있다(설정 화면만 `0x14011dec0`으로 분리). 게임 초기화 `0x14658ce30`이 `0x146590955`에서 한 번 부른다. 인자 `p3`은 `0x1465908e9`, `0x1465908ff`, `0x14659091b`에서 채워진다(객체 가상 `0x500`, `[+0x1c8]` 객체의 가상 `0x700`). 경로마다 기록에 함수 A는 `+0x10`, 함수 B는 `+0x50`이다. 조회 핸들러 `getTechStackForScreen` `0x14c18b940`, 선택 핸들러 `0x14c18b930`, 보조 옵션 조회 `0x14010d6c0`.
- 조건 함수 몸체(`std::function` 호출 슬롯): `0x14efcc3e0`에서 `0x14efcc820`. 서비스 질의를 하는 함수 `0x14011d900`(서비스 객체 전역 `0x1528c2a68`, 인자 2), `/player-permissions`의 B `0x14011dc10`(전역 서비스 `0x1528c2508`), `/send-invites` `0x14011dde0`, `/oreui-marketplace/search`의 A `0x14011e900`(전역 인자 `0x1528c2ae0`), 설정 화면 경로 비교 `0x14011e550`.
- opt-in 이름 세 개는 화면 컨트롤러의 가상 표 항목이다: `0x1428fbd90`, `0x1428fbff0`, `0x1452a6cc0`. 컨트롤러 `0x1428c3940`과 `0x1452a5eb0`이 그 표를 만든다.
