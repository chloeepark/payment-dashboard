import React from 'react';
import Link from 'next/link';
import { Store, TrendingUp } from 'lucide-react';
import { Merchant } from '@/types';
import { formatCurrency, formatNumber, getStatusColor, getStatusText } from '@/utils/format';

interface MerchantCardProps {
  merchant: Merchant;
}

const MerchantCard: React.FC<MerchantCardProps> = ({ merchant }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow h-[280px] flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
            <Store className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{merchant.mchtName}</h3>
            <p className="text-xs text-gray-500 truncate">{merchant.mchtCode}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-sm flex-shrink-0">
          {getStatusIcon(merchant.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(merchant.status)}`}>
            {getStatusText(merchant.status)}
          </span>
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 truncate">{merchant.bizType}</p>
      </div>

      <div className="border-t border-gray-200 pt-3 mb-3 flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">거래 건수</span>
          <span className="text-sm font-semibold text-gray-900">
            {merchant.transactionCount ? formatNumber(merchant.transactionCount) : 0}건
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">총 거래액</span>
          <span className="text-base font-bold text-primary-600">
            {merchant.totalAmount ? formatCurrency(merchant.totalAmount) : '₩0'}
          </span>
        </div>
      </div>

      <Link
        href={`/merchants/${merchant.mchtCode}`}
        className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium mt-auto"
      >
        상세보기
      </Link>
    </div>
  );
};

export default MerchantCard;

