import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Clock, User, Loader2 } from 'lucide-react';
import { toPersian, formatTime } from '../../utils/persian';
import { STAFF } from '../../data/mockData';

interface TimeSlot {
  hour: number;
  minute: number;
  available: boolean;
  staffId?: string;
}

function generateSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  // 8:00 to 18:00, 30 min intervals
  const unavailable = [9, 10, 13, 14, 16]; // hour-based unavailability
  for (let h = 8; h < 20; h++) {
    for (const m of [0, 30]) {
      slots.push({
        hour: h,
        minute: m,
        available: !unavailable.includes(h) || m === 30,
        staffId: 'stf-001',
      });
    }
  }
  return slots;
}

export default function TimeSlotPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selected, setSelected] = useState<TimeSlot | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setSlots(generateSlots());
      setLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [selectedStaff]);

  const handleContinue = () => {
    if (!selected) return;
    navigate('/client/summary');
  };

  const morningSlots = slots.filter(s => s.hour < 12);
  const afternoonSlots = slots.filter(s => s.hour >= 12 && s.hour < 17);
  const eveningSlots = slots.filter(s => s.hour >= 17);

  const SlotGroup = ({ title, slots }: { title: string; slots: TimeSlot[] }) => (
    <div className="mb-5">
      <p className="text-xs font-medium text-slate-500 mb-2 px-1">{title}</p>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot, i) => {
          const isSelected = selected?.hour === slot.hour && selected?.minute === slot.minute;
          return (
            <button
              key={i}
              disabled={!slot.available || loading}
              onClick={() => slot.available && setSelected(slot)}
              className={`
                py-2.5 px-1 rounded-xl text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                  : slot.available
                  ? 'bg-white border border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-700'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                }
              `}
            >
              {formatTime(slot.hour, slot.minute)}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button
            onClick={() => navigate('/client/date')}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
          <div>
            <h1 className="font-semibold text-slate-800">انتخاب ساعت</h1>
            <p className="text-xs text-slate-500">
              پنجشنبه، ۱۵ اردیبهشت ۱۴۰۴
            </p>
          </div>
        </div>

        {/* Staff filter */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedStaff('all')}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedStaff === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User size={12} />
            همه پزشکان
          </button>
          {STAFF.filter(s => s.role === 'DOCTOR').map(staff => (
            <button
              key={staff.id}
              onClick={() => setSelectedStaff(staff.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedStaff === staff.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {staff.avatar && (
                <img src={staff.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
              )}
              {staff.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-white border border-slate-200 rounded" />
          خالی
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-slate-100 rounded" />
          پر
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-teal-600 rounded" />
          انتخاب شده
        </div>
      </div>

      {/* Slots */}
      <div className="px-4 py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={32} className="text-teal-500 animate-spin" />
            <p className="text-sm text-slate-500">در حال بارگذاری ساعت‌های خالی...</p>
          </div>
        ) : (
          <>
            <SlotGroup title="صبح (۸:۰۰ - ۱۲:۰۰)" slots={morningSlots} />
            <SlotGroup title="بعدازظهر (۱۲:۰۰ - ۱۷:۰۰)" slots={afternoonSlots} />
            <SlotGroup title="عصر (۱۷:۰۰ - ۲۰:۰۰)" slots={eveningSlots} />
          </>
        )}
      </div>

      {/* Selected slot info */}
      {selected && (
        <div className="mx-4 mb-3">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-teal-800 text-sm">
                ساعت {formatTime(selected.hour, selected.minute)} انتخاب شد
              </p>
              <p className="text-xs text-teal-600">پنجشنبه ۱۵ اردیبهشت ۱۴۰۴</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="sticky bottom-20 px-4 mb-4">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all ${
            selected
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {selected ? 'ادامه — بررسی اطلاعات' : 'ابتدا ساعت را انتخاب کنید'}
        </button>
      </div>
    </div>
  );
}
