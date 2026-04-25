import React, { useState } from 'react';
import { RefreshCw, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { REFUNDS, type Refund, type RefundStatus } from '../../data/mockData';
import { StatusChip } from '../../components/clinic/StatusChip';
import { toPersian, formatPrice } from '../../utils/persian';

const MOCK_REFUNDS: Refund[] = [
  ...REFUNDS,
  {
    id: 'ref-002',
    bookingId: 'bk-007',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۷',
    patientName: 'سارا علوی',
    amount: 3_200_000,
    status: 'PROCESSING',
    reason: 'لغو توسط کلینیک — پزشک مریض شد',
    requestedAt: '2025-05-10T10:00:00Z',
  },
  {
    id: 'ref-003',
    bookingId: 'bk-008',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۸',
    patientName: 'علی رضوی',
    amount: 1_800_000,
    status: 'REQUESTED',
    reason: 'لغو توسط بیمار',
    requestedAt: '2025-05-10T14:30:00Z',
  },
  {
    id: 'ref-004',
    bookingId: 'bk-009',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۹',
    patientName: 'مریم سادات',
    amount: 2_100_000,
    status: 'FAILED',
    reason: 'خطای بانکی',
    requestedAt: '2025-05-09T08:00:00Z',
    processedAt: '2025-05-09T11:00:00Z',
  },
];

const STATUS_ICONS: Record<RefundStatus, React.ReactNode> = {
  REQUESTED: <Clock size={16} className="text-amber-600" />,
  PROCESSING: <RefreshCw size={16} className="text-blue-600" />,
  COMPLETED: <CheckCircle size={16} className="text-emerald-600" />,
  FAILED: <XCircle size={16} className="text-red-600" />,
};

export default function Refunds() {
  const [refunds] = useState(MOCK_REFUNDS);

  const totalPending = refunds.filter(r => r.status === 'REQUESTED' || r.status === 'PROCESSING').reduce((s, r) => s + r.amount, 0);
  const totalCompleted = refunds.filter(r => r.status === 'COMPLETED').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">مدیریت استردادها</h1>
          <p className="text-sm text-slate-500 mt-0.5">پیگیری و پردازش درخواست‌های استرداد</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'در انتظار پردازش', value: toPersian(refunds.filter(r => r.status === 'REQUESTED').length), color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'در حال پردازش', value: toPersian(refunds.filter(r => r.status === 'PROCESSING').length), color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'جمع معلق (تومان)', value: formatPrice(totalPending), color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'جمع تکمیل شده', value: formatPrice(totalCompleted), color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map((c, i) => (
          <div key={i} className={`${c.bg} border ${c.border} rounded-2xl p-4`}>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Refunds list */}
      <div className="space-y-4">
        {refunds.map(refund => (
          <div key={refund.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  refund.status === 'COMPLETED' ? 'bg-emerald-100' :
                  refund.status === 'PROCESSING' ? 'bg-blue-100' :
                  refund.status === 'FAILED' ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                  {STATUS_ICONS[refund.status]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{refund.patientName}</p>
                    <StatusChip status={refund.status} type="refund" size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 ltr">{refund.bookingNumber}</p>
                </div>
              </div>
              <div className="text-left flex-shrink-0">
                <p className="font-bold text-teal-700">{formatPrice(refund.amount)}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(refund.requestedAt).toLocaleDateString('fa-IR', { timeZone: 'Asia/Tehran' })}
                </p>
              </div>
            </div>

            <div className="mt-3 bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-600"><strong>دلیل:</strong> {refund.reason}</p>
            </div>

            {refund.refundRef && (
              <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle size={12} />
                کد استرداد: <span className="ltr font-mono">{refund.refundRef}</span>
              </div>
            )}

            {/* Actions */}
            {refund.status === 'REQUESTED' && (
              <div className="flex gap-2.5 mt-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold shadow-md shadow-teal-200 hover:bg-teal-700">
                  <RefreshCw size={12} />
                  پردازش استرداد
                </button>
                <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50">
                  رد درخواست
                </button>
              </div>
            )}

            {refund.status === 'FAILED' && (
              <div className="flex gap-2.5 mt-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200">
                  <AlertCircle size={12} />
                  تلاش مجدد
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
