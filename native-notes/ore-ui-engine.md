# Ore UI 엔진 발견: 바이너리 세부

`docs/internals/ore-ui-engine-findings.mdx`(영어판 `i18n/en/docusaurus-plugin-content-docs/current/internals/ore-ui-engine-findings.mdx`)에서 옮긴 바이너리 세부다. 공개 페이지에는 동작과 결론만 남겼다. 아래 인용은 옮기기 전 한국어 페이지의 원문이다.

분석 대상: Android 1.26.52.3 arm64 빌드. 주소는 이 빌드의 분석 주소이고 판이 바뀌면 달라진다.

## 머리말

위치: `docs/internals/ore-ui-engine-findings.mdx`, 머리말(검증 수준 문단)

- 원문: "`@0x…`는 Android 1.26.52.3 arm64 빌드의 분석 주소이고 판이 바뀌면 달라진다."

## 0. 한눈에

위치: `docs/internals/ore-ui-engine-findings.mdx`, "0. 한눈에" 절

- 원문: "암호화 팩 접근 전략(`EncryptedFileAccessStrategy` 등)은 **언제나 신뢰된다**."

## NB-17 Ore UI 파일 요청은 신뢰된 팩을 먼저 보고, 없으면 설치 폴더에서 연다

위치: `docs/internals/ore-ui-engine-findings.mdx`, "1. 파일 요청과 팩 조회" 절, NB-17

- 원문: "질문은 "Ore UI를 리소스팩으로 정말 못 바꾸나"였다(2026-10-23 8~10차 분석)."
- 원문: "`@0x09cf635c`가 요청 경로를 `ui://…`로 맞추고, `@0x09cf68d4`가 파일을 찾는다."
- 원문: "팩 스택(0x110바이트 팩 항목)을 돌며, 팩 접근 전략의 가상 함수 +0x30이 참인 팩에서만 `hasResource`(`@0x112ac30c`, 가상 함수 +0x38 = `hasAsset(path,false,false)`)를 본다. +0x30은 `isTrusted()`로 보인다(추론). 없으면 `gui/dist/` 아래를 앱 패키지 파일 시스템에서 연다(`@0x09cf66f8`)."
- 원문: "`hbui/routes.json`(`@0x09cd39dc`)과 `gui/dist/hbui/fonts`(`@0x096de4bc`)는 설치 폴더에서만 읽는다."
- "6.1 리버싱으로만 알게 된 것" 표 R-16의 원문: "신뢰된 팩(`isTrusted`로 보임)만 본다."

## NB-20 암호화 팩 접근 전략은 언제나 신뢰된다

위치: `docs/internals/ore-ui-engine-findings.mdx`, "2. 팩 접근 전략과 신뢰" 절, NB-20

- 원문: "NB-17의 신뢰 검사(+0x30)를 클래스마다 역어셈블했다(11차, `DumpVtables.java`. 분석 주소 = ELF 주소 + 0x100000)."
- 원문: "`ZipPackAccessStrategy`(`@0x1125865c`)는 `위치.파일시스템 == 1`(앱 패키지)이거나 +0x170 플래그일 때, `DirectoryPackAccessStrategy`(`@0x112ee564`)는 `위치.파일시스템 == 1`일 때만 참이다."
- 원문: "`EncryptedFileAccessStrategy`·`ZippedEncryptedFilesAccessStrategy`(`@0x112f456c`)와 `DirectoryPackWithEncryptionAccessStrategy`(`@0x112f0a70`)는 **언제나 참**을 돌려준다."
- 원문(화살표만 문장으로 바꿈): "폴더 팩은 팩 생성 함수(`FUN_1127c5e0`이 `FUN_1128022c`를, 그것이 `FUN_11280ebc`를 부른다)가 키 공급자가 있을 때 `content.zipe`를 찾고, 있으면 `DirectoryPackWithEncryptionAccessStrategy`로 연다(24~27차)."
- 원문: "팩 파일 종류 판정(`FUN_129c3d34`)은 256바이트 미만을 암호화 파일로 보지 않는데"
- 원문: "Zip 팩의 +0x170 플래그는 생성자 `FUN_112569a0`이 인자 구조체 +0x48에서 복사한다. 생성자를 부르는 네 곳이 모두 이 값에 0을 넣으므로, 이 플래그로 신뢰되는 팩은 없다(24차)."
- 원문: "콘텐츠 키는 `ClientContentKeyProvider`가 서버가 보낸 키, 엔타이틀먼트, 내장 표에서만 찾는다. 팩 옆 키 파일이나 월드 db는 보지 않는다(26~27차)."

## NB-18 `vanilla.resourcePackOverrides`: JSON UI 버튼 정의 두 개가 Ore UI로 넘어간다

위치: `docs/internals/ore-ui-engine-findings.mdx`, "3. JSON UI에서 Ore UI로 넘어가는 버튼 정의" 절, NB-18

- 원문: "facet은 `definitions`·`lastUpdated`를 낸다(`@0x09ef8760`)."
- 원문: "엔진이 푸는 정의는 하드코딩된 두 개다(`@0x09ef8a7c`)"

## NB-19 DDUI 레이아웃은 내장 팩에서만 읽는다

위치: `docs/internals/ore-ui-engine-findings.mdx`, "4. DDUI" 절, NB-19

- 원문: "`@0x0b96ab2c`가 팩 스택의 `ddui/root`(`minecraft:ui-root`, `@0x0b96b304`)와 `ddui/composition`(`minecraft:ui-composition`, `@0x0b96c468`)을 읽고 팩 UUID를 `sourcePackId`로 남긴다."
- 원문: "팩 객체의 bool +0x88(`@0x112ac54c`)이나 +0x89(`@0x112ac55c`)가 참인 팩만 읽는다. 같은 두 함수가 POI 로더(`@0x10a29438`, `@0x10a2b6e8`)에서 `minecraft:` 이름공간 허용을 가른다"

## NB-21 DDUI 데이터 통로와 게임 중 Ore UI 스위치

위치: `docs/internals/ore-ui-engine-findings.mdx`, "4. DDUI" 절, NB-21

- 원문: "바이너리의 타입 이름: `OreUI::DataStoreQueryString` 등, `OreUI::DataStoreSetCommandGroup`, `Bedrock::DDUI::DataStoreSyncClient`/`DataStoreSyncServer`. 패킷 `ClientboundDataStorePacket`은 cereal 스키마(`ClientboundDataStorePacketPayload`, `variant<DataStoreUpdate, DataStoreChange, DataStoreRemoval>`)로 정의된다."
- 원문: "`vanilla.screenSpecificOptions`의 속성 `devOreUIGameplayUI`(`@0x09e6f6cc`)는 옵션 593(`0x251`)이 정수 1이면 참이다. 게터 `@0x09e6f998`, 세터 `@0x09e6f9fc`(1 켬, 2 끔, 14차). 옵션 593을 읽는 다른 두 함수(`@0x0b5db54c`, `@0x0b5db59c`, 15차)는 먼저 `@0x0b5db380`(전역 설정 객체 확인)을 보고, 옵션 593이 1인지 본다. 두 번째는 인자로 받은 번호가 비트 마스크 `0x380103ef`에 드는지까지 본다(화면 종류별 허용 표로 보인다, 추론). 등록 위치(`@0x078a325c`)는 분석 도구가 다른 함수로 잘못 묶어 읽지 못했다."
- 원문: "기능 토글 표(`@0x0b16a4c4`, 13차)는 (번호, 플라이팅 키, 이름, 기본값)을 등록한다. `0x28`이 `mc-enable-sdl-inventory`/`enableSDLInventoryPage`(기본 꺼짐)다."

## NB-22 `geo-item://`은 JSON UI 아이템 렌더러의 속성 묶음을 받는다

위치: `docs/internals/ore-ui-engine-findings.mdx`, "5. 아이템 아이콘 `geo-item://`" 절, NB-22

- 원문: "12차의 ADRP+ADD 탐색이 `geo-item://`의 사용처를 못 찾은 것은 그 코드가 분석 도구에서 함수로 묶이지 않았기 때문이다. 창 크기를 64개 명령으로 넓혀 바이트로 다시 훑자 스킴 등록 함수(`@0x0b911e34`)가 나왔다. `https://`, `paperdoll://`과 함께 등록되고, `geo-item://`과 `paperdoll://`은 같은 처리기 공장(+0x200)을 플래그 0/1로 쓴다."
- 원문: "처리기는 `OreUI::GeometryAtlasResourceHandlerImpl`(vtable `@0x12ea8058`)이다. 요청(슬롯 2, `@0x0b91aa50`)은 URL 문자열을 `OreUI::ItemResourceResolver`의 해석 함수(vtable +0x18, `@0x0b91af24`)에 넘긴다(18~22차)."
- 원문: "쿼리 키는 FNV-1a 32비트 해시로 비교한다: `width`(`0x95876e1f`), `height`(`0xd5bdbb42`), `id`(`0x37386ae0`, 정수), `bag`(`0x63b75f31`, URL 디코드 후 `Json::Value`). 이름은 해시를 사전과 전수 탐색으로 맞춰 찾았다."
- 원문: "`GeometryAtlas::ItemHandleFactoryImpl`의 생성 함수(vtable +0x10, `@0x09766138`)는 이름을 `ItemRegistryRef::lookupByName`(`@0x0fcc10e8`)으로 찾고, 없으면 빈 핸들을 돌려준다."
