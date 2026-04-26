import React, { useState } from 'react';
import { Plus, Edit, Calendar, Clock, User, Eye } from 'lucide-react';
import { STAFF, STAFF_ROLE_LABELS, type StaffRole } from '../../data/mockData';
import { STAFF_LEAVES, LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS } from '../../data/mockData';
import { toPersian, JALALI_WEEKDAYS_FULL, todayJalali } from '../../utils/persian';
import { JalaliCalendarPicker } from '../../components/clinic/JalaliCalendarPicker';

const ROLE_COLORS: Record<StaffRole, string> = {
  DOCTOR: 'bg-teal-50 text-teal-700 border-teal-200',
  NURSE: 'bg-blue-50 text-blue-700 border-blue-200',
  TECHNICIAN: 'bg-purple-50 text-purple-700 border-purple-200',
  RECEPTIONIST: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function StaffManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<typeof STAFF[0] | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showLeavesView, setShowLeavesView] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState<{ jy: number; jm: number; jd: number; date: Date } | null>(null);
  const [leaveEndDate, setLeaveEndDate] = useState<{ jy: number; jm: number; jd: number; date: Date } | null>(null);

  const daysMap = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

  const currentMonth = todayJalali().jm;
  const currentYear = todayJalali().jy;

  const getLeaveDaysUsed = (staffId: string) => {
    const staffLeaves = STAFF_LEAVES.filter(
      l => l.staffId === staffId && l.status === 'APPROVED'
    );
    let used = 0;
    staffLeaves.forEach(leave => {
      const startParts = leave.startDate.split('/').map(Number);
      const endParts = leave.endDate.split('/').map(Number);
      const [leaveYear, startMonth, startDay] = startParts;
      const [_, endMonth, endDay] = endParts;
      
      if (leaveYear !== currentYear) return;
      if (startMonth > currentMonth || endMonth < currentMonth) return;
      
      const daysInStartMonth = startMonth === endMonth 
        ? endDay - startDay + 1 
        : (30 - startDay + 1) + endDay;
      used += daysInStartMonth;
    });
    return used;
  };

  const getLeaveQuota = (staffId: string) => {
    const staff = STAFF.find(s => s.id === staffId);
    return staff?.annualLeaveQuota || 12;
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">مدیریت کارمندان</h1>
          <p className="text-sm text-slate-500 mt-0.5">{toPersian(STAFF.length)} نفر فعال</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-teal-200 hover:bg-teal-700"
        >
          <Plus size={16} />
          کارمند جدید
        </button>
        <button
          onClick={() => setShowLeavesView(true)}
          className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200"
        >
          <Eye size={16} />
          مشاهده مرخصی‌ها
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
        {STAFF.map(staff => (
          <div key={staff.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              {staff.avatar ? (
                <img src={staff.avatar} alt={staff.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <User size={22} className="text-teal-700" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">{staff.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{staff.specialty}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${ROLE_COLORS[staff.role]}`}>
                    {STAFF_ROLE_LABELS[staff.role]}
                  </span>
                </div>
              </div>
            </div>

            {/* Working hours */}
            <div className="bg-slate-50 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={13} className="text-slate-500" />
                <span className="text-xs font-medium text-slate-600">ساعات کاری</span>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {staff.workStart} — {staff.workEnd}
              </p>
            </div>

            {/* Available days */}
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                <Calendar size={12} />
                روزهای حضور
              </p>
              <div className="flex gap-1.5">
                {daysMap.map((day, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                      staff.availableDays.includes(i)
                        ? 'bg-teal-100 text-teal-700'
                        : i === 6
                        ? 'bg-red-50 text-red-300'
                        : 'bg-slate-100 text-slate-300'
                    }`}
                    title={day}
                  >
                    {day[0]}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center bg-teal-50 rounded-xl p-2">
                <p className="text-base font-bold text-teal-700">{toPersian(Math.floor(Math.random() * 20) + 5)}</p>
                <p className="text-xs text-teal-600">نوبت این ماه</p>
              </div>
              <div className="text-center bg-blue-50 rounded-xl p-2">
                <p className="text-base font-bold text-blue-700">{toPersian(Math.floor(Math.random() * 2) + 3)}</p>
                <p className="text-xs text-blue-600">امروز</p>
              </div>
              <div className="text-center bg-purple-50 rounded-xl p-2">
                {(() => {
                  const used = getLeaveDaysUsed(staff.id);
                  const quota = getLeaveQuota(staff.id);
                  const remaining = quota - used;
                  return (
                    <>
                      <p className="text-base font-bold text-purple-700">
                        <span className={remaining <= 0 ? 'text-red-600' : ''}>{toPersian(remaining)}</span>
                        <span className="text-xs text-purple-500"> / {toPersian(quota)}</span>
                      </p>
                      <p className="text-xs text-purple-600">مرخصی مانده</p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => { setSelectedStaff(staff); setShowEditModal(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-teal-200 text-teal-600 text-xs font-medium hover:bg-teal-50 transition-colors">
                <Edit size={13} />
                ویرایش
              </button>
              <button onClick={() => { setSelectedStaff(staff); setShowLeaveModal(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors">
                <Calendar size={13} />
                مرخصی
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add form modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-5">افزودن کارمند جدید</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">نام و نام خانوادگی</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="مثال: دکتر سارا احمدی" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">نقش</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  <option>پزشک</option>
                  <option>پرستار</option>
                  <option>تکنسین</option>
                  <option>پذیرش</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">شروع کار</label>
                  <input type="time" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr" defaultValue="09:00" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">پایان کار</label>
                  <input type="time" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr" defaultValue="18:00" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium">انصراف</button>
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold">ذخیره</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-5">ویرایش اطلاعات کارمند</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">نام و نام خانوادگی</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" defaultValue={selectedStaff.name} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">تخصص</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" defaultValue={selectedStaff.specialty} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">نقش</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" defaultValue={selectedStaff.role}>
                  <option value="DOCTOR">پزشک</option>
                  <option value="NURSE">پرستار</option>
                  <option value="TECHNICIAN">تکنسین</option>
                  <option value="RECEPTIONIST">پذیرش</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">شروع کار</label>
                  <input type="time" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr" defaultValue={selectedStaff.workStart} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">پایان کار</label>
                  <input type="time" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr" defaultValue={selectedStaff.workEnd} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium">انصراف</button>
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold">ذخیره</button>
            </div>
          </div>
        </div>
      )}

      {/* Leave modal */}
      {showLeaveModal && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-800 text-lg mb-2">درخواست مرخصی</h3>
            <p className="text-sm text-slate-500 mb-5">{selectedStaff.name}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">تاریخ شروع</label>
                <JalaliCalendarPicker
                  selectedDate={leaveStartDate}
                  onSelect={setLeaveStartDate}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">تاریخ پایان</label>
                <JalaliCalendarPicker
                  selectedDate={leaveEndDate}
                  onSelect={setLeaveEndDate}
                  minDate={leaveStartDate || undefined}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">نوع مرخصی</label>
              <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option>مرخصی استعلاجی</option>
                <option>مرخصی سالانه</option>
                <option>مرخصی بدون حقوق</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700 block mb-1.5">توضیحات</label>
              <textarea className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" rows={3} placeholder="توضیحات مرخصی..." />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowLeaveModal(false); setLeaveStartDate(null); setLeaveEndDate(null); }} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium">انصراف</button>
              <button onClick={() => setShowLeaveModal(false)} className="flex-1 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold">ارسال درخواست</button>
            </div>
          </div>
        </div>
      )}

      {/* Leaves view modal */}
      {showLeavesView && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">مرخصی‌های کارمندان</h3>
              <button onClick={() => setShowLeavesView(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="space-y-3">
              {STAFF_LEAVES.length === 0 ? (
                <p className="text-center text-slate-400 py-8">هیچ مرخصی ثبت نشده است</p>
              ) : (
                STAFF_LEAVES.map(leave => (
                  <div key={leave.id} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-800">{leave.staffName}</p>
                        <p className="text-sm text-slate-500">{leave.startDate} — {leave.endDate}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${LEAVE_STATUS_LABELS[leave.status].color}`}>
                        {LEAVE_STATUS_LABELS[leave.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded-lg">
                        {LEAVE_TYPE_LABELS[leave.type]}
                      </span>
                      {leave.description && (
                        <p className="text-xs text-slate-500">{leave.description}</p>
                      )}
                    </div>
                    {leave.status === 'PENDING' && (
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600">تایید</button>
                        <button className="flex-1 py-2 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600">رد</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
