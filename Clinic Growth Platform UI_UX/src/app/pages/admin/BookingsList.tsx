import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { BOOKINGS, type BookingStatus } from '../../data/mockData';
import { StatusChip } from '../../components/clinic/StatusChip';
import { toPersian, formatPrice } from '../../utils/persian';

const STATUS_FILTERS: { value: BookingStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'همه' },
  { value: 'CONFIRMED', label: 'تایید شده' },
  { value: 'RESERVED', label: 'رزرو موقت' },
  { value: 'PENDING_PAYMENT', label: 'در انتظار پرداخت' },
  { value: 'CANCELLED', label: 'لغو شده' },
  { value: 'FAILED_PAYMENT', label: 'پرداخت ناموفق' },
];

export default function BookingsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = BOOKINGS.filter(b => {
    const matchesSearch =
      !search ||
      b.patientName.includes(search) ||
      b.bookingNumber.includes(search) ||
      b.patientPhone.includes(search);
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">لیست رزروها</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {toPersian(filtered.length)} رزرو یافت شد
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 shadow-sm">
          <Download size={15} />
          خروجی Excel
        </button>
      </div>

      {/* Search & filter bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو نام بیمار، شماره رزرو، تلفن..."
              className="w-full border border-slate-200 rounded-xl pr-9 pl-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || statusFilter !== 'ALL'
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={15} />
            فیلتر
            {statusFilter !== 'ALL' && (
              <span className="w-2 h-2 bg-teal-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Status filter chips */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">شماره رزرو</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">بیمار</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">خدمات</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">پزشک</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">تاریخ</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">مبلغ</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">وضعیت</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                    رزروی یافت نشد
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-medium text-slate-600 ltr">
                        {booking.bookingNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{booking.patientName}</p>
                        <p className="text-xs text-slate-400 ltr">{booking.patientPhone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600 max-w-[140px] truncate">
                        {booking.services.map(s => s.name).join('، ')}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {booking.staffName.replace('دکتر ', 'دکتر\u00A0')}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(booking.dateTime).toLocaleDateString('fa-IR', {
                        timeZone: 'Asia/Tehran',
                        year: 'numeric', month: '2-digit', day: '2-digit',
                      })}
                      <br />
                      <span className="text-xs text-slate-400">
                        {new Date(booking.dateTime).toLocaleTimeString('fa-IR', {
                          timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {formatPrice(booking.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusChip status={booking.status} type="booking" size="sm" />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                        className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs font-medium bg-teal-50 px-2.5 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        <Eye size={13} />
                        جزئیات
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            نمایش {toPersian(1)}-{toPersian(filtered.length)} از {toPersian(filtered.length)}
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30" disabled>
              <ChevronRight size={16} />
            </button>
            <button className="w-8 h-8 bg-teal-600 text-white rounded-lg text-sm font-medium">
              {toPersian(1)}
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30" disabled>
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
