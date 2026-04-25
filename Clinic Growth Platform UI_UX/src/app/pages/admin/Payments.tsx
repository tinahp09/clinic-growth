import React, { useState } from 'react';
import { Search, Download, RefreshCw, ExternalLink, Filter } from 'lucide-react';
import { TRANSACTIONS, type PaymentStatus } from '../../data/mockData';
import { StatusChip } from '../../components/clinic/StatusChip';
import { toPersian, formatPrice } from '../../utils/persian';

const STATUS_FILTERS: { value: PaymentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'همه' },
  { value: 'VERIFIED', label: 'تایید شده' },
  { value: 'REDIRECTED', label: 'در درگاه' },
  { value: 'PENDING_CALLBACK', label: 'در انتظار' },
  { value: 'FAILED', label: 'ناموفق' },
  { value: 'REFUNDED', label: 'برگشت داده شده' },
];

export default function Payments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  const totalVerified = TRANSACTIONS.filter(t => t.status === 'VERIFIED').reduce((sum, t) => sum + t.amount, 0);
  const totalRefunded = TRANSACTIONS.filter(t => t.status === 'REFUNDED').reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = TRANSACTIONS.filter(t => t.status === 'REDIRECTED' || t.status === 'PENDING_CALLBACK').length;

  const filtered = TRANSACTIONS.filter(t => {
    const matchSearch = !search || t.patientName.includes(search) || t.bookingNumber.includes(search);
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">تراکنش‌های پرداخت</h1>
          <p className="text-sm text-slate-500 mt-0.5">مدیریت و پیگیری پرداخت‌های زرین‌پال</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 shadow-sm">
          <Download size={15} />
          خروجی
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'کل تایید شده', value: formatPrice(totalVerified), color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'در حال پردازش', value: toPersian(pendingCount) + ' تراکنش', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'برگشت داده شده', value: formatPrice(totalRefunded), color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
          { label: 'تعداد کل', value: toPersian(TRANSACTIONS.length) + ' تراکنش', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100' },
        ].map((card, i) => (
          <div key={i} className={`${card.bg} border ${card.border} rounded-2xl p-4`}>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو نام بیمار یا شماره رزرو..."
              className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusFilter === f.value ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">شماره تراکنش</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">بیمار</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">شماره رزرو</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">مبلغ</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">Authority</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">تاریخ</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">وضعیت</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(txn => (
                <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-xs font-mono text-slate-600">{txn.id}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-800">{txn.patientName}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-mono text-slate-600 ltr">{txn.bookingNumber}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-teal-700">{formatPrice(txn.amount)}</td>
                  <td className="px-5 py-4">
                    {txn.authority ? (
                      <span className="text-xs font-mono text-slate-500 truncate max-w-[100px] block" title={txn.authority}>
                        {txn.authority.slice(0, 12)}...
                      </span>
                    ) : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {new Date(txn.createdAt).toLocaleDateString('fa-IR', { timeZone: 'Asia/Tehran' })}
                    <br />
                    <span className="text-xs text-slate-400 ltr">
                      {new Date(txn.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' })}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusChip status={txn.status} type="payment" size="sm" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {(txn.status === 'REDIRECTED' || txn.status === 'PENDING_CALLBACK') && (
                        <button className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="بررسی مجدد callback">
                          <RefreshCw size={13} />
                        </button>
                      )}
                      <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="مشاهده در زرین‌پال">
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
