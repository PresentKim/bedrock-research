# Ore UI 개요: 바이너리 세부

짝이 되는 사이트 페이지: `docs/ore-ui/overview.mdx`. 아래 글은 그 페이지에서 옮긴 원문이다. 분석 판은 Android 1.26.52.3이다.

## 화면 선택과 문자열

- `resource_packs/oreui` 경로 문자열은 바이너리에 있지만 `ADRP`+`ADD`로 만드는 함수는 찾지 못했다.

## 남은 것과 한계

- DDUI의 팩 필터(+0x88/+0x89)는 `isTrusted`와 다른 값이라 암호화해도 열리지 않을 수 있다.
- +0x88/+0x89의 정확한 이름(예: `isBaseGamePack`, `isSlicePack`)은 확인하지 못했다.

팩 필터의 주소와 POI 로더 쪽 근거는 [ore-ui-loading-paths.md](./ore-ui-loading-paths.md)의 4절에 있다.
