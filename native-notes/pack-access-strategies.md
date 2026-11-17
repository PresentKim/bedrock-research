# 팩 접근 전략과 신뢰 판정

짝 페이지: `docs/basics/pack-delivery-and-encryption.mdx`(Ore UI와 암호화 팩의 신뢰 판정), `docs/ore-ui/modifying-pages.mdx`(탐침 변형과 결과), `docs/json-ui/alternatives.mdx`와 `docs/reference/rules.mdx`의 ALT-11. 분석 대상은 Windows 1.26.52와 Android 1.26.52.3이고, 26.64부터는 리소스팩의 Ore UI 접근이 막혔다.

사이트 페이지는 아래 클래스 이름 대신 팩 형태 이름을 쓴다.

| 사이트 표기 | 엔진의 접근 전략 클래스 |
| --- | --- |
| 평문 zip 팩 | `ZipPackAccessStrategy` |
| 평문 폴더 팩 | `DirectoryPackAccessStrategy` |
| 암호화 파일 경로(`contents.json`) | `EncryptedFileAccessStrategy` |
| zip 안의 암호화 파일 경로(`.mcpack`) | `ZippedEncryptedFilesAccessStrategy` |
| 암호화 폴더 팩 경로(`content.zipe`) | `DirectoryPackWithEncryptionAccessStrategy` |

## 접근 전략별 isTrusted (원래 표)

| 접근 전략 | `isTrusted` | `isWritable` |
|---|---|---|
| `ZipPackAccessStrategy` | `위치.파일시스템 == 1` 또는 `+0x170` 플래그 | `+0x171` 플래그 |
| `DirectoryPackAccessStrategy` | `위치.파일시스템 == 1` | 언제나 참 |
| `EncryptedFileAccessStrategy` | **언제나 참** | 언제나 거짓 |
| `ZippedEncryptedFilesAccessStrategy` | **언제나 참** | 언제나 거짓 |
| `DirectoryPackWithEncryptionAccessStrategy` | **언제나 참** | 언제나 참 |

- `위치`는 팩의 `ResourceLocation`이고 첫 필드가 파일 시스템 종류다. 1은 앱 패키지(게임 설치 폴더의 내장 팩)로 본다 `{추론}`.
- Ore UI 파일 조회는 신뢰된 팩(`isTrusted`)만 본다.

## 탐침 변형이 노린 경로 (modifying-pages 표의 원래 열)

| 변형 | 노리는 경로 |
| --- | --- |
| `localprobe-listing` | `EncryptedFileAccessStrategy` |
| `localprobe-header` | `EncryptedFileAccessStrategy` |
| `localprobe-zipe` | `DirectoryPackWithEncryptionAccessStrategy` |
| `localprobe-mcpack.mcpack` | `ZippedEncryptedFilesAccessStrategy` |
| `localprobe-zipe-manifest` | Directory 암호화 |
