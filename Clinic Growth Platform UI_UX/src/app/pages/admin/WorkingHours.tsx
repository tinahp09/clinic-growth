import React, { useState } from 'react';
import { Clock, Plus, X, Calendar, Save } from 'lucide-react';
import { JalaliCalendarPicker } from '../../components/clinic/JalaliCalendarPicker';
import { toPersian, JALALI_MONTHS } from '../../utils/persian';

const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

interface DaySchedule {
  day: string;
  isOpen: boolean;
  start: string;
  end: string;
  breaks: { start: string; end: string }[];
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 'شنبه', isOpen: true, start: '08:00', end: '20:00', breaks: [{ start: '13:00', end: '14:30' }] },
  { day: 'یکشنبه', isOpen: true, start: '08:00', end: '20:00', breaks: [{ start: '13:00', end: '14:30' }] },
  { day: 'دوشنبه', isOpen: true, start: '08:00', end: '20:00', breaks: [{ start: '13:00', end: '14:30' }] },
  { day: 'سه‌شنبه', isOpen: true, start: '08:00', end: '20:00', breaks: [{ start: '13:00', end: '14:30' }] },
  { day: 'چهارشنبه', isOpen: true, start: '08:00', end: '20:00', breaks: [{ start: '13:00', end: '14:30' }] },
  { day: 'پنجشنبه', isOpen: true, start: '08:00', end: '17:00', breaks: [] },
  { day: 'جمعه', isOpen: false, start: '09:00', end: '13:00', breaks: [] },
];

const HOLIDAYS = [
  { date: '۱ فروردین', name: 'نوروز (روز اول)' },
  { date: '۲ فروردین', name: 'نوروز (روز دوم)' },
  { date: '۱۳ فروردین', name: 'سیزده‌به‌در' },
  { date: '۱۴ خرداد', name: 'رحلت امام خمینی' },
  { date: '۱۵ خرداد', name: 'قیام ۱۵ خرداد' },
  { date: '۲۲ بهمن', name: 'پیروزی انقلاب' },
];

export default function WorkingHours() {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [selectedException, setSelectedException] = useState<{ jy: number; jm: number; jd: number } | null>(null);
  const [saved, setSaved] = useState(false);

  const toggleDay = (i: number) => {
    setSchedule(prev => prev.map((d, idx) => idx === i ? { ...d, isOpen: !d.isOpen } : d));
  };

  const updateTime = (i: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">ساعات کاری و تعطیلات</h1>
          <p className="text-sm text-slate-500 mt-0.5">تنظیم زمان‌بندی کلینیک</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-teal-600 text-white shadow-md shadow-teal-200 hover:bg-teal-700'
          }`}
        >
          <Save size={15} />
          {saved ? 'ذخیره شد ✓' : 'ذخیره تغییرات'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-teal-600" />
            برنامه هفتگی
          </h3>

          <div className="space-y-3">
            {schedule.map((day, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-4 transition-colors ${
                  day.isOpen ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => toggleDay(i)}
                      className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative ${
                        day.isOpen ? 'bg-teal-500' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                        day.isOpen ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </div>
                    <span className={`font-medium text-sm ${day.isOpen ? 'text-slate-800' : 'text-slate-400'}`}>
                      {day.day}
                    </span>
                    {i === 6 && (
                      <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100">
                        تعطیل رسمی
                      </span>
                    )}
                  </div>
                  {day.isOpen && (
                    <span className="text-xs text-teal-600 font-medium">
                      {toPersian(
                        Math.floor(
                          (parseInt(day.end.split(':')[0]) * 60 + parseInt(day.end.split(':')[1]) -
                           parseInt(day.start.split(':')[0]) * 60 - parseInt(day.start.split(':')[1])) / 60
                        )
                      )} ساعت کاری
                    </span>
                  )}
                </div>

                {day.isOpen && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-slate-500">از</label>
                      <input
                        type="time"
                        value={day.start}
                        onChange={e => updateTime(i, 'start', e.target.value)}
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr"
                      />
                    </div>
                    <span className="text-slate-300">—</span>
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-slate-500">تا</label>
                      <input
                        type="time"
                        value={day.end}
                        onChange={e => updateTime(i, 'end', e.target.value)}
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr"
                      />
                    </div>
                  </div>
                )}

                {!day.isOpen && (
                  <p className="text-xs text-slate-400 mr-14">رزرو در این روز غیرفعال است</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Exceptions calendar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-teal-600" />
              تعطیلات استثنایی
            </h3>
            <JalaliCalendarPicker
              selectedDate={selectedException}
              onSelect={(d) => setSelectedException(d)}
            />
            {selectedException && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                <p className="text-xs text-amber-700">
                  {toPersian(selectedException.jd)} {JALALI_MONTHS[selectedException.jm - 1]}
                </p>
                <button
                  onClick={() => setSelectedException(null)}
                  className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded-lg"
                >
                  افزودن تعطیل
                </button>
              </div>
            )}
          </div>

          {/* Public holidays */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">تعطیلات رسمی ۱۴۰۴</h3>
            <div className="space-y-2">
              {HOLIDAYS.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full" />
                    <span className="text-slate-700">{h.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">{h.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
