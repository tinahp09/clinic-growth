import React, { useState } from 'react';
import { Calendar, Clock, User, ChevronLeft, AlertCircle, X, RotateCcw } from 'lucide-react';
import { BOOKINGS, type Booking } from '../../data/mockData';
import { StatusChip } from '../../components/clinic/StatusChip';
import { toPersian, formatPrice } from '../../utils/persian';

type TabType = 'upcoming' | 'past' | 'cancelled';

// Cancel modal
function CancelModal({
  booking,
  onClose,
  onConfirm,
}: {
  booking: Booking;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const canCancel = true; // In real app, check cancellation policy
  const refundPercent = 100; // Based on timing

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800">لغو رزرو</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-slate-700 mb-1">{booking.bookingNumber}</p>
          <p className="text-xs text-slate-500">{booking.staffName} — {booking.services.map(s=>s.name).join('، ')}</p>
        </div>

        {canCancel ? (
          <>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw size={15} className="text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700">استرداد {toPersian(refundPercent)}٪</p>
              </div>
              <p className="text-xs text-emerald-600">
                مبلغ {formatPrice(booking.totalAmount)} ظرف ۳-۵ روز کاری به حساب شما برمی‌گردد.
              </p>
            </div>
            <p className="text-xs text-slate-500 mb-4 text-center">
              آیا از لغو این نوبت مطمئنید؟
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-medium text-sm"
              >
                انصراف
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-red-600 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg shadow-red-200"
              >
                لغو نوبت
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">لغو مجاز نیست</p>
                  <p className="text-xs text-red-600 mt-1">
                    لغو کمتر از ۲ ساعت قبل از نوبت امکان‌پذیر نیست.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-medium text-sm"
            >
              بستن
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel?: () => void }) {
  const dateStr = new Date(booking.dateTime).toLocaleDateString('fa-IR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Tehran',
  });
  const timeStr = new Date(booking.dateTime).toLocaleTimeString('fa-IR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      {/* Status + booking number */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 ltr">{booking.bookingNumber}</span>
        <StatusChip status={booking.status} type="booking" size="sm" />
      </div>

      {/* Doctor */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
          <User size={14} className="text-teal-700" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{booking.staffName}</p>
          <p className="text-xs text-slate-400">{booking.services.map(s => s.name).join(' + ')}</p>
        </div>
        <ChevronLeft size={16} className="text-slate-300 mr-auto" />
      </div>

      {/* Date & time */}
      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2.5">
        <Calendar size={14} className="text-slate-500 flex-shrink-0" />
        <span className="text-sm text-slate-700">{dateStr}</span>
        <span className="text-slate-300">|</span>
        <Clock size={14} className="text-slate-500 flex-shrink-0" />
        <span className="text-sm text-slate-700">{timeStr}</span>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-slate-500">مبلغ پرداخت شده</span>
        <span className="text-sm font-bold text-teal-700">{formatPrice(booking.totalAmount)}</span>
      </div>

      {/* Cancel button for upcoming */}
      {onCancel && booking.status === 'CONFIRMED' && (
        <button
          onClick={onCancel}
          className="w-full mt-3 border border-red-200 text-red-600 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
        >
          لغو نوبت
        </button>
      )}

      {booking.cancelReason && (
        <div className="mt-3 bg-red-50 rounded-xl p-2.5 flex items-start gap-2">
          <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{booking.cancelReason}</p>
        </div>
      )}
    </div>
  );
}

export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState(BOOKINGS);

  const upcoming = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'RESERVED' || b.status === 'PENDING_PAYMENT');
  const past = bookings.filter(b => b.status === 'CONFIRMED' && new Date(b.dateTime) < new Date());
  const cancelled = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'EXPIRED' || b.status === 'FAILED_PAYMENT');

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'upcoming', label: 'پیش‌رو', count: upcoming.length },
    { key: 'past', label: 'گذشته', count: past.length },
    { key: 'cancelled', label: 'لغو شده', count: cancelled.length },
  ];

  const currentList = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : cancelled;

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    setBookings(prev => prev.map(b =>
      b.id === cancelTarget.id ? { ...b, status: 'CANCELLED' as const, cancelReason: 'درخواست بیمار' } : b
    ));
    setCancelTarget(null);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-xl font-bold text-slate-800">نوبت‌هایم</h1>
          <p className="text-sm text-slate-400 mt-0.5">مدیریت رزروهای شما</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {toPersian(tab.count)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 py-4 space-y-3">
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Calendar size={28} className="text-slate-300" />
            </div>
            <p className="font-medium text-slate-600 mb-1">نوبتی وجود ندارد</p>
            <p className="text-sm text-slate-400">
              {activeTab === 'upcoming' ? 'رزرو جدیدی انجام دهید' : 'هنوز سابقه‌ای ثبت نشده'}
            </p>
          </div>
        ) : (
          currentList.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={activeTab === 'upcoming' ? () => setCancelTarget(booking) : undefined}
            />
          ))
        )}
      </div>

      {/* Cancel modal */}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancelConfirm}
        />
      )}
    </div>
  );
}
