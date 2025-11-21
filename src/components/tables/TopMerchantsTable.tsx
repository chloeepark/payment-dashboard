import React from 'react';
import { formatCurrency, formatNumber } from '@/utils/format';
import { TrendingUp } from 'lucide-react';

interface TopMerchant {
  mchtCode: string;
  mchtName: string;
  totalAmount: number;
  transactionCount: number;
  percent: number;
}

interface TopMerchantsTableProps {
  merchants: TopMerchant[];
}

const TopMerchantsTable: React.FC<TopMerchantsTableProps> = ({ merchants }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[400px] flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <TrendingUp className="w-4 h-4 text-primary-600 mr-2" />
          <h3 className="text-base font-semibold text-gray-900">Top 가맹점</h3>
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">
                순위
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                가맹점명
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                거래액
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">
                비중
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {merchants.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-500">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              merchants.map((merchant, index) => (
                <tr key={merchant.mchtCode} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{merchant.mchtName}</div>
                    <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{merchant.mchtCode}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-semibold text-gray-900">
                    {formatCurrency(merchant.totalAmount)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-100 text-primary-800">
                      {merchant.percent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopMerchantsTable;

