# 결제/가맹점 관리 대시보드

결제 거래 및 가맹점 정보를 조회하고 관리할 수 있는 웹 기반 관리자 대시보드입니다.

## 주요 기능

### 대시보드
- KPI 통계 (총 거래액, 거래 건수, 성공률, 활성 가맹점)
- 일별 거래 추이 차트
- 결제 수단별 분포
- 거래 상태별 통계
- Top 가맹점 순위
- 최근 거래 내역

### 거래 내역 관리
- 날짜, 가맹점, 결제수단, 상태, 금액 기준 필터링
- 컬럼별 정렬 (오름차순/내림차순)
- 페이지네이션 (20건/페이지)
- 거래 상세 정보 모달
- CSV 다운로드

### 가맹점 관리
- 가맹점 목록 (카드 뷰/테이블 뷰)
- 가맹점 검색
- 가맹점 상세 페이지 (기본 정보, 거래 통계, 월별 추이, 최근 거래)

## 기술 스택

- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Recharts** - 데이터 시각화
- **Axios** - HTTP 클라이언트
- **date-fns** - 날짜 처리
- **Lucide React** - 아이콘

## 설치 및 실행

### 요구사항
- Node.js 20.x 이상

### 설치

```bash
npm install
```

### 환경 설정

프로젝트 루트에 `.env.local` 파일 생성:

```
NEXT_PUBLIC_API_BASE_URL=https://recruit.paysbypays.com/api/v1
```

### 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인 가능합니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
src/
├── components/
│   ├── Layout.tsx              # 레이아웃 (사이드바, 네비게이션)
│   ├── cards/                  # 카드 컴포넌트
│   │   ├── StatsCard.tsx
│   │   └── MerchantCard.tsx
│   ├── charts/                 # 차트 컴포넌트
│   │   ├── PaymentTrendChart.tsx
│   │   ├── PaymentMethodChart.tsx
│   │   ├── StatusBarChart.tsx
│   │   └── StatusPieChart.tsx
│   ├── tables/                 # 테이블 컴포넌트
│   │   ├── PaymentTable.tsx
│   │   ├── MerchantTable.tsx
│   │   └── TopMerchantsTable.tsx
│   └── modals/
│       └── PaymentDetailModal.tsx
├── lib/
│   └── api.ts                  # API 클라이언트
├── pages/
│   ├── index.tsx               # 대시보드 메인
│   ├── payments/
│   │   └── index.tsx           # 거래 내역
│   └── merchants/
│       ├── index.tsx           # 가맹점 목록
│       └── [mchtCode].tsx      # 가맹점 상세
├── types/
│   └── index.ts                # 타입 정의
├── utils/
│   └── format.ts               # 포맷팅 유틸
└── styles/
    └── globals.css             # 전역 스타일
```

## API

Base URL: `https://recruit.paysbypays.com/api/v1`

### 엔드포인트

- `GET /payments` - 전체 결제 내역
- `GET /payments/recent` - 최근 결제 내역
- `GET /merchants` - 가맹점 목록
- `GET /merchants/{mchtCode}` - 가맹점 상세
- `GET /merchants/{mchtCode}/payments` - 가맹점별 거래
- `GET /merchants/{mchtCode}/statistics` - 가맹점 통계
- `GET /common/payment-status-codes` - 상태 코드
- `GET /common/payment-type-codes` - 결제수단 코드

API 상세: https://recruit.paysbypays.com/swagger-ui/index.html

## 디자인 의도

관리자가 복잡한 결제 데이터를 빠르게 이해하고 의사결정할 수 있도록 **시각적 명확성**에 중점을 두었습니다. 상태별 색상 코딩과 아이콘으로 정보를 직관적으로 전달하며, 차트와 테이블을 조합하여 데이터의 전체 흐름과 세부 내역을 동시에 파악할 수 있습니다. 모든 화면은 데스크톱 환경에 최적화되어 있으며, 반응형 레이아웃으로 모바일과 태블릿에서도 원활하게 동작합니다.

## 구현 특징

### UI/UX
- 반응형 디자인 (모바일, 태블릿, 데스크톱 지원)
- 상태별 색상 코딩 (성공: 초록, 실패: 빨강, 대기: 주황, 취소: 회색)
- 아이콘을 활용한 직관적인 상태 표시
- 호버 효과 및 트랜지션

### 데이터 시각화
- 라인 차트: 일별 거래 추이 (거래액/건수)
- 도넛 차트: 결제 수단별 분포
- 바 차트: 거래 상태별 통계 (그라데이션 효과)
- 파이 차트: 가맹점별 거래 상태

### 기능
- 클라이언트 사이드 필터링 및 정렬
- CSV 내보내기 (UTF-8 BOM 포함)
- 페이지네이션
- 모달 팝업
- 동적 라우팅

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 라이선스

이 프로젝트는 채용 과제용으로 제작되었습니다.
