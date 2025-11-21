// Common Types
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Payment Types
export interface Payment {
  paymentCode: string;
  mchtCode: string;
  mchtName?: string;
  amount: string;
  currency: string;
  payType: string;
  status: string;
  paymentAt: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  DEVICE = 'DEVICE',
  MOBILE = 'MOBILE',
  VACT = 'VACT',
  BILLING = 'BILLING',
}

// Common Code Types
export interface StatusCode {
  code: string;
  description: string;
}

export interface PayTypeCode {
  type: string;
  description: string;
}

// Merchant Types
export interface MerchantListItem {
  mchtCode: string;
  mchtName: string;
  status: string;
  bizType: string;
  transactionCount?: number;
  totalAmount?: number;
}

export interface MerchantDetail {
  mchtCode: string;
  mchtName: string;
  status: string;
  bizType: string;
  bizNo: string;
  address: string;
  phone: string;
  email: string;
  registeredAt: string;
  updatedAt: string;
}

export type Merchant = MerchantListItem;

export enum MerchantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  READY = 'READY',
  CLOSED = 'CLOSED',
}

// Statistics Types
export interface DashboardStats {
  todayAmount: number;
  totalAmount: number;
  todayCount: number;
  totalCount: number;
  merchantCount: number;
  statusCounts: StatusCount[];
}

export interface StatusCount {
  status: PaymentStatus;
  count: number;
  amount: number;
}

// Filter Types
export interface PaymentFilter extends PaginationParams {
  startDate?: string;
  endDate?: string;
  status?: PaymentStatus;
  merchantId?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: PaymentMethod;
}

export interface MerchantFilter extends PaginationParams {
  status?: MerchantStatus;
  keyword?: string;
}

