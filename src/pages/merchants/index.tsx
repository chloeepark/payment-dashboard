import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Search, LayoutGrid, List, RefreshCw } from 'lucide-react';
import MerchantCard from '@/components/cards/MerchantCard';
import MerchantTable from '@/components/tables/MerchantTable';
import { merchantApi, paymentApi } from '@/lib/api';
import { Merchant } from '@/types';

type ViewMode = 'card' | 'table';
const ITEMS_PER_PAGE = 20;

export default function MerchantsPage() {
  const [loading, setLoading] = useState(true);
  const [allMerchants, setAllMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [displayMerchants, setDisplayMerchants] = useState<Merchant[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadMerchants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allMerchants, searchKeyword]);

  useEffect(() => {
    updateDisplayMerchants();
  }, [filteredMerchants, currentPage]);

  const loadMerchants = async () => {
    try {
      setLoading(true);
      const merchantList = await merchantApi.getMerchants();
      const payments = await paymentApi.getPayments();
      
      // Enrich merchants with transaction data
      const enrichedMerchants = merchantList.map((merchant) => {
        const merchantPayments = payments.filter(p => p.mchtCode === merchant.mchtCode);
        return {
          ...merchant,
          transactionCount: merchantPayments.length,
          totalAmount: merchantPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
        };
      });

      setAllMerchants(enrichedMerchants);
    } catch (error) {
      console.error('Failed to load merchants:', error);
      setAllMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allMerchants];

    // Search filter
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(m => 
        m.mchtName.toLowerCase().includes(keyword) ||
        m.mchtCode.toLowerCase().includes(keyword) ||
        m.bizType.toLowerCase().includes(keyword)
      );
    }

    setFilteredMerchants(filtered);
    setCurrentPage(0);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
  };

  const updateDisplayMerchants = () => {
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setDisplayMerchants(filteredMerchants.slice(start, end));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSearchKeyword('');
    setCurrentPage(0);
  };

  if (loading && allMerchants.length === 0) {
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
        <title>가맹점 관리 - Dashboard</title>
        <meta name="description" content="가맹점 정보 관리" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">가맹점 관리</h1>
          <p className="text-gray-600 mt-1">
            총 {filteredMerchants.length.toLocaleString()}개의 가맹점
          </p>
        </div>

        {/* Search and View Mode */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg border transition-colors ${
                  viewMode === 'card'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                title="카드 뷰"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg border transition-colors ${
                  viewMode === 'table'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                title="테이블 뷰"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="가맹점명, 코드, 업종으로 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              초기화
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayMerchants.length === 0 ? (
                  <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </div>
                ) : (
                  displayMerchants.map((merchant) => (
                    <MerchantCard key={merchant.mchtCode} merchant={merchant} />
                  ))
                )}
              </div>
            ) : (
              <MerchantTable
                merchants={displayMerchants}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* Pagination for Card View */}
        {viewMode === 'card' && totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
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
                      onClick={() => handlePageChange(pageNum)}
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
                      onClick={() => handlePageChange(totalPages - 1)}
                      className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 text-sm font-medium"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                다음 ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
