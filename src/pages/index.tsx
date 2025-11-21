import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Wallet,
  Receipt,
  BadgeCheck,
  Store
} from 'lucide-react';
import StatsCard from '@/components/cards/StatsCard';
import PaymentTable from '@/components/tables/PaymentTable';
import PaymentTrendChart from '@/components/charts/PaymentTrendChart';
import PaymentMethodChart from '@/components/charts/PaymentMethodChart';
import StatusBarChart from '@/components/charts/StatusBarChart';
import TopMerchantsTable from '@/components/tables/TopMerchantsTable';
import { paymentApi, merchantApi } from '@/lib/api';
import { Payment } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/format';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalCount: 0,
    successRate: 0,
    activeMerchantCount: 0,
    amountTrend: 0,
    countTrend: 0,
    successRateTrend: 0,
    merchantTrend: 0,
  });
  const [statusData, setStatusData] = useState<Array<{
    status: string;
    count: number;
    amount: number;
  }>>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<Array<{
    payType: string;
    count: number;
    amount: number;
  }>>([]);
  const [topMerchants, setTopMerchants] = useState<Array<{
    mchtCode: string;
    mchtName: string;
    totalAmount: number;
    transactionCount: number;
    percent: number;
  }>>([]);
  const [trendData, setTrendData] = useState<Array<{
    date: string;
    amount: number;
    count: number;
  }>>([]);
  const [allTrendData, setAllTrendData] = useState<Array<{
    date: string;
    fullDate: string;
    amount: number;
    count: number;
  }>>([]);
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [totalPeriods, setTotalPeriods] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (allTrendData.length > 0) {
      updateTrendDataForPeriod(currentPeriodIndex);
    }
  }, [currentPeriodIndex]);

  const updateTrendDataForPeriod = (periodIndex: number) => {
    const DAYS_PER_PERIOD = 30;
    const startIdx = periodIndex * DAYS_PER_PERIOD;
    const endIdx = startIdx + DAYS_PER_PERIOD;
    const periodData = allTrendData.slice(startIdx, endIdx);
    setTrendData(periodData);
  };

  const handlePreviousPeriod = () => {
    if (currentPeriodIndex > 0) {
      setCurrentPeriodIndex(currentPeriodIndex - 1);
    }
  };

  const handleNextPeriod = () => {
    if (currentPeriodIndex < totalPeriods - 1) {
      setCurrentPeriodIndex(currentPeriodIndex + 1);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all payments
      const payments = await paymentApi.getPayments();
      const recent = await paymentApi.getRecentPayments(5);
      
      setRecentPayments(recent);

      // Calculate statistics
      const totalAmount = payments
        .filter(p => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const totalCount = payments.length;
      const successCount = payments.filter(p => p.status === 'SUCCESS').length;
      const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

      // Get merchant count (only active merchants)
      const merchants = await merchantApi.getMerchants();
      const activeMerchants = merchants.filter(m => m.status === 'ACTIVE');
      
      // Calculate trends (compare with first half vs second half of data)
      const midPoint = Math.floor(payments.length / 2);
      const firstHalf = payments.slice(0, midPoint);
      const secondHalf = payments.slice(midPoint);
      
      const firstHalfAmount = firstHalf
        .filter(p => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const secondHalfAmount = secondHalf
        .filter(p => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const firstHalfSuccessRate = firstHalf.length > 0 
        ? (firstHalf.filter(p => p.status === 'SUCCESS').length / firstHalf.length) * 100 
        : 0;
      const secondHalfSuccessRate = secondHalf.length > 0 
        ? (secondHalf.filter(p => p.status === 'SUCCESS').length / secondHalf.length) * 100 
        : 0;
      
      const amountTrend = firstHalfAmount > 0 
        ? ((secondHalfAmount - firstHalfAmount) / firstHalfAmount) * 100 
        : 0;
      const countTrend = firstHalf.length > 0 
        ? ((secondHalf.length - firstHalf.length) / firstHalf.length) * 100 
        : 0;
      const successRateTrend = firstHalfSuccessRate > 0
        ? ((secondHalfSuccessRate - firstHalfSuccessRate) / firstHalfSuccessRate) * 100
        : 0;
      
      setStats({
        totalAmount,
        totalCount,
        successRate,
        activeMerchantCount: activeMerchants.length,
        amountTrend,
        countTrend,
        successRateTrend,
        merchantTrend: 0, // Could compare with historical data if available
      });

      // Calculate status distribution
      const statusMap = new Map<string, { count: number; amount: number }>();
      payments.forEach(p => {
        const current = statusMap.get(p.status) || { count: 0, amount: 0 };
        statusMap.set(p.status, {
          count: current.count + 1,
          amount: current.amount + parseFloat(p.amount),
        });
      });

      const statusArray = Array.from(statusMap.entries()).map(([status, data]) => ({
        status,
        count: data.count,
        amount: data.amount,
      }));
      setStatusData(statusArray);

      // Calculate payment method distribution
      const methodMap = new Map<string, { count: number; amount: number }>();
      payments.forEach(p => {
        const current = methodMap.get(p.payType) || { count: 0, amount: 0 };
        methodMap.set(p.payType, {
          count: current.count + 1,
          amount: current.amount + parseFloat(p.amount),
        });
      });

      const methodArray = Array.from(methodMap.entries()).map(([payType, data]) => ({
        payType,
        count: data.count,
        amount: data.amount,
      }));
      setPaymentMethodData(methodArray);

      // Calculate top merchants by amount
      const merchantMap = new Map<string, { name: string; amount: number; count: number }>();
      payments.forEach(p => {
        const current = merchantMap.get(p.mchtCode) || { name: p.mchtName || p.mchtCode, amount: 0, count: 0 };
        merchantMap.set(p.mchtCode, {
          name: p.mchtName || p.mchtCode,
          amount: current.amount + parseFloat(p.amount),
          count: current.count + 1,
        });
      });

      const totalRevenue = Array.from(merchantMap.values()).reduce((sum, m) => sum + m.amount, 0);
      const topMerchantsArray = Array.from(merchantMap.entries())
        .map(([code, data]) => ({
          mchtCode: code,
          mchtName: data.name,
          totalAmount: data.amount,
          transactionCount: data.count,
          percent: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5);
      
      setTopMerchants(topMerchantsArray);

      // Generate trend data from actual payment dates
      // Group payments by date
      const dateMap = new Map<string, { amount: number; count: number }>();
      payments.forEach(p => {
        const dateStr = p.paymentAt.split('T')[0];
        const current = dateMap.get(dateStr) || { amount: 0, count: 0 };
        const paymentAmount = p.status === 'SUCCESS' ? parseFloat(p.amount) : 0;
        dateMap.set(dateStr, {
          amount: current.amount + paymentAmount,
          count: current.count + 1,
        });
      });

      // Get all dates and sort them
      const trendDates = Array.from(dateMap.keys()).sort();
      
      // Create full trend data array
      const fullTrendArray = trendDates.map(date => ({
        date: date.substring(5), // MM-DD
        fullDate: date,
        amount: dateMap.get(date)?.amount || 0,
        count: dateMap.get(date)?.count || 0,
      }));
      
      setAllTrendData(fullTrendArray);
      
      // Calculate total periods (30 days per period - monthly)
      const DAYS_PER_PERIOD = 30;
      const periods = Math.ceil(trendDates.length / DAYS_PER_PERIOD);
      setTotalPeriods(periods);
      
      // Show the most recent period by default
      const lastPeriodIndex = periods - 1;
      setCurrentPeriodIndex(lastPeriodIndex);
      
      // Get data for the last period
      const startIdx = lastPeriodIndex * DAYS_PER_PERIOD;
      const endIdx = startIdx + DAYS_PER_PERIOD;
      const lastPeriodData = fullTrendArray.slice(startIdx, endIdx);
      
      setTrendData(lastPeriodData);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
        <title>대시보드 - Dashboard</title>
        <meta name="description" content="결제/가맹점 대시보드" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-1">결제 및 가맹점 데이터 현황을 확인하세요</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="총 거래액"
            value={`₩${(stats.totalAmount / 1000).toFixed(0)}K`}
            subtitle="Total Revenue"
            icon={Wallet}
            trend={{
              value: Math.abs(stats.amountTrend),
              isPositive: stats.amountTrend >= 0,
            }}
            colorClass="bg-primary-600"
          />
          <StatsCard
            title="거래 건수"
            value={`${formatNumber(stats.totalCount)}건`}
            subtitle="Total Transactions"
            icon={Receipt}
            trend={{
              value: Math.abs(stats.countTrend),
              isPositive: stats.countTrend >= 0,
            }}
            colorClass="bg-success-600"
          />
          <StatsCard
            title="성공률"
            value={`${stats.successRate.toFixed(1)}%`}
            subtitle="Success Rate"
            icon={BadgeCheck}
            trend={{
              value: Math.abs(stats.successRateTrend),
              isPositive: stats.successRateTrend >= 0,
            }}
            colorClass="bg-warning-600"
          />
          <StatsCard
            title="활성 가맹점"
            value={`${formatNumber(stats.activeMerchantCount)}개`}
            subtitle="Active Merchants"
            icon={Store}
            trend={
              stats.merchantTrend !== 0
                ? {
                    value: Math.abs(stats.merchantTrend),
                    isPositive: stats.merchantTrend >= 0,
                  }
                : undefined
            }
            colorClass="bg-error-600"
          />
        </div>

        {/* Charts - 중단 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 일별 거래 추이 - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">일별 거래 추이</h3>
                  {allTrendData.length > 0 && currentPeriodIndex >= 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {allTrendData[currentPeriodIndex * 30]?.fullDate || ''} ~ {allTrendData[Math.min((currentPeriodIndex + 1) * 30 - 1, allTrendData.length - 1)]?.fullDate || ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousPeriod}
                    disabled={currentPeriodIndex === 0}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="이전 기간"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-600 min-w-[70px] text-center">
                    {allTrendData[currentPeriodIndex * 30]?.fullDate ? 
                      new Date(allTrendData[currentPeriodIndex * 30].fullDate).toLocaleDateString('ko-KR', { month: 'long' }) 
                      : `${currentPeriodIndex + 1}월`}
                  </span>
                  <button
                    onClick={handleNextPeriod}
                    disabled={currentPeriodIndex === totalPeriods - 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="다음 기간"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <PaymentTrendChart data={trendData} />
              </div>
            </div>
          </div>
          
          {/* 결제 수단별 비율 - 1/3 width */}
          <div>
            <PaymentMethodChart data={paymentMethodData} />
          </div>
        </div>

        {/* 거래 상태별 분포 + Top 가맹점 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 거래 상태별 분포 - 2/3 width */}
          <div className="lg:col-span-2">
            <StatusBarChart data={statusData} />
          </div>

          {/* Top 가맹점 - 1/3 width */}
          <div>
            <TopMerchantsTable merchants={topMerchants} />
          </div>
        </div>

        {/* 최근 거래 내역 - 전체 너비 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">최근 거래 내역</h2>
            <Link
              href="/payments"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              전체 보기 →
            </Link>
          </div>
          <PaymentTable payments={recentPayments} showPagination={false} />
        </div>
      </div>
    </>
  );
}
