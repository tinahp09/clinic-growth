import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, DoorOpen, LayoutGrid, List } from 'lucide-react';
import { BOOKINGS, STAFF } from '../../data/mockData';
import { StatusChip } from '../../components/clinic/StatusChip';
import { toPersian, JALALI_WEEKDAYS_FULL, JALALI_MONTHS, toJalali, todayJalali } from '../../utils/persian';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 to 19

const COLORS: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  RESERVED: 'bg-amber-100 border-amber-300 text-amber-800',
  PENDING_PAYMENT: 'bg-blue-100 border-blue-300 text-blue-800',
  CANCELLED: 'bg-red-50 border-red-200 text-red-600 line-through opacity-50',
};

type ViewMode = 'staff' | 'room';

export default function CalendarView() {
  const [viewMode, setViewMode] = useState<ViewMode>('staff');
  const today = todayJalali();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Generate week days (Sat to Thu in Iran)
  const weekDays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 6 + i + (currentWeekOffset * 7));
    const j = toJalali(d);
    return {
      date: d,
      jy: j.jy,
      jm: j.jm,
      jd: j.jd,
      name: JALALI_WEEKDAYS_FULL[i],
      isToday: j.jy === today.jy && j.jm === today.jm && j.jd === today.jd,
    };
  });

  // Get week range label
  const weekStart = weekDays[0];
  const weekEnd = weekDays[weekDays.length - 1];
  const weekLabel = weekStart.jm === weekEnd.jm
    ? `${toPersian(weekStart.jd)} - ${toPersian(weekEnd.jd)} ${JALALI_MONTHS[weekStart.jm - 1]} ${toPersian(weekStart.jy)}`
    : `${toPersian(weekStart.jd)} ${JALALI_MONTHS[weekStart.jm - 1]} - ${toPersian(weekEnd.jd)} ${JALALI_MONTHS[weekEnd.jm - 1]}`;

  // Mock calendar events
  const events = [
    { id: 1, dayIndex: 0, startHour: 9, duration: 1.5, patientName: 'فاطمه حسینی', service: 'مزوتراپی', staffId: 'stf-001', status: 'CONFIRMED' },
    { id: 2, dayIndex: 0, startHour: 11, duration: 0.75, patientName: 'رضا قاسمی', service: 'پیلینگ', staffId: 'stf-001', status: 'CONFIRMED' },
    { id: 3, dayIndex: 1, startHour: 10, duration: 1.5, patientName: 'شیرین تهرانی', service: 'بوتاکس + ژل', staffId: 'stf-002', status: 'CONFIRMED' },
    { id: 4, dayIndex: 1, startHour: 14, duration: 2, patientName: 'زهره محمدی', service: 'لیزر', staffId: 'stf-003', status: 'RESERVED' },
    { id: 5, dayIndex: 2, startHour: 9, duration: 2, patientName: 'مهدی اکبری', service: 'هایفو', staffId: 'stf-001', status: 'PENDING_PAYMENT' },
    { id: 6, dayIndex: 3, startHour: 11, duration: 1, patientName: 'نرگس کریمی', service: 'مزوتراپی', staffId: 'stf-004', status: 'CANCELLED' },
    { id: 7, dayIndex: 4, startHour: 15, duration: 1.5, patientName: 'لیلا احمدی', service: 'میکرونیدلینگ', staffId: 'stf-001', status: 'CONFIRMED' },
  ];

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">تقویم نوبت‌ها</h1>
          <p className="text-sm text-slate-500 mt-0.5">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('staff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'staff' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              <User size={13} />
              پزشک
            </button>
            <button
              onClick={() => setViewMode('room')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'room' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              <DoorOpen size={13} />
              اتاق
            </button>
          </div>

          {/* Week navigation */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setCurrentWeekOffset(c => c + 1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight size={16} className="text-slate-600" />
            </button>
            <button
              onClick={() => setCurrentWeekOffset(0)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              امروز
            </button>
            <button
              onClick={() => setCurrentWeekOffset(c => c - 1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}>
          <div className="p-3 border-l border-slate-100" />
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={`p-3 text-center border-l border-slate-100 ${
                day.isToday ? 'bg-teal-50' : ''
              }`}
            >
              <p className={`text-xs font-medium ${day.isToday ? 'text-teal-600' : 'text-slate-500'}`}>
                {day.name.slice(0, day.name.indexOf('ه') + 1 || 3)}
              </p>
              <div className={`w-7 h-7 mx-auto mt-1 rounded-full flex items-center justify-center text-sm font-bold ${
                day.isToday ? 'bg-teal-600 text-white' : 'text-slate-700'
              }`}>
                {toPersian(day.jd)}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="overflow-y-auto max-h-[560px]">
          {HOURS.map(hour => (
            <div
              key={hour}
              className="grid border-b border-slate-50 relative"
              style={{ gridTemplateColumns: '60px repeat(6, 1fr)', minHeight: '60px' }}
            >
              <div className="p-2 text-right border-l border-slate-100 flex-shrink-0">
                <span className="text-xs text-slate-400">{toPersian(hour)}:۰۰</span>
              </div>
              {weekDays.map((day, dayI) => {
                const dayEvents = events.filter(e =>
                  e.dayIndex === dayI &&
                  e.startHour === hour
                );
                return (
                  <div key={dayI} className={`border-l border-slate-50 p-1 relative ${day.isToday ? 'bg-teal-50/30' : ''}`}>
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`rounded-lg border p-1.5 cursor-pointer hover:opacity-80 transition-opacity text-xs ${COLORS[event.status]}`}
                        style={{ height: `${event.duration * 56}px` }}
                      >
                        <p className="font-medium truncate">{event.patientName}</p>
                        <p className="truncate opacity-75">{event.service}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-200 border border-emerald-400 rounded" />
          تایید شده
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-200 border border-amber-400 rounded" />
          رزرو موقت
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded" />
          در انتظار پرداخت
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
          لغو شده
        </div>
      </div>
    </div>
  );
}
