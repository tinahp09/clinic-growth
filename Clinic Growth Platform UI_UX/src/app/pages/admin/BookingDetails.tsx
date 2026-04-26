import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ChevronRight, Calendar, Clock, User, DoorOpen, CreditCard,
  XCircle, RefreshCw, Phone, Edit, AlertTriangle, CheckCircle,
} from 'lucide-react';
import { BOOKINGS, BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../data/mockData';
import { StatusChip } from '../../components/clinic/StatusChip';
import { BookingTimeline, BookingEventLog } from '../../components/clinic/BookingTimeline';
import { toPersian, formatPrice } from '../../utils/persian';

export default function BookingDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const booking = BOOKINGS.find(b => b.id === id) || BOOKINGS[0];

  const events = [
    { label: `رزرو ایجاد شد`, date: new Date(booking.createdAt).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' }), type: 'info' as const },
    ...(booking.status !== 'CREATED' ? [{ label: 'اسلات رزرو موقت شد (۱۵ دقیقه)', date: new Date(booking.createdAt).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' }), type: 'info' as const }] : []),
    ...(booking.paymentStatus ? [{ label: `پرداخت شروع شد — ${PAYMENT_STATUS_LABELS[booking.paymentStatus]}`, date: new Date(booking.createdAt).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' }), type: 'info' as const }] : []),
    ...(booking.status === 'CONFIRMED' ? [{ label: 'پرداخت تایید شد — رزرو قطعی شد', date: new Date(booking.createdAt).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' }), type: 'success' as const }] : []),
    ...(booking.status === 'CANCELLED' ? [{ label: `رزرو لغو شد: ${booking.cancelReason || 'نامشخص'}`, date: new Date(booking.createdAt).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' }), type: 'error' as const }] : []),
  ];

  if (showCancelModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" dir="rtl">
        <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-3">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">لغو رزرو</h3>
            <p className="text-sm text-slate-500 mt-1">
              آیا از لغو رزرو {booking.bookingNumber} مطمئنید؟
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 mb-5 border border-amber-100">
            <p className="text-xs text-amber-700">
              <strong>استرداد:</strong> مبلغ {formatPrice(booking.totalAmount)} بازگشت داده می‌شود
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium"
            >
              انصراف
            </button>
            <button
              onClick={() => { setCancelled(true); setShowCancelModal(false); }}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-200"
            >
              لغو و استرداد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/bookings')}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">{booking.bookingNumber}</h1>
            <StatusChip status={cancelled ? 'CANCELLED' : booking.status} type="booking" />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{booking.patientName}</p>
        </div>
        {(booking.status === 'CONFIRMED' && !cancelled) && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <XCircle size={15} />
              لغو رزرو
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm"
            >
              <Edit size={15} />
              ویرایش
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4">وضعیت رزرو</h3>
            <BookingTimeline bookingStatus={cancelled ? 'CANCELLED' : booking.status} />
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4">خدمات</h3>
            <div className="space-y-3">
              {booking.services.map(service => (
                <div key={service.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <CheckCircle size={14} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{service.name}</p>
                      <p className="text-xs text-slate-500">{service.duration} دقیقه</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-teal-700">{formatPrice(service.price)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="font-semibold text-slate-700">جمع کل</span>
                <span className="text-base font-bold text-teal-700">{formatPrice(booking.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Event log */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4">تاریخچه رویدادها</h3>
            <BookingEventLog events={events} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Patient info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">اطلاعات زیباجو</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-teal-700" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{booking.patientName}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 ltr">
                  <Phone size={11} />
                  {booking.patientPhone}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">جزئیات نوبت</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={15} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">تاریخ</p>
                  <p className="text-slate-800 font-medium">
                    {new Date(booking.dateTime).toLocaleDateString('fa-IR', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                      timeZone: 'Asia/Tehran',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={15} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">ساعت</p>
                  <p className="text-slate-800 font-medium">
                    {new Date(booking.dateTime).toLocaleTimeString('fa-IR', {
                      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User size={15} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">پزشک</p>
                  <p className="text-slate-800 font-medium">{booking.staffName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DoorOpen size={15} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">اتاق</p>
                  <p className="text-slate-800 font-medium">{booking.roomName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment info */}
          {booking.paymentStatus && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-3">اطلاعات پرداخت</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">وضعیت</span>
                  <StatusChip status={booking.paymentStatus} type="payment" size="sm" />
                </div>
                {booking.paymentRef && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">کد پرداخت</span>
                    <span className="text-slate-700 font-medium ltr text-xs">{booking.paymentRef}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">مبلغ</span>
                  <span className="font-bold text-teal-700">{formatPrice(booking.totalAmount)}</span>
                </div>
              </div>
              {booking.status === 'CONFIRMED' && !cancelled && (
                <button className="mt-3 w-full flex items-center justify-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors">
                  <RefreshCw size={14} />
                  درخواست استرداد
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
