import React from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronRight, Calendar, Clock, User, DoorOpen,
  Scissors, CheckCircle, AlertCircle,
} from 'lucide-react';
import { SERVICES, STAFF } from '../../data/mockData';
import { toPersian, formatPrice, formatDuration } from '../../utils/persian';

export default function BookingSummary() {
  const navigate = useNavigate();

  // Mock selected services (in real app, from context/state)
  const selectedServices = [SERVICES[0], SERVICES[2]];
  const selectedStaff = STAFF[0];
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button
            onClick={() => navigate('/client/time')}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
          <div>
            <h1 className="font-semibold text-slate-800">خلاصه رزرو</h1>
            <p className="text-xs text-slate-500">بررسی اطلاعات قبل از پرداخت</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Date & Time card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">زمان نوبت</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">پنجشنبه، ۱۵ اردیبهشت ۱۴۰۴</p>
              <p className="text-xs text-slate-400">Thursday, May 5, 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                ساعت ۱۱:۰۰ تا {formatDuration(totalDuration)} بعد
              </p>
              <p className="text-xs text-slate-400">مدت کل: {formatDuration(totalDuration)}</p>
            </div>
          </div>
        </div>

        {/* Staff & Room */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">پزشک و اتاق</p>
          <div className="flex items-center gap-3 mb-3">
            <img
              src={selectedStaff.avatar}
              alt={selectedStaff.name}
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <p className="font-medium text-slate-800">{selectedStaff.name}</p>
              <p className="text-xs text-slate-500">{selectedStaff.specialty}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <DoorOpen size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="font-medium text-slate-800">اتاق درمان ۱</p>
              <p className="text-xs text-slate-500">طبقه اول — در سمت چپ</p>
            </div>
          </div>
        </div>

        {/* Services list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">خدمات انتخابی</p>
          <div className="space-y-3">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Scissors size={13} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{service.name}</p>
                    <p className="text-xs text-slate-400">{formatDuration(service.duration)}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-800 flex-shrink-0">
                  {formatPrice(service.price)}
                </p>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">جمع کل</span>
              <span className="text-base font-bold text-teal-700">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Cancellation policy */}
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">قوانین لغو رزرو</p>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• لغو بیش از ۲۴ ساعت قبل: استرداد کامل</li>
                <li>• لغو ۲ تا ۲۴ ساعت قبل: استرداد ۵۰٪</li>
                <li>• لغو کمتر از ۲ ساعت قبل: بدون استرداد</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-slate-400 text-center px-4">
          با ادامه دادن، با{' '}
          <span className="text-teal-600 underline">قوانین و مقررات</span>{' '}
          کلینیک موافقت می‌کنید.
        </p>
      </div>

      {/* CTA */}
      <div className="sticky bottom-20 px-4 mb-4">
        <button
          onClick={() => navigate('/client/payment')}
          className="w-full bg-teal-600 text-white py-4 rounded-2xl font-semibold text-sm shadow-lg shadow-teal-200 hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} />
          تایید و پرداخت — {formatPrice(totalPrice)}
        </button>
      </div>
    </div>
  );
}
