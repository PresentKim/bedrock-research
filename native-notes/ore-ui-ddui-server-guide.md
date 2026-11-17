# DDUI 서버 안내: 바이너리 세부

짝이 되는 사이트 페이지: `docs/ore-ui/ddui-server-guide.mdx`. 아래 글은 그 페이지에서 옮긴 원문이다.

## 4. 패킷

바이너리 쪽 이름(NB-21): `OreUI::DataStoreQueryString`, `OreUI::DataStoreSetCommandGroup`, `Bedrock::DDUI::DataStoreSyncClient`/`DataStoreSyncServer`. 패킷 `ClientboundDataStorePacket`은 cereal 스키마(`variant<DataStoreUpdate, DataStoreChange, DataStoreRemoval>`)다(출처: 비공개 조사).
