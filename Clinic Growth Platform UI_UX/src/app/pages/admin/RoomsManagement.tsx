import React, { useState } from 'react';
import { Plus, Edit, Wrench, DoorOpen } from 'lucide-react';
import { ROOMS, ROOM_TYPE_LABELS, type RoomType } from '../../data/mockData';
import { StatusChip } from '../../components/clinic/StatusChip';
import { toPersian } from '../../utils/persian';

const ROOM_ICONS: Record<RoomType, React.ReactNode> = {
  CONSULTATION: <DoorOpen size={20} className="text-blue-600" />,
  TREATMENT: <DoorOpen size={20} className="text-teal-600" />,
  LASER: <DoorOpen size={20} className="text-purple-600" />,
  RECOVERY: <DoorOpen size={20} className="text-emerald-600" />,
};

const ROOM_COLORS: Record<RoomType, string> = {
  CONSULTATION: 'bg-blue-50',
  TREATMENT: 'bg-teal-50',
  LASER: 'bg-purple-50',
  RECOVERY: 'bg-emerald-50',
};

export default function RoomsManagement() {
  const [rooms, setRooms] = useState(ROOMS);
  const [showAddForm, setShowAddForm] = useState(false);

  const available = rooms.filter(r => r.status === 'AVAILABLE').length;
  const occupied = rooms.filter(r => r.status === 'OCCUPIED').length;
  const maintenance = rooms.filter(r => r.status === 'MAINTENANCE').length;

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">مدیریت اتاق‌ها</h1>
          <p className="text-sm text-slate-500 mt-0.5">{toPersian(rooms.length)} اتاق ثبت شده</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-teal-200 hover:bg-teal-700"
        >
          <Plus size={16} />
          اتاق جدید
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'آزاد', count: available, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'اشغال', count: occupied, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
          { label: 'تعمیر', count: maintenance, color: 'text-red-700', bg: 'bg-red-50 border-red-100' },
        ].map((s, i) => (
          <div key={i} className={`border rounded-2xl p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{toPersian(s.count)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rooms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${ROOM_COLORS[room.type]} rounded-2xl flex items-center justify-center`}>
                {ROOM_ICONS[room.type]}
              </div>
              <StatusChip status={room.status} type="room" size="sm" />
            </div>

            <h3 className="font-semibold text-slate-800 mb-1">{room.name}</h3>
            <p className="text-sm text-slate-500 mb-3">{ROOM_TYPE_LABELS[room.type]}</p>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5 mb-4">
              <DoorOpen size={13} />
              ظرفیت {toPersian(room.capacity)} نفر
            </div>

            {/* Today's bookings mock */}
            <div className="space-y-1.5 mb-4">
              <p className="text-xs font-medium text-slate-500">امروز</p>
              {room.status !== 'MAINTENANCE' ? (
                <div className="space-y-1">
                  {room.id === 'rm-002' && [
                    { time: '۹:۰۰', name: 'فاطمه حسینی', color: 'bg-emerald-400' },
                    { time: '۱۱:۰۰', name: 'رضا قاسمی', color: 'bg-emerald-400' },
                    { time: '۱۴:۰۰', name: 'شیرین تهرانی', color: 'bg-amber-400' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${b.color}`} />
                      <span className="text-slate-500">{b.time}</span>
                      <span className="text-slate-700">{b.name}</span>
                    </div>
                  ))}
                  {room.id !== 'rm-002' && (
                    <p className="text-xs text-slate-400">رزرو فعال ندارد</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-red-500">
                  <Wrench size={12} />
                  در حال تعمیر
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-teal-200 text-teal-600 text-xs font-medium hover:bg-teal-50">
                <Edit size={13} />
                ویرایش
              </button>
              <button
                onClick={() => setRooms(prev => prev.map(r =>
                  r.id === room.id
                    ? { ...r, status: r.status === 'MAINTENANCE' ? 'AVAILABLE' as const : 'MAINTENANCE' as const }
                    : r
                ))}
                className={`flex items-center justify-center p-2 rounded-xl border text-xs transition-colors ${
                  room.status === 'MAINTENANCE'
                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                }`}
              >
                <Wrench size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-5">افزودن اتاق جدید</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">نام اتاق</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="مثال: اتاق لیزر ۲" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">نوع اتاق</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>مشاوره</option>
                  <option>درمان</option>
                  <option>لیزر</option>
                  <option>ریکاوری</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium">انصراف</button>
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold">ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
