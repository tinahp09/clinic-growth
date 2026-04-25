import React from 'react';
import { useNavigate } from 'react-router';
import {
  CheckCircle, Calendar, Clock, User, QrCode,
  Share2, Download, MessageSquare, ChevronLeft,
} from 'lucide-react';
import { toPersian, formatPrice } from '../../utils/persian';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const bookingNumber = 'CGP-۱۴۰۴-۰۰۲۴';

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Success header */}
      <div className="bg-gradient-to-b from-teal-600 to-teal-700 pt-10 pb-16 px-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-4 ring-4 ring-white/30">
          <CheckCircle size={32} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">رزرو تایید شد!</h1>
        <p className="text-teal-100 text-sm mt-1">پرداخت با موفقیت انجام شد</p>
      </div>

      {/* Ticket card */}
      <div className="mx-4 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          {/* Ticket top */}
          <div className="p-5 bg-teal-50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-teal-600 font-medium">شماره رزرو</span>
              <span className="text-xs text-slate-400">کد پیگیری</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-teal-800 ltr">{bookingNumber}</span>
              <div className="w-12 h-12">
                {/* QR Code placeholder */}
                <div className="w-12 h-12 bg-white rounded-xl grid grid-cols-3 gap-0.5 p-1 border border-teal-200">
                  {Array.from({length: 9}).map((_, i) => (
                    <div key={i} className={`rounded-sm ${
                      [0,2,3,5,6,8].includes(i) ? 'bg-teal-700' : 'bg-white'
                    }`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider with notch */}
          <div className="relative flex items-center py-0">
            <div className="absolute -right-3 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-100" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-3" />
            <div className="absolute -left-3 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-100" />
          </div>

          {/* Ticket body */}
          <div className="p-5 space-y-4">
            {/* Date */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">تاریخ</p>
                <p className="font-semibold text-slate-800 text-sm">پنجشنبه، ۱۵ اردیبهشت ۱۴۰۴</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">ساعت</p>
                <p className="font-semibold text-slate-800 text-sm">۱۱:۰۰ — مدت: ۱ ساعت و ۴۵ دقیقه</p>
              </div>
            </div>

            {/* Doctor */}
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1673865641073-4479f93a7776?w=80"
                alt=""
                className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
              />
              <div>
                <p className="text-xs text-slate-400">پزشک</p>
                <p className="font-semibold text-slate-800 text-sm">دکتر نیلوفر رضایی</p>
              </div>
            </div>

            {/* Services */}
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-2">خدمات</p>
              <div className="space-y-1.5">
                {['مزوتراپی پوست — ۶۰ دقیقه', 'تزریق بوتاکس — ۴۵ دقیقه'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <div>
                <p className="text-xs text-emerald-600">پرداخت انجام شد</p>
                <p className="font-bold text-emerald-800">{formatPrice(5_000_000)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-600">کد پرداخت</p>
                <p className="text-xs font-medium text-emerald-700 ltr">ZP-98765432</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 mt-6 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-2xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            <Share2 size={16} className="text-teal-600" />
            اشتراک‌گذاری
          </button>
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-2xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            <Download size={16} className="text-teal-600" />
            ذخیره
          </button>
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-2xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            <Calendar size={16} className="text-teal-600" />
            افزودن به تقویم
          </button>
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-2xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            <MessageSquare size={16} className="text-teal-600" />
            یادآوری SMS
          </button>
        </div>

        <button
          onClick={() => navigate('/client/appointments')}
          className="w-full bg-teal-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
        >
          مشاهده نوبت‌هایم
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => navigate('/client')}
          className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-2xl font-medium text-sm"
        >
          بازگشت به خانه
        </button>
      </div>
    </div>
  );
}
