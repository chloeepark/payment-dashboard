import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Search, Filter, Download, Calendar, RefreshCw, ChevronUp, ChevronDown, CheckCircle, XCircle, Ban, Clock } from 'lucide-react';
import { paymentApi, merchantApi, commonApi } from '@/lib/api';
import { Payment, Merchant, StatusCode, PayTypeCode } from '@/types';
import { formatCurrency, formatDateTime, getStatusColor, getStatusText } from '@/utils/format';
import PaymentDetailModal from '@/components/modals/PaymentDetailModal';

const ITEMS_PER_PAGE = 20;

type SortField = 'paymentAt' | 'amount' | 'status' | 'payType' | 'mchtCode';
type SortOrder = 'asc' | 'desc';

const getStatusIcon = (status: string) => {
  const icons: Record<string, React.ElementType> = {
    SUCCESS: CheckCircle,
    PENDING: Clock,
    FAILED: XCircle,
    CANCELLED: Ban,
    REFUNDED: Ban,
  };
  return icons[status] || CheckCircle;
};

const getStatusIconColor = (status: string) => {
  const colors: Record<string, string> = {
    SUCCESS: 'text-success-600',
    PENDING: 'text-warning-600',
    FAILED: 'text-error-600',
    CANCELLED: 'text-neutral-600',
    REFUNDED: 'text-warning-600',
  };
  return colors[status] || 'text-neutral-600';
};

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [displayPayments, setDisplayPayments] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [selectedPayType, setSelectedPayType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  
  // Options
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [payTypes, setPayTypes] = useState<PayTypeCode[]>([]);
  const [statuses, setStatuses] = useState<StatusCode[]>([]);
  
  // Sort
  const [sortField, setSortField] = useState<SortField>('paymentAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Selection & Modal
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allPayments, startDate, endDate, selectedMerchant, selectedPayType, selectedStatus, minAmount, maxAmount]);

  useEffect(() => {
    applySortAndPagination();
  }, [filteredPayments, sortField, sortOrder, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [paymentsData, merchantsData, payTypesData, statusesData] = await Promise.all([
        paymentApi.getPayments(),
        merchantApi.getMerchants(),
        commonApi.getPaymentTypeCodes(),
        commonApi.getPaymentStatusCodes(),
      ]);
      
      setAllPayments(paymentsData);
      setMerchants(merchantsData);
      setPayTypes(payTypesData);
      setStatuses(statusesData);
      
      // Set default dates (last 30 days)
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setDate(today.getDate() - 30);
      setEndDate(today.toISOString().split('T')[0]);
      setStartDate(lastMonth.toISOString().split('T')[0]);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allPayments];

    // Date filter
    if (startDate) {
      filtered = filtered.filter(p => p.paymentAt >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(p => p.paymentAt <= endDate + 'T23:59:59');
    }

    // Merchant filter
    if (selectedMerchant) {
      filtered = filtered.filter(p => p.mchtCode === selectedMerchant);
    }

    // Payment type filter
    if (selectedPayType) {
      filtered = filtered.filter(p => p.payType === selectedPayType);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    // Amount filter
    if (minAmount) {
      filtered = filtered.filter(p => parseFloat(p.amount) >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(p => parseFloat(p.amount) <= parseFloat(maxAmount));
    }

    setFilteredPayments(filtered);
    setCurrentPage(0);
  };

  const applySortAndPagination = () => {
    let sorted = [...filteredPayments];

    // Sort
    sorted.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'paymentAt':
          aVal = new Date(a.paymentAt).getTime();
          bVal = new Date(b.paymentAt).getTime();
          break;
        case 'amount':
          aVal = parseFloat(a.amount);
          bVal = parseFloat(b.amount);
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'payType':
          aVal = a.payType;
          bVal = b.payType;
          break;
        case 'mchtCode':
          aVal = a.mchtName || a.mchtCode;
          bVal = b.mchtName || b.mchtCode;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Pagination
    setTotalPages(Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setDisplayPayments(sorted.slice(start, end));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleReset = () => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);
    
    setStartDate(lastMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setSelectedMerchant('');
    setSelectedPayType('');
    setSelectedStatus('');
    setMinAmount('');
    setMaxAmount('');
    setCurrentPage(0);
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSet = new Set(displayPayments.map(p => p.paymentCode));
      setSelectedPayments(newSet);
    } else {
      setSelectedPayments(new Set());
    }
  };

  const handleSelectPayment = (paymentCode: string, checked: boolean) => {
    const newSet = new Set(selectedPayments);
    if (checked) {
      newSet.add(paymentCode);
    } else {
      newSet.delete(paymentCode);
    }
    setSelectedPayments(newSet);
  };

  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDownloadCSV = () => {
    const headers = ['거래코드', '거래일시', '가맹점코드', '가맹점명', '금액', '통화', '결제수단', '상태'];
    const rows = filteredPayments.map(p => [
      p.paymentCode,
      formatDateTime(p.paymentAt),
      p.mchtCode,
      p.mchtName || '',
      p.amount,
      p.currency,
      getStatusText(p.payType),
      getStatusText(p.status),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `거래내역_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>거래 내역 조회 - Dashboard</title>
        <meta name="description" content="결제 거래 내역 관리" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">거래 내역 조회</h1>
          <p className="text-gray-600 mt-1">
            총 {filteredPayments.length.toLocaleString()}건의 거래
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">검색 및 필터</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showFilters ? '숨기기' : '보기'}
            </button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 시작일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 종료일
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSetToday}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    오늘
                  </button>
                </div>
              </div>

              {/* Filters Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏪 가맹점
                  </label>
                  <select
                    value={selectedMerchant}
                    onChange={(e) => setSelectedMerchant(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">전체</option>
                    {merchants.map(m => (
                      <option key={m.mchtCode} value={m.mchtCode}>{m.mchtName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💳 결제수단
                  </label>
                  <select
                    value={selectedPayType}
                    onChange={(e) => setSelectedPayType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">전체</option>
                    {payTypes.map(pt => (
                      <option key={pt.type} value={pt.type}>{pt.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📊 상태
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">전체</option>
                    {statuses.map(s => (
                      <option key={s.code} value={s.code}>{s.description}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount Range */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💰 최소 금액
                  </label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💰 최대 금액
                  </label>
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="999999999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    초기화
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Header Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            총 {filteredPayments.length.toLocaleString()}건 중 {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, filteredPayments.length)}건 표시
            {selectedPayments.size > 0 && (
              <span className="ml-2 text-primary-600 font-medium">
                ({selectedPayments.size}건 선택됨)
              </span>
            )}
          </div>
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV 다운로드
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={displayPayments.length > 0 && selectedPayments.size === displayPayments.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거래코드
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('paymentAt')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      거래일시
                      <SortIcon field="paymentAt" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('mchtCode')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      가맹점
                      <SortIcon field="mchtCode" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      금액
                      <SortIcon field="amount" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('payType')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      결제수단
                      <SortIcon field="payType" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      상태
                      <SortIcon field="status" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  displayPayments.map((payment) => (
                    <tr 
                      key={payment.paymentCode} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (!(target instanceof HTMLInputElement && target.type === 'checkbox')) {
                          handleRowClick(payment);
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedPayments.has(payment.paymentCode)}
                          onChange={(e) => handleSelectPayment(payment.paymentCode, e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                        {payment.paymentCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                        {formatDateTime(payment.paymentAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                        {payment.mchtName ? (
                          <>
                            <div>{payment.mchtName}</div>
                            <div className="text-xs text-gray-500">{payment.mchtCode}</div>
                          </>
                        ) : (
                          <div>{payment.mchtCode}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                        {formatCurrency(parseFloat(payment.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                        {getStatusText(payment.payType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${getStatusColor(payment.status)}`}>
                          {React.createElement(getStatusIcon(payment.status), {
                            size: 14,
                            className: getStatusIconColor(payment.status),
                            strokeWidth: 2.5,
                          })}
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ◀ 이전
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        } border border-gray-300 text-sm font-medium transition-colors`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 3 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages - 1)}
                        className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 text-sm font-medium"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  다음 ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
