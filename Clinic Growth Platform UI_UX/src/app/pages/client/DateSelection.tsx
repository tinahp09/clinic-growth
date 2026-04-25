import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Info, Calendar } from 'lucide-react';
import { JalaliCalendarPicker } from '../../components/clinic/JalaliCalendarPicker';
import { JALALI_MONTHS, toPersian, formatJalali, fromJalali } from '../../utils/persian';

export default function DateSelection() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<{
    jy: number; jm: number; jd: number; date: Date
  } | null>(null);

  const handleContinue = () => {
    if (!selectedDate) return;
    navigate('/client/time');
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button
            onClick={() => navigate('/client/services')}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <div>
            <h1 className="font-semibold text-slate-800">انتخاب تاریخ</h1>
            <p className="text-xs text-slate-500">یک روز مناسب انتخاب کنید</p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1">
            {[
              { label: 'خدمات', done: true },
              { label: 'تاریخ', done: false, active: true },
              { label: 'ساعت', done: false },
              { label: 'پرداخت', done: false },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1 ${step.active ? 'text-teal-600' : step.done ? 'text-teal-500' : 'text-slate-300'}`}>
                  <div className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium ${
                    step.done ? 'bg-teal-600 text-white' :
                    step.active ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {step.done ? '✓' : toPersian(i + 1)}
                  </div>
                  <span className="text-xs hidden sm:block">{step.label}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-px ${step.done ? 'bg-teal-300' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-4 py-4">
        <JalaliCalendarPicker
          selectedDate={selectedDate}
          onSelect={(date) => setSelectedDate(date)}
          closedDays={[6]} // Fridays closed
        />
      </div>

      {/* Selected date display */}
      {selectedDate && (
        <div className="mx-4 mb-3">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex flex-col items-center justify-center text-white">
              <span className="text-lg font-bold leading-none">{toPersian(selectedDate.jd)}</span>
              <span className="text-xs opacity-80">{JALALI_MONTHS[selectedDate.jm - 1].slice(0, 3)}</span>
            </div>
            <div>
              <p className="font-semibold text-teal-800">
                {formatJalali(selectedDate.date, 'full')}
              </p>
              <p className="text-xs text-teal-600 mt-0.5">
                {selectedDate.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mx-4 mb-4 flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
        <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          کلینیک شنبه تا پنجشنبه، ساعت ۸ تا ۲۰ پذیرش دارد.
          روزهای تعطیل رسمی با رنگ قرمز مشخص شده‌اند.
        </p>
      </div>

      {/* CTA */}
      <div className="sticky bottom-20 px-4 mb-4">
        <button
          onClick={handleContinue}
          disabled={!selectedDate}
          className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all ${
            selectedDate
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {selectedDate ? 'ادامه — انتخاب ساعت' : 'ابتدا تاریخ را انتخاب کنید'}
        </button>
      </div>
    </div>
  );
}
