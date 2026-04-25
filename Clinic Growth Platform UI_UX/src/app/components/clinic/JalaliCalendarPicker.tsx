import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  getJalaliMonthDays,
  todayJalali,
  isJalaliToday,
  isJalaliPast,
  isHoliday,
  toPersian,
  fromJalali,
} from '../../utils/persian';

interface JalaliCalendarPickerProps {
  selectedDate?: { jy: number; jm: number; jd: number } | null;
  onSelect: (date: { jy: number; jm: number; jd: number; date: Date }) => void;
  disabledDates?: Array<{ jy: number; jm: number; jd: number }>;
  closedDays?: number[]; // 0=Saturday, 6=Friday
  minDate?: { jy: number; jm: number; jd: number };
}

export function JalaliCalendarPicker({
  selectedDate,
  onSelect,
  closedDays = [6], // Friday closed by default
  minDate,
}: JalaliCalendarPickerProps) {
  const today = todayJalali();
  const [viewYear, setViewYear] = useState(today.jy);
  const [viewMonth, setViewMonth] = useState(today.jm);

  const days = getJalaliMonthDays(viewYear, viewMonth);

  const goToPrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isDisabled = (jy: number, jm: number, jd: number, weekDay: number) => {
    if (closedDays.includes(weekDay)) return true;
    if (isJalaliPast(jy, jm, jd) && !isJalaliToday(jy, jm, jd)) return true;
    if (minDate) {
      if (jy < minDate.jy) return true;
      if (jy === minDate.jy && jm < minDate.jm) return true;
      if (jy === minDate.jy && jm === minDate.jm && jd < minDate.jd) return true;
    }
    return false;
  };

  const isSelected = (jy: number, jm: number, jd: number) => {
    if (!selectedDate) return false;
    return selectedDate.jy === jy && selectedDate.jm === jm && selectedDate.jd === jd;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700">
        <button
          onClick={goToNextMonth}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <ChevronRight size={18} />
        </button>
        <div className="text-white font-semibold text-sm">
          {JALALI_MONTHS[viewMonth - 1]} {toPersian(viewYear)}
        </div>
        <button
          onClick={goToPrevMonth}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {JALALI_WEEKDAYS.map((day, i) => (
          <div
            key={i}
            className={`py-2 text-center text-xs font-medium ${
              i === 6 ? 'text-red-400' : 'text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {days.map((day, i) => {
          const holiday = isHoliday(day.jy, day.jm, day.jd);
          const disabled = isDisabled(day.jy, day.jm, day.jd, day.weekDay) || !day.isCurrentMonth;
          const selected = isSelected(day.jy, day.jm, day.jd);
          const today = isJalaliToday(day.jy, day.jm, day.jd);

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => !disabled && onSelect({ ...day })}
              className={`
                relative h-9 w-full flex items-center justify-center rounded-xl text-sm transition-all
                ${!day.isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                ${selected
                  ? 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-200'
                  : today
                  ? 'bg-teal-50 text-teal-700 font-semibold ring-2 ring-teal-200'
                  : holiday && !disabled
                  ? 'text-red-500 font-medium hover:bg-red-50'
                  : disabled
                  ? 'text-slate-200 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer'
                }
              `}
            >
              {toPersian(day.jd)}
              {holiday && !selected && day.isCurrentMonth && (
                <span className="absolute bottom-1 right-1/2 translate-x-1/2 w-1 h-1 bg-red-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pb-3 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-400 rounded-full" />
          تعطیل
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-teal-200 rounded-full" />
          امروز
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-teal-600 rounded-full" />
          انتخاب شده
        </div>
      </div>
    </div>
  );
}
