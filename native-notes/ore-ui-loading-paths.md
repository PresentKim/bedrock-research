# Ore UI 로딩 경로: 바이너리 세부

짝이 되는 사이트 페이지: `docs/ore-ui/loading-paths.mdx`. 아래 글은 그 페이지에서 옮긴 원문이다. 분석 판은 Android 1.26.52.3 arm64다.

## 머리말 (주소 기준)

주소는 Android 1.26.52.3 arm64 분석 기본 주소(ELF 주소 + 0x100000)다. (출처: repo-ore-ui-loading)

## 1. Ore UI 파일 요청은 어떻게 풀리나

1. **URL 정규화** (`@0x09cf635c`): 요청 경로가 `ui://`로 시작하지 않으면 앞의 `/`를 떼고 `ui://`를 붙인다. 문자열로 `ui://`, `ui://hbui/fonts/`, `coui://uiresources/...`(Gameface 인스펙터)가 있다.
2. **파일 찾기** (`@0x09cf68d4`)
   - 경로에 `../`나 `..\`가 있으면 거부한다.
   - 경로를 정규화한 뒤 **팩 스택(0x110바이트 팩 항목 배열)을 앞에서부터 돈다.** 각 팩에서 팩 접근 전략의 가상 함수(+0x30)가 참일 때만 그 팩에 파일이 있는지(`@0x112ac30c`, 하위 팩, 팩 순, 가상 함수 +0x38 = `hasAsset(path, false, false)`) 본다. 있으면 그 팩에서 준다.
   - 없으면 `gui/dist/` + 기준 폴더 + 경로를 **앱 패키지 파일 시스템**(`Core::FileSystem`, `@0x09cf66f8`)에서 연다.
3. **필터는 `isTrusted()`다**: 바로 다음 슬롯(+0x38)이 `hasAsset`이고, 배드락 `PackAccessStrategy`의 가상 함수 순서(`... isWritable`, `setIsTrusted`/`isTrusted`, `hasAsset` ...)와 맞는다.
4. `routes.json`(`@0x09cd39dc`)과 폰트(`gui/dist/hbui/fonts`, `@0x096de4bc`)는 설치 폴더에서만 읽는다.

## 2. 암호화 팩은 신뢰되었다 (26.63까지)

### 접근 전략별 판정

팩 접근 전략 클래스의 vtable을 RTTI 이름(`18PackAccessStrategy` 등)으로 찾고, 슬롯 +0x30(`isTrusted`)을 역어셈블했다(11차 분석, `DumpVtables.java`).

| 접근 전략 | +0x30 `isTrusted` | +0x28 `isWritable` |
| --- | --- | --- |
| `ZipPackAccessStrategy` (`@0x1125865c`) | `위치.파일시스템 == 1` 또는 `+0x170` 플래그 | `+0x171` 플래그 |
| `DirectoryPackAccessStrategy` (`@0x112ee564`) | `위치.파일시스템 == 1` | 언제나 참 |
| `EncryptedFileAccessStrategy` (`@0x112f456c`) | **언제나 참** | 언제나 거짓 |
| `ZippedEncryptedFilesAccessStrategy` (`@0x112f456c`, 같은 함수) | **언제나 참** | 언제나 거짓 |
| `DirectoryPackWithEncryptionAccessStrategy` (`@0x112f0a70`) | **언제나 참** | 언제나 참 |

- `위치`는 팩의 `ResourceLocation`(접근 전략의 +0x18 슬롯이 돌려주는 필드)이고, 첫 필드가 파일 시스템 종류다. 1은 앱 패키지(`AppPackage`), 곧 게임 설치 폴더의 내장 팩으로 본다 `{추론, 배드락 ResourceFileSystem 열거 순서}`.
- UUID를 흉내 내도 평문 팩은 Zip/Directory 전략으로 열리고, 그 판정은 설치 위치만 본다.
- 바이너리의 `Failed encrypted file signature check` 문구는 월드 저장소(LevelDB) 쪽 코드였다. 팩 서명(`signatures.json`)을 확인하는 코드는 따라가지 않았다.
- 콘텐츠 키는 `ClientContentKeyProvider`가 서버가 보낸 키, 엔타이틀먼트, 내장 표에서만 찾는다(출처: 비공개 조사).

### 로컬 팩(`content.zipe`)

26.63까지는 평문 팩 폴더에 `content.zipe`를 더하면 키 없이도 `DirectoryPackWithEncryptionAccessStrategy`로 열리고, 신뢰되어 Ore UI 파일을 바꿨다.

## 3. 버튼 스타일 다리 `vanilla.resourcePackOverrides`

### 엔진 쪽

- facet `vanilla.resourcePackOverrides`(`OreUI::ResourcePackOverridesFacet`)는 `definitions`와 `lastUpdated` 두 속성을 낸다(`@0x09ef8760`).
- 정의 하나는 `identifier`, `control`, `propertyData[]`(`UI::Resources::ResolvedPropertyData`: `name`, `value`=JSON 문자열), `textureData[]`(`ResolvedTextureData`: `identifier`, `path`, `sliceSize`, `uvSize`, `uvScale`)다.
- **엔진이 푸는 정의는 하드코딩된 두 개다** (`@0x09ef8a7c`).

## 4. DDUI 레이아웃은 팩에서 읽지만 내장 팩만

- 로더(`@0x0b96ab2c`)가 팩 스택을 돌며 각 팩의 `ddui/root`와 `ddui/composition` 폴더를 연다. 파일은 `minecraft:ui-root`(`@0x0b96b304`, 오류 문구 `DataDrivenUI Root .json file '{}'`, `Failed to load DataDrivenUI file`)와 `minecraft:ui-composition`(`@0x0b96c468`)으로 해석한다.
- **팩 거르기**: 팩 객체의 bool 두 개(+0x88 `@0x112ac54c`, +0x89 `@0x112ac55c`) 중 하나라도 참인 팩만 읽는다. 같은 두 함수가 POI 로더(`@0x10a29438`, `@0x10a2b6e8`)에서 "둘 다 거짓인 팩이 `minecraft:` 식별자를 쓰면 `Cannot use minecraft namespace found %s`"를 내는 데 쓰인다. 그러니 이 두 값은 "게임 내장(퍼스트파티) 팩" 표시다 `{추론}`.
- `/reload`에 DDUI 분기가 있다(`commands.reload.ddui.success`, `@0x0ebd02fc`).

## 6. 규칙 요약

1. 평문 팩(Zip, Directory 접근 전략)은 신뢰되지 않으므로 `hbui/`의 파일이 무시된다.
