import React from 'react';
import { X } from 'lucide-react';
import { Payment } from '@/types';
import { formatCurrency, formatDateTime, getStatusColor, getStatusText } from '@/utils/format';

interface PaymentDetailModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({ payment, isOpen, onClose }) => {
  if (!isOpen || !payment) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '🟢';
      case 'PENDING':
        return '🟡';
      case 'FAILED':
        return '🔴';
      case 'CANCELLED':
        return '⚪';
      default:
        return '⚫';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">거래 상세 정보</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* 거래 정보 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">거래 정보</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">거래 코드</span>
                  <span className="text-sm font-medium text-gray-900">{payment.paymentCode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">거래 일시</span>
                  <span className="text-sm font-medium text-gray-900">{formatDateTime(payment.paymentAt)}</span>
                </div>
              </div>
            </div>

            {/* 가맹점 정보 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">가맹점 정보</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">가맹점 코드</span>
                  <span className="text-sm font-medium text-gray-900">{payment.mchtCode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">가맹점명</span>
                  <span className="text-sm font-medium text-gray-900">{payment.mchtName || '-'}</span>
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">결제 정보</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">결제 금액</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(parseFloat(payment.amount))} ({payment.currency})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">결제 수단</span>
                  <span className="text-sm font-medium text-gray-900">{getStatusText(payment.payType)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">거래 상태</span>
                  <span className="flex items-center gap-2">
                    <span>{getStatusIcon(payment.status)}</span>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentDetailModal;

