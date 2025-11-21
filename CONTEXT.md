# 📌 대시보드 페이지 개발 기획서 (Cursor 용)

## 1. 프로젝트 개요

* **프로젝트명:** PG 결제/가맹점 대시보드
* **목적:** 채용 전용 API를 활용하여 결제/가맹점 데이터를 시각화한 관리자형 대시보드 구현.
* **필수 포함:** 첫 대시보드 메인 화면, 거래 내역 리스트(필수)
* **추가 가능:** 가맹점 조회, 거래내역 종합 페이지, 정산 요약 등 자유 구성.

## 2. 개발 환경

### ✔ Node.js

* **필수 버전:** Node.js 20.x LTS
* 예: 20.11.0 / 20.15.0

### ✔ 패키지 매니저

* 기본: npm
* yarn/pnpm 사용 시 README에 명시

### ✔ 프레임워크 / 언어

* React 18 이상 (필수)
* 빌드도구: Next.js 또는 Vite 사용 가능
* TypeScript 권장

### ✔ 스타일링

* Tailwind, Styled-Components, MUI, Ant 등 자유
* 템플릿 사용 시 README에 출처 및 커스터마이징 내용 정리
* 자체 디자인 시 UI 의도/UX 포인트를 README에 2~3줄 포함

## 3. 실행 방식

```bash
npm install
npm run dev
```

* 위 명령 실행되지 않을 경우, README에 별도 실행법 명시 필수

## 4. API 정보

### ✔ Base URL

```
https://recruit.paysbypays.com/api/v1
```

### ✔ Swagger 문서

* API 동작 확인용: `https://recruit.paysbypays.com/swagger-ui/index.html`

### ✔ 환경 변수 예시

* `.env` 사용 가능 (선택)

```
VITE_API_BASE_URL=https://recruit.paysbypays.com/api/v1
REACT_APP_API_BASE_URL=https://recruit.paysbypays.com/api/v1
```

* 환경 변수 사용 시 README에 명시 필요


API 사용 안내
모든 API는 JSON 형식의 요청과 응답을 사용합니다.
각 엔드포인트에 대한 자세한 설명과 예제는 아래 섹션을 참고하세요.
주요 엔드포인트
/api/v1/common: 공통 코드 조회 API
/api/v1/merchants: 가맹점 관련 API
/api/v1/payments: 결제 관련 API


*(기타 필요한 API는 Swagger 참고)*

## 6. 페이지 구성안

### ✔ 1) 대시보드 메인 (필수)

* 오늘/전체 거래 금액 요약 카드
* 거래 상태별 통계 (성공/실패/취소 등)
* 최근 거래 5건 테이블
* 가맹점 수 및 결제 추이 간단 그래프

### ✔ 2) 거래 내역 리스트 (필수)

* 테이블: 거래 ID / 금액 / 상태 / 생성일 / 결제수단
* 검색 필터: 날짜, 금액, 가맹점 ID, 상태 등(Optional)
* Pagination

### ✔ 3) 가맹점 리스트 (선택)

* 가맹점 정보 테이블
* 가맹점별 거래 수 요약

### ✔ 4) 상세 페이지 (MockUp 가능)

* GET API만 존재 → 등록/수정은 MOCK 화면으로 대체 가능

## 7. 폴더 구조 제안 (Cursor 최적화)

```
src/
  api/
    payments.ts
    merchants.ts
  components/
    charts/
    cards/
    tables/
  pages/
    dashboard/
    payments/
    merchants/
  hooks/
  utils/
  types/
```

## 8. UI/UX 고려사항

* 데이터가 많은 리스트는 빠른 스크롤/페이징 제공
* 금액/상태는 시각적으로 강조 (컬러/아이콘)
* 모바일 대응은 선택사항

## 9. README에 포함해야 할 내용

* Node 버전 (20.x)
* 설치/실행 방법
* 템플릿·라이브러리 사용 여부 및 출처
* 환경변수 사용 시 명시
* 디자인 선택 시 의도 요약

---

(이 문서는 Cursor에서 개발 시작할 때 기준 템플릿으로 바로 사용할 수 있도록 구성되어 있습니다.)
