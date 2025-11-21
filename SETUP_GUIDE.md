# 🚀 설치 및 실행 가이드

## 데이터 연동 방법

이 프로젝트는 **이미 API가 완전히 연동되어 있습니다!** 별도의 백엔드 구현 없이 바로 사용할 수 있습니다.

### API 구조

```
Base URL: https://recruit.paysbypays.com/api/v1

연동된 엔드포인트:
✅ GET /api/v1/payments         - 결제 내역 조회 (페이지네이션, 필터링)
✅ GET /api/v1/payments/{id}    - 결제 상세 조회
✅ GET /api/v1/merchants        - 가맹점 목록 조회
✅ GET /api/v1/merchants/{id}   - 가맹점 상세 조회
✅ GET /api/v1/common/codes     - 공통 코드 조회
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일이 이미 생성되어 있습니다:

```env
NEXT_PUBLIC_API_BASE_URL=https://recruit.paysbypays.com/api/v1
```

## 실행 방법

### 1단계: 의존성 설치 (이미 완료됨)
```bash
npm install
```

### 2단계: 개발 서버 실행
```bash
npm run dev
```

### 3단계: 브라우저에서 확인
```
http://localhost:3000
```

브라우저를 열면 다음 페이지들을 확인할 수 있습니다:

- **http://localhost:3000** - 대시보드 메인 (통계, 차트, 최근 거래)
- **http://localhost:3000/payments** - 거래 내역 전체 리스트
- **http://localhost:3000/merchants** - 가맹점 관리

## 데이터 흐름

### 대시보드 메인 페이지 (`/`)

```typescript
// src/pages/index.tsx
useEffect(() => {
  loadDashboardData();
}, []);

const loadDashboardData = async () => {
  // 1. 최근 거래 5건 조회
  const paymentsResponse = await paymentApi.getPayments({ page: 0, size: 5 });
  
  // 2. 통계용 거래 데이터 조회
  const allPaymentsResponse = await paymentApi.getPayments({ page: 0, size: 100 });
  
  // 3. 가맹점 수 조회
  const merchantsResponse = await merchantApi.getMerchants({ page: 0, size: 1 });
  
  // 4. 통계 계산 및 차트 데이터 생성
  // ...
};
```

### 거래 내역 페이지 (`/payments`)

```typescript
// src/pages/payments/index.tsx
const loadPayments = async () => {
  const params = {
    page: currentPage,
    size: 20,
    status: selectedStatus,      // 필터: 거래 상태
    paymentMethod: selectedMethod // 필터: 결제 수단
  };
  
  const response = await paymentApi.getPayments(params);
  setPayments(response.content || []);
};
```

### 가맹점 페이지 (`/merchants`)

```typescript
// src/pages/merchants/index.tsx
const loadMerchants = async () => {
  const params = {
    page: currentPage,
    size: 20,
    status: selectedStatus // 필터: 가맹점 상태
  };
  
  const response = await merchantApi.getMerchants(params);
  // 각 가맹점의 거래 통계도 함께 조회
};
```

## API 클라이언트 구조

### src/lib/api.ts
```typescript
// Axios 기반 API 클라이언트
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// 결제 API
export const paymentApi = {
  getPayments: (params) => GET /payments
  getPaymentById: (id) => GET /payments/{id}
  getRecentPayments: (limit) => GET /payments?size=limit
};

// 가맹점 API
export const merchantApi = {
  getMerchants: (params) => GET /merchants
  getMerchantById: (id) => GET /merchants/{id}
  getAllMerchants: () => GET /merchants?size=1000
};

// 공통 API
export const commonApi = {
  getCodes: (type) => GET /common/codes/{type}
};
```

## 데이터 타입 정의

### src/types/index.ts
```typescript
// Payment 타입
interface Payment {
  id: string;
  merchantId: string;
  merchantName?: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

// Merchant 타입
interface Merchant {
  id: string;
  name: string;
  businessNumber: string;
  email: string;
  phone: string;
  status: MerchantStatus;
  transactionCount?: number;
  totalAmount?: number;
}
```

## 문제 해결

### API 응답이 없거나 500 에러가 발생하는 경우

만약 실제 API 서버에 문제가 있다면, Mock 데이터를 추가할 수 있습니다:

```typescript
// src/lib/mockData.ts (필요시 생성)
export const mockPayments = [ /* ... */ ];
export const mockMerchants = [ /* ... */ ];
```

### CORS 에러가 발생하는 경우

Next.js의 API Routes를 프록시로 사용할 수 있습니다:

```typescript
// pages/api/proxy/[...path].ts
export default async function handler(req, res) {
  const response = await fetch(`${API_BASE_URL}/${path}`);
  const data = await response.json();
  res.json(data);
}
```

## 실시간 데이터 확인

개발 서버를 실행한 후:

1. **브라우저 개발자도구 (F12)** 를 엽니다
2. **Network 탭**을 선택합니다
3. 페이지를 새로고침합니다
4. API 호출 내역을 확인할 수 있습니다:
   - `payments?page=0&size=5` - 최근 거래 조회
   - `payments?page=0&size=100` - 통계용 데이터
   - `merchants?page=0&size=1` - 가맹점 수 조회

## 성공 기준

✅ 대시보드에 통계 카드가 표시됨 (오늘/총 거래금액, 가맹점 수)  
✅ 차트가 정상적으로 렌더링됨 (선 그래프, 파이 차트)  
✅ 거래 내역 테이블에 데이터가 표시됨  
✅ 페이지네이션이 작동함  
✅ 필터링/검색이 작동함  
✅ 가맹점 목록이 표시됨  

## 현재 상태

- ✅ **프로젝트 설정 완료** (Next.js + TypeScript + Tailwind)
- ✅ **API 클라이언트 구현 완료** (Axios + Interceptors)
- ✅ **타입 정의 완료** (Payment, Merchant, Filters 등)
- ✅ **UI 컴포넌트 완료** (Layout, Cards, Charts, Tables)
- ✅ **페이지 구현 완료** (Dashboard, Payments, Merchants)
- ✅ **환경 변수 설정 완료** (.env.local)
- ✅ **의존성 설치 완료** (npm install)

**이제 `npm run dev`만 실행하면 됩니다!** 🎉

