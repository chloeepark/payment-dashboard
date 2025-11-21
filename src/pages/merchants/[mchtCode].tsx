import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Store, Phone, Mail, MapPin, Calendar, TrendingUp, CreditCard, CheckCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { merchantApi, paymentApi } from '@/lib/api';
import { MerchantDetail, Payment } from '@/types';
import { formatCurrency, formatNumber, formatDate, getStatusColor, getStatusText } from '@/utils/format';

export default function MerchantDetailPage() {
  const router = useRouter();
  const { mchtCode } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalCount: 0,
    successRate: 0,
  });
  const [monthlyData, setMonthlyData] = useState<Array<{
    month: string;
    amount: number;
    count: number;
  }>>([]);

  useEffect(() => {
    if (mchtCode && typeof mchtCode === 'string') {
      loadMerchantDetail(mchtCode);
    }
  }, [mchtCode]);

  const loadMerchantDetail = async (code: string) => {
    try {
      setLoading(true);
      
      const [merchantData, allPayments] = await Promise.all([
        merchantApi.getMerchantById(code),
        paymentApi.getPayments(),
      ]);
      
      setMerchant(merchantData);
      
      // Filter payments for this merchant
      const merchantPayments = allPayments.filter(p => p.mchtCode === code);
      setPayments(merchantPayments);
      
      // Calculate statistics (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentPayments = merchantPayments.filter(p => 
        new Date(p.paymentAt) >= thirtyDaysAgo
      );
      
      const totalAmount = recentPayments
        .filter(p => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const successCount = recentPayments.filter(p => p.status === 'SUCCESS').length;
      const successRate = recentPayments.length > 0 
        ? (successCount / recentPayments.length) * 100 
        : 0;
      
      setStats({
        totalAmount,
        totalCount: recentPayments.length,
        successRate,
      });
      
      // Calculate monthly data
      const monthMap = new Map<string, { amount: number; count: number }>();
      
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(monthKey, { amount: 0, count: 0 });
      }
      
      merchantPayments.forEach(p => {
        const date = new Date(p.paymentAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthMap.has(monthKey)) {
          const current = monthMap.get(monthKey)!;
          const amount = p.status === 'SUCCESS' ? parseFloat(p.amount) : 0;
          monthMap.set(monthKey, {
            amount: current.amount + amount,
            count: current.count + 1,
          });
        }
      });
      
      const monthlyArray = Array.from(monthMap.entries()).map(([month, data]) => ({
        month: month.substring(5) + '월',
        amount: data.amount,
        count: data.count,
      }));
      
      setMonthlyData(monthlyArray);
      
    } catch (error) {
      console.error('Failed to load merchant detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '🟢';
      case 'INACTIVE':
        return '⚪';
      case 'READY':
        return '🟡';
      case 'CLOSED':
        return '🔴';
      default:
        return '⚫';
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

  if (!merchant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">가맹점 정보를 찾을 수 없습니다.</p>
          <Link
            href="/merchants"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // Recent 10 payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paymentAt).getTime() - new Date(a.paymentAt).getTime())
    .slice(0, 10);

  return (
    <>
      <Head>
        <title>{merchant.mchtName} - 가맹점 상세 - Dashboard</title>
      </Head>

      <div className="space-y-6">
        {/* Back Button */}
        <div>
          <Link
            href="/merchants"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Store className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{merchant.mchtName}</h1>
                <p className="text-gray-600 mt-1">({merchant.mchtCode})</p>
              </div>
            </div>
            <span className="flex items-center gap-2">
              {getStatusIcon(merchant.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(merchant.status)}`}>
                {getStatusText(merchant.status)}
              </span>
            </span>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📋 기본 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Store className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">사업자번호</p>
                <p className="text-sm font-medium text-gray-900">{merchant.bizNo}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">업종</p>
                <p className="text-sm font-medium text-gray-900">{merchant.bizType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">주소</p>
                <p className="text-sm font-medium text-gray-900">{merchant.address || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">전화번호</p>
                <p className="text-sm font-medium text-gray-900">{merchant.phone || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">이메일</p>
                <p className="text-sm font-medium text-gray-900">{merchant.email || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">등록일</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(merchant.registeredAt, 'yyyy-MM-dd')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📊 거래 통계 <span className="text-sm font-normal text-gray-500">(최근 30일)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 거래액</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">거래 건수</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalCount)}건</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">성공률</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📈 월별 거래 추이
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === '거래금액') {
                    return formatCurrency(value);
                  }
                  return `${value}건`;
                }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="amount"
                name="거래금액"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="count"
                name="거래건수"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              📋 최근 거래 내역 <span className="text-sm font-normal text-gray-500">(10건)</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거래코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거래일시
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제수단
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      거래 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((payment) => (
                    <tr key={payment.paymentCode} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.paymentCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(payment.paymentAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(parseFloat(payment.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {getStatusText(payment.payType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

