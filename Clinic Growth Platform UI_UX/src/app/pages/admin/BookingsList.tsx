import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight, X, Plus, Calendar, Clock, User } from 'lucide-react';
import { BOOKINGS, SERVICES, STAFF, type BookingStatus } from '../../data/mockData';
import { StatusChip } from '../../components/clinic/StatusChip';
import { toPersian, formatPrice, formatTime } from '../../utils/persian';
import { JalaliCalendarPicker } from '../../components/clinic/JalaliCalendarPicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const STATUS_FILTERS: { value: BookingStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'همه' },
  { value: 'CONFIRMED', label: 'تایید شده' },
  { value: 'RESERVED', label: 'رزرو موقت' },
  { value: 'PENDING_PAYMENT', label: 'در انتظار پرداخت' },
  { value: 'CANCELLED', label: 'لغو شده' },
  { value: 'FAILED_PAYMENT', label: 'پرداخت ناموفق' },
];

export default function BookingsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedJalaliDate, setSelectedJalaliDate] = useState<{
    jy: number; jm: number; jd: number; date: Date
  } | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ hour: number; minute: number } | null>(null);
  const [newBooking, setNewBooking] = useState({
    patientName: '',
    patientPhone: '',
    serviceId: '',
    staffId: '',
    notes: '',
  });

  const filtered = BOOKINGS.filter(b => {
    const matchesSearch =
      !search ||
      b.patientName.includes(search) ||
      b.bookingNumber.includes(search) ||
      b.patientPhone.includes(search);
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generateTimeSlots = () => {
    const slots: { hour: number; minute: number; available: boolean }[] = [];
    const unavailable = [9, 10, 13, 14, 16];
    for (let h = 8; h < 20; h++) {
      for (const m of [0, 30]) {
        slots.push({
          hour: h,
          minute: m,
          available: !unavailable.includes(h) || m === 30,
        });
      }
    }
    return slots;
  };

  const handleCreateBooking = () => {
    if (!newBooking.patientName || !newBooking.patientPhone || !newBooking.serviceId || !newBooking.staffId || !selectedJalaliDate || !selectedTimeSlot) return;
    
    const selectedService = SERVICES.find(s => s.id === newBooking.serviceId);
    const selectedStaff = STAFF.find(s => s.id === newBooking.staffId);
    
    const bookingNumber = `BK${Date.now().toString().slice(-6)}`;
    const timeStr = `${toPersian(selectedTimeSlot.hour)}:${selectedTimeSlot.minute === 0 ? '00' : '30'}`;
    const dateTime = selectedJalaliDate.date.toISOString().replace('T00:00:00.000Z', `T${selectedTimeSlot.hour.toString().padStart(2, '0')}:${selectedTimeSlot.minute}:00.000Z`);
    
    console.log('Creating booking:', {
      id: `bk-${Date.now()}`,
      bookingNumber,
      patientName: newBooking.patientName,
      patientPhone: newBooking.patientPhone,
      services: selectedService ? [selectedService] : [],
      staffId: newBooking.staffId,
      staffName: selectedStaff?.name || '',
      dateTime,
      totalAmount: selectedService?.price || 0,
      status: 'CONFIRMED' as BookingStatus,
      notes: newBooking.notes,
    });
    
    setCreateModalOpen(false);
    setNewBooking({ patientName: '', patientPhone: '', serviceId: '', staffId: '', notes: '' });
    setSelectedJalaliDate(null);
    setSelectedTimeSlot(null);
  };

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">لیست رزروها</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {toPersian(filtered.length)} رزرو یافت شد
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-teal-700 shadow-sm"
          >
            <Plus size={15} />
            رزرو جدید
          </button>
          <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 shadow-sm">
            <Download size={15} />
            خروجی Excel
          </button>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو نام زیباجو، شماره رزرو، تلفن..."
              className="w-full border border-slate-200 rounded-xl pr-9 pl-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || statusFilter !== 'ALL'
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={15} />
            فیلتر
            {statusFilter !== 'ALL' && (
              <span className="w-2 h-2 bg-teal-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Status filter chips */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">شماره رزرو</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">زیباجو</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">خدمات</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">پزشک</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">تاریخ</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">مبلغ</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">وضعیت</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                    رزروی یافت نشد
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-medium text-slate-600 ltr">
                        {booking.bookingNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{booking.patientName}</p>
                        <p className="text-xs text-slate-400 ltr">{booking.patientPhone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600 max-w-[140px] truncate">
                        {booking.services.map(s => s.name).join('، ')}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {booking.staffName.replace('دکتر ', 'دکتر\u00A0')}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(booking.dateTime).toLocaleDateString('fa-IR', {
                        timeZone: 'Asia/Tehran',
                        year: 'numeric', month: '2-digit', day: '2-digit',
                      })}
                      <br />
                      <span className="text-xs text-slate-400">
                        {new Date(booking.dateTime).toLocaleTimeString('fa-IR', {
                          timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {formatPrice(booking.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusChip status={booking.status} type="booking" size="sm" />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                        className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs font-medium bg-teal-50 px-2.5 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        <Eye size={13} />
                        جزئیات
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            نمایش {toPersian(1)}-{toPersian(filtered.length)} از {toPersian(filtered.length)}
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30" disabled>
              <ChevronRight size={16} />
            </button>
            <button className="w-8 h-8 bg-teal-600 text-white rounded-lg text-sm font-medium">
              {toPersian(1)}
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30" disabled>
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Booking Modal */}
      <Dialog open={createModalOpen} onOpenChange={(o) => !o && setCreateModalOpen(false)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar size={20} className="text-teal-600" />
              رزرو جدید
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نام زیباجو</Label>
                <Input
                  value={newBooking.patientName}
                  onChange={(e) => setNewBooking({ ...newBooking, patientName: e.target.value })}
                  placeholder="نام کامل"
                />
              </div>
              <div className="space-y-2">
                <Label>شماره تماس</Label>
                <Input
                  value={newBooking.patientPhone}
                  onChange={(e) => setNewBooking({ ...newBooking, patientPhone: e.target.value })}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>خدمات</Label>
              <Select value={newBooking.serviceId} onValueChange={(v) => setNewBooking({ ...newBooking, serviceId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب خدمات" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - {formatPrice(s.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>پزشک/تکنسین</Label>
              <Select value={newBooking.staffId} onValueChange={(v) => setNewBooking({ ...newBooking, staffId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب پزشک" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF.filter(s => s.role === 'DOCTOR' || s.role === 'TECHNICIAN').map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاریخ</Label>
                <JalaliCalendarPicker
                  selectedDate={selectedJalaliDate}
                  onSelect={(date) => {
                    setSelectedJalaliDate(date);
                    setSelectedTimeSlot(null);
                  }}
                  closedDays={[6]}
                />
              </div>
              <div className="space-y-2">
                <Label>ساعت</Label>
                {selectedJalaliDate ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 max-h-[369px] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2">
                      {generateTimeSlots().map((slot, i) => {
                        const isSelected = selectedTimeSlot?.hour === slot.hour && selectedTimeSlot?.minute === slot.minute;
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => slot.available && setSelectedTimeSlot(slot)}
                            className={`
                              py-2 px-1 rounded-lg text-sm font-medium transition-all
                              ${isSelected
                                ? 'bg-teal-600 text-white'
                                : slot.available
                                ? 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-700'
                                : 'bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                              }
                            `}
                          >
                            {formatTime(slot.hour, slot.minute)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    ابتدا تاریخ را انتخاب کنید
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>یادداشت (اختیاری)</Label>
              <Input
                value={newBooking.notes}
                onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                placeholder="توضیحات اضافی..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={handleCreateBooking}
              disabled={!newBooking.patientName || !newBooking.patientPhone || !newBooking.serviceId || !newBooking.staffId || !selectedJalaliDate || !selectedTimeSlot}
              className="bg-teal-600 hover:bg-teal-700"
            >
              ایجاد رزرو
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
