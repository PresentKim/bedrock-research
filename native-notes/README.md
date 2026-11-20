# 바이너리 분석 원자료

위키 사이트(`docs/`)에 싣지 않는 네이티브 클라이언트 분석의 세부를 모아 둔 폴더다. 함수와 클래스 이름, 주소, 구조체와 vtable 오프셋, 코드를 찾는 데만 쓰인 해시처럼 결론을 재확인하거나 다음 판에서 다시 찾을 때만 필요한 정보가 여기에 있다. 결론과 실용적인 의미는 사이트 페이지에 있고, 각 항목은 그 페이지와 절을 가리킨다.

Docusaurus는 `docs/`만 빌드하므로 이 폴더는 사이트에 나오지 않는다. 판 번호가 붙은 값은 그 판에서만 맞다.

| 파일 | 짝이 되는 사이트 페이지 |
| --- | --- |
| [json-ui-engine.md](./json-ui-engine.md) | `docs/internals/json-ui-engine-findings.mdx` |
| [ore-ui-engine.md](./ore-ui-engine.md) | `docs/internals/ore-ui-engine-findings.mdx` |
| [ore-ui-loading-paths.md](./ore-ui-loading-paths.md) | `docs/ore-ui/loading-paths.mdx` |
| [ore-ui-geo-item.md](./ore-ui-geo-item.md) | `docs/ore-ui/geo-item-and-containers.mdx` |
| [ore-ui-overview.md](./ore-ui-overview.md) | `docs/ore-ui/overview.mdx` |
| [ore-ui-ddui-server-guide.md](./ore-ui-ddui-server-guide.md) | `docs/ore-ui/ddui-server-guide.mdx` |
| [block-item-definition-nbt.md](./block-item-definition-nbt.md) | `docs/server/custom-items-and-blocks.mdx` "블록·아이템 정의 NBT에서 실측한 것" |
| [structure-renderer.md](./structure-renderer.md) | `docs/design/structure-renderer.mdx` "2. 속성 전체" |
| [client-1-26-65-findings.md](./client-1-26-65-findings.md) | `docs/json-ui/files-and-definitions.mdx` 1.11절, `docs/ore-ui/overview.mdx`, `docs/scripting/versions-and-beta.mdx`, `docs/basics/manifest.mdx`, `docs/content/functions-and-commands.mdx` 7절, `docs/rendering/` 머티리얼과 Molang 절 |
| [pack-access-strategies.md](./pack-access-strategies.md) | `docs/basics/pack-delivery-and-encryption.mdx`, `docs/ore-ui/modifying-pages.mdx`, ALT-11 |
