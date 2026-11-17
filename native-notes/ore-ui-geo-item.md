# Ore UI geo-item과 컨테이너: 바이너리 세부

짝이 되는 사이트 페이지: `docs/ore-ui/geo-item-and-containers.mdx`. 아래 글은 그 페이지에서 옮긴 원문이다. 분석 판은 Android 1.26.52.3 arm64다(출처: repo-ore-ui-loading, private-research NB-21·NB-22).

## 1. `geo-item://` 아이템 렌더러

### 해석 규칙

`geo-item://`은 `paperdoll://`, `https://`와 함께 등록되고(스킴 등록 함수 VA `0xb811e34`, 같은 처리기 공장을 플래그 0/1로 씀), 처리기 `OreUI::GeometryAtlasResourceHandlerImpl`(vtable `@0x12ea8058`)이 URL을 `OreUI::ItemResourceResolver`(vtable `+0x18`, `@0x0b91af24`)에 넘긴다. 결과로 `GeometryAtlas::ItemHandleFactoryImpl`(vtable `+0x10`, VA `0x9666138`)이 아이템 핸들을 만든다.

1. URL의 **호스트**가 아이템 이름이다. `ItemRegistryRef::lookupByName`으로 찾고, 못 찾으면 아무것도 그리지 않는다.
2. 쿼리 키는 FNV-1a 32비트 해시로 가린다: `width`(`0x95876e1f`), `height`(`0xd5bdbb42`), `id`(`0x37386ae0`, 정수), **`bag`**(`0x63b75f31`, URL 디코드 후 JSON). 기본 크기는 50이다.
3. `bag`은 JSON UI 아이템 렌더러의 속성 묶음(property bag)이다. 속성 묶음에 `#item_id_aux`가 없으면 공장이 1에서 찾은 아이템의 id·aux 값을 넣는다. **있으면 그 값을 그대로 쓴다.**

(12차의 ADRP+ADD 탐색이 사용처를 못 찾은 것은 그 코드가 분석 도구에서 함수로 묶이지 않았기 때문이고, 64개 명령 창으로 바이트를 다시 훑어 찾았다.)

## 2. 컨테이너(화로·상자) UI

### 무엇이 Ore UI로 바꾸나

- facet `vanilla.screenSpecificOptions`에 속성 `devOreUIGameplayUI`가 있다(`@0x09e6f6cc`). 게터(`@0x09e6f998`)는 옵션 593(`0x251`)의 정수 값이 1인지 보고, 세터(`@0x09e6f9fc`)는 켜면 1, 끄면 2를 쓴다. 이 옵션을 읽는 곳은 둘 말고 두 함수(`@0x0b5db54c`, `@0x0b5db59c`)다. 둘째는 화면 번호가 비트 마스크 `0x380103ef`에 드는지까지 보므로 화면 종류별로 Ore UI 전환을 허용하는 표로 보인다 `{추론}`.
- `enableSDLInventoryPage`(기능 토글 `0x28`, 원격 플라이팅 키 `mc-enable-sdl-inventory`, 기본 꺼짐)
