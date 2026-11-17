# JSON UI 엔진 발견: 바이너리 세부

`docs/internals/json-ui-engine-findings.mdx`(영어판 `i18n/en/docusaurus-plugin-content-docs/current/internals/json-ui-engine-findings.mdx`)에서 옮긴 바이너리 세부다. 공개 페이지에는 동작과 결론만 남겼다. 아래 인용은 옮기기 전 한국어 페이지의 원문이다.

분석 대상: Android 1.26.52.3 arm64 빌드. 주소는 이 빌드의 분석 주소이고 판이 바뀌면 달라진다.

## 머리말

위치: `docs/internals/json-ui-engine-findings.mdx`, 머리말(검증 수준 문단)

- 원문: "`@0x…`는 Android 1.26.52.3 arm64 빌드의 분석 주소이고 판이 바뀌면 달라진다."

## NB-01 `modifications` 연산 이름은 11개뿐이다

위치: `docs/internals/json-ui-engine-findings.mdx`, "1. `modifications`" 절, NB-01

- 원문: "`modifications` 해석 함수(`@0x098474d4`)와 연산 이름표 함수(`@0x09845574`)가 같은 11개 이름을 번호 1~11에 대응시킨다."

## NB-07 컬렉션 항목은 부모로 정해진다

위치: `docs/internals/json-ui-engine-findings.mdx`, "2. 팩토리와 컬렉션" 절, NB-07

- 원문: "컨트롤을 만드는 함수(`@0x097988e8`)는 컨트롤마다 다음을 한다."

## NB-13 팩토리 해석 함수

위치: `docs/internals/json-ui-engine-findings.mdx`, "2. 팩토리와 컬렉션" 절, NB-13

- 원문: "컨트롤을 만드는 함수(`@0x097988e8`)가 팩토리 해석 함수(`@0x097a0b00`)를 부른다(2026-10-23 3·4차 분석)."
- 원문: "컨트롤 타입이 팩토리(타입 번호 5)이고 `control_name`이나 `control_ids`를 **직접** 가지면 이름 없이 해석한다."
- 원문: "`property_bag_for_children`을 쓰는 함수는 `ADRP`+`ADD` 탐색으로 찾지 못했다."

## NB-14 `_first_hidden_child_index`는 상점 설명 화면 전용이다

위치: `docs/internals/json-ui-engine-findings.mdx`, "2. 팩토리와 컬렉션" 절, NB-14

- 원문: "세 함수 모두 `store/servicecomponent/DescriptionComponent.cpp`(상점·마켓플레이스 상세 화면의 설명 컴포넌트) 안에 있다. 함수 안의 assert 문구 `Attribute does not exist at these indices`에 이 경로가 붙어 있다."
- 원문: "**전용 함수 둘**(`@0x0b76397c` 태그, `@0x0b7642b0` 언어)"
- 원문: "**일반형 함수**(`@0x0b743554`): 접두어에 `_first_hidden_child_index`를 붙여 키를 만들고 주머니에서 정수로 읽는다. 부르는 곳은 둘이고 접두어는 `"tag_row"`(`@0x0b763d90`), `"language_row"`(`@0x0b7646cc`)다."
- 같은 내용이 "10.1 리버싱으로만 알게 된 것" 표 R-14에도 있었다. 원문: "상점 상세 화면 설명 컴포넌트(`DescriptionComponent.cpp`)가 속성 주머니의 이 정수로 태그·언어를 접거나 다음 줄로 넘긴다."

## NB-09 바인딩 해석

위치: `docs/internals/json-ui-engine-findings.mdx`, "3. 바인딩과 변수" 절, NB-09

- 원문: "바인딩 해석 함수(`@0x0979f9b8`)는 다음을 한다."
- 원문: "`binding_condition`(`@0x09843c50`)은 문자열이어야 하고"

## NB-10 `ignored`와 `variables`의 순서

위치: `docs/internals/json-ui-engine-findings.mdx`, "3. 바인딩과 변수" 절, NB-10

- 원문: "정의를 해석하는 함수(`@0x0983e680`)는 컨트롤마다 **`ignored`를 가장 먼저** 평가한다."

## NB-08 `#hyperlink` 허용 목록

위치: `docs/internals/json-ui-engine-findings.mdx`, "4. 입력: `#hyperlink`" 절, NB-08

- 원문: "버튼을 누르면 엔진은 그 컨트롤의 속성 주머니에서 `#hyperlink`를 읽어 검사 함수(`@0x0a54bb74`)에 넘기고, 통과할 때만 여는 함수(`@0x0a21dab4`)를 부른다."

## NB-11 `§` 색표는 전역 변수에서 만든다

위치: `docs/internals/json-ui-engine-findings.mdx`, "5. 텍스트: `§` 색표" 절, NB-11

- 원문: "`ui/_global_variables.json`을 읽는 함수(`@0x098625b8`)는 파일을 읽은 뒤 변수 29개를 꺼내 색표 하나를 만든다."

## NB-12 종이 인형(`paper_doll_renderer`)과 NetEase 골격 모델

위치: `docs/internals/json-ui-engine-findings.mdx`, "6. 렌더러: 종이 인형과 NetEase" 절, NB-12

- 표의 원래 행: "| `PaperDollRenderer`, `PaperDollPropertyBagSource`, `PaperDollResolvedUIDefSource`, `IPaperDollUIDefSource`, `IOffscreenPaperDollRenderer` 등 | 26(`PaperDoll` 포함 문자열) | C++ 타입 정보(RTTI) 이름 |"
- 원문: "국제판 종이 인형은 속성을 **속성 주머니와 UI 정의 두 곳**에서 받는 것으로 보인다(`PaperDollPropertyBagSource`, `PaperDollResolvedUIDefSource`)."
- 같은 타입 이름이 표 R-11에도 있었다. 원문: "`PaperDollPropertyBagSource`와 `PaperDollResolvedUIDefSource` 타입이 있다."
- "11. 남은 것" 절의 원문: "종이 인형의 `PaperDollPropertyBagSource`·`PaperDollResolvedUIDefSource`가 어느 속성을 읽는지"

## NB-16 서버 폼 JSON 스키마의 행 종류는 9개이고 `multiselect`가 들어 있다

위치: `docs/internals/json-ui-engine-findings.mdx`, "7. 서버 폼 스키마" 절, NB-16

- 원문: "질문은 "모달 폼에 생긴 `multiselect`를 서버가 쓸 수 있는가"였다(2026-10-23 6·7차 분석)."
- 원문: "`form`·`modal`·`custom_form` 스키마 함수(`@0x1126decc`)가 행 종류 스키마(`@0x112718f0`)를 부르고"
- 원문: "`tooltip`을 가진 행 스키마가 여섯 개다(`@0x112700ac`, `@0x112703c0`, `@0x112708c0` 슬라이더, `@0x11270d24` 드롭다운, `@0x112710d8`, `@0x112714d0` 입력). `@0x112710d8`은 `options`(문자열 배열), `defaults`(정수 배열), `tooltip`을 가져 multiselect로 보인다."
- 원문: "`multiselect` 글자는 이 스키마와 팩 manifest 설정(`MultiSelectSetting`)에만 있다."

## NB-15 장비 슬롯은 5개이고, 렌더러가 0~4번을 고정으로 그린다

위치: `docs/internals/json-ui-engine-findings.mdx`, "8. JSON UI 밖: 장비 슬롯" 절, NB-15

- 원문: "(2026-10-23 5차 분석)"
- 원문: "`SharedTypes::Legacy::ArmorSlot`을 등록하는 함수(`@0x0cce15f8`)가 `Head`, `Torso`, `Legs`, `Feet`, `Body`를 이 순서(0~4)로 등록한다. 명령어용 슬롯 이름표(`@0x127005c8`)도 `slot.armor.head`·`chest`·`legs`·`feet`·`body` 다섯 개다."
- 원문: "**장비 읽기 함수**(`@0x0f6797ac`): 액터의 장비 컨테이너를 꺼내 가상 함수(`+0x40`, 칸 아이템 읽기)로 슬롯 번호의 아이템을 돌려준다. 이 함수를 부르는 곳은 53개이고, 대부분 0~4를 반복문 없이 상수로 펼쳐 부른다(몹 처치 텔레메트리 `@0x0ba412e8`의 `MobArmorHeadId`…`MobArmorBodyId` 등)."
- 원문: "**착용물 렌더 함수**(`@0x0a00007c`, `variable.is_first_person`·`variable.gliding_speed_value`를 다룬다): 장비 0~4번을 차례로 읽어 착용물 처리 함수(`@0x0a00101c`, `@0x0a0012b4`)에 번호 0~4로 넘기고"
- 원문: "액터 타입이 `0x13f`(플레이어)인지는 1인칭 변수를 읽을 때만 본다."
- "11. 남은 것" 절의 원문: "착용물 처리 함수(`@0x0a00101c`, `@0x0a0012b4`)가 무엇을 그리는지는 읽지 않았다(NB-15)."

## 11. 남은 것

위치: `docs/internals/json-ui-engine-findings.mdx`, "11. 남은 것" 절

- 원문: "`grid_rescaling_type`, `propagate_alpha`, `clip_direction`, `Expected variable not found in ancestor tree`, `UI control reference not found`는 `ADRP`+`ADD` 탐색으로도 쓰는 함수를 찾지 못했다."
