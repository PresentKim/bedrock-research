# Bedrock 개발 위키

마인크래프트 배드락 에디션의 JSON UI, Ore UI, 서버 화면(폼), Script API, 애드온 콘텐츠, 렌더링, 서버·프로토콜, 도구를 한국어로 정리한 Docusaurus 위키의 공개용 사본이다. "어디를 보라"는 참조 대신 필요한 내용을 본문에 옮기고 출처와 라이선스를 페이지마다 적었다. 시작 페이지는 [docs/index.mdx](./docs/index.mdx)이고 독자별 읽는 순서가 있다.

공개하기 어려운 출처는 출처 id `private-research`("비공개 조사") 하나로 묶었고, 그 자료에 기대던 문장은 일반 표현으로 고쳤다. 사이트는 저장소 루트에 있다(`package.json`이 루트에 있고 `wiki/` 폴더는 없다).

## 실행

Node 22 이상이 필요하다.

```bash
npm ci
npm start            # 개발 서버 (출처 레지스트리 병합과 출처 목록 생성 후 실행)
npm run build        # 정적 사이트 빌드. 깨진 링크가 있으면 실패한다
npm run check        # frontmatter, 출처 id, 링크, 라이선스, MDX 검사
npm test             # 검사·생성 스크립트 단위 시험
```

출처 목록 페이지(`docs/reference/sources.mdx`)는 `sources/*.json`에서 빌드 전에 자동으로 다시 만들어진다. 출처를 추가하면 `sources/`의 JSON에 항목을 더하고 `npm run check`로 확인한다.

GitHub Pages 배포(`.github/workflows/pages.yml`)는 저장소가 공개일 때만 실행된다. 비공개 상태에서는 빌드와 검사까지만 돈다.

## 영어판

한국어가 원문이고 영어판은 `/en/` 경로에 나온다. 상단 메뉴의 언어 선택으로 오간다. 영어 페이지는 `i18n/en/docusaurus-plugin-content-docs/current/`에 `docs/`와 같은 경로로 두고, 분류 이름은 같은 폴더의 `current.json`, 화면 문자열은 `i18n/en/code.json`과 `i18n/en/docusaurus-theme-classic/`에 있다. 출처의 영어 이름은 `sources/*.json` 항목의 `title_en`, `license_en`, `author_en`이고, 영어 출처 목록 페이지도 `npm run gen-sources`가 만든다.

한국어 페이지를 추가하거나 고치면 영어 페이지도 같이 고친다. `npm run check`는 영어 페이지가 없는 한국어 페이지를 오류로 보고한다. 개발 서버는 한 번에 한 언어만 띄우므로 영어판은 `npm start -- --locale en`으로 본다.

## 라이선스 요약

위키는 여러 출처를 조사해 한국어로 다시 쓴 것이고, 일부 페이지는 원문을 `발췌` 상자로 옮겼다. 출처마다 라이선스가 다르다.

| 라이선스 | 처리 |
| --- | --- |
| CC BY 4.0 (Bedrock Wiki, MS Learn 문서, Chest-UI) | 출처와 변경 여부를 적고 발췌 |
| MIT, BSD, Apache | 저작권 고지를 유지하고 발췌 |
| GPL-3.0 (AsaJS, StarLibV2) | 기본은 기법 설명. 발췌 블록은 GPL-3.0 그대로 |
| PolyForm Noncommercial 1.0.0 (Cinnabar) | 비상업 목적에만 이용 |
| 라이선스 없음, All rights reserved, Mojang, NetEase 등 | 원문을 옮기지 않고 사실만 다시 씀 |

제3자 고지 전문은 [NOTICE.md](./NOTICE.md), 적용 방법은 [docs/reference/license.mdx](./docs/reference/license.mdx), 전체 출처 목록은 위키의 "출처 목록" 페이지에 있다.

## 비상업 이용 안내

PolyForm Noncommercial 자료의 발췌가 들어 있으므로 **이 저장소와 위키 전체를 비상업 목적으로만 이용한다.** 학습, 개인 연구, 취미 프로젝트, 교육·공공 기관의 이용은 허용 범위이다. 복사본을 배포할 때는 [NOTICE.md](./NOTICE.md)와 각 발췌 상자의 출처·라이선스 표시를 함께 전한다. 이 위키는 Mojang, Microsoft와 관계가 없는 비공식 자료이다.
