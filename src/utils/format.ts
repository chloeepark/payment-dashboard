import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

export const formatDate = (dateString: string, formatStr: string = 'yyyy-MM-dd HH:mm'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  return formatDate(dateString, 'yyyy-MM-dd');
};

export const formatDateTime = (dateString: string): string => {
  return formatDate(dateString, 'yyyy-MM-dd HH:mm:ss');
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    SUCCESS: 'text-success-700 bg-success-50 border border-success-200',
    PENDING: 'text-warning-700 bg-warning-50 border border-warning-200',
    FAILED: 'text-error-700 bg-error-50 border border-error-200',
    CANCELLED: 'text-neutral-700 bg-neutral-50 border border-neutral-200',
    REFUNDED: 'text-warning-700 bg-warning-50 border border-warning-200',
    ACTIVE: 'text-success-700 bg-success-50 border border-success-200',
    INACTIVE: 'text-neutral-700 bg-neutral-50 border border-neutral-200',
    READY: 'text-warning-700 bg-warning-50 border border-warning-200',
    CLOSED: 'text-error-700 bg-error-50 border border-error-200',
    SUSPENDED: 'text-error-700 bg-error-50 border border-error-200',
  };
  return colors[status] || 'text-neutral-700 bg-neutral-50 border border-neutral-200';
};

export const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    SUCCESS: '성공',
    PENDING: '대기',
    FAILED: '실패',
    CANCELLED: '취소',
    REFUNDED: '환불',
    ACTIVE: '활성',
    INACTIVE: '비활성',
    READY: '대기',
    CLOSED: '종료',
    SUSPENDED: '정지',
    CARD: '카드',
    BANK_TRANSFER: '계좌이체',
    VIRTUAL_ACCOUNT: '가상계좌',
    MOBILE: '모바일',
    DEVICE: '단말기',
    ONLINE: '온라인',
    BILLING: '정기결제',
    VACT: '가상계좌',
    ETC: '기타',
  };
  return texts[status] || status;
};

export const getPaymentMethodColor = (method: string): string => {
  const colors: Record<string, string> = {
    CARD: 'text-primary-700 bg-primary-50 border border-primary-200',
    BANK_TRANSFER: 'text-success-700 bg-success-50 border border-success-200',
    VIRTUAL_ACCOUNT: 'text-warning-700 bg-warning-50 border border-warning-200',
    MOBILE: 'text-primary-700 bg-primary-50 border border-primary-200',
    DEVICE: 'text-primary-700 bg-primary-50 border border-primary-200',
    ONLINE: 'text-primary-700 bg-primary-50 border border-primary-200',
    BILLING: 'text-warning-700 bg-warning-50 border border-warning-200',
    VACT: 'text-warning-700 bg-warning-50 border border-warning-200',
    ETC: 'text-neutral-700 bg-neutral-50 border border-neutral-200',
  };
  return colors[method] || 'text-neutral-700 bg-neutral-50 border border-neutral-200';
};

