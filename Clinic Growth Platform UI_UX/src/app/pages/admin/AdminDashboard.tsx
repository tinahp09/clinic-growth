import React, { useState } from 'react';
import {
  Calendar, CreditCard, TrendingUp, TrendingDown, Users,
  AlertCircle, BookOpen, RefreshCw, CheckCircle, XCircle,
  Clock, Activity, ArrowLeft,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { KPICard } from '../../components/clinic/KPICard';
import { StatusChip } from '../../components/clinic/StatusChip';
import { BookingTimeline } from '../../components/clinic/BookingTimeline';
import {
  KPI_DATA, WEEKLY_BOOKINGS, REVENUE_CHART, SERVICE_DISTRIBUTION,
  BOOKINGS, BOOKING_STATUS_LABELS,
} from '../../data/mockData';
import { toPersian, formatPrice } from '../../utils/persian';
import { useNavigate } from 'react-router';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const CHART_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];

type TimeFilter = 'this_month' | '3_months' | '6_months' | '1_year';

const TIME_FILTER_LABELS: Record<TimeFilter, string> = {
  this_month: 'این ماه',
  '3_months': '۳ ماه گذشته',
  '6_months': '۶ ماه گذشته',
  '1_year': '۱ سال گذشته',
};

const PersianTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm" dir="rtl">
        <p className="font-medium text-slate-700 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-xs">
            {p.name}: {toPersian(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this_month');
  const today = new Date().toLocaleDateString('fa-IR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="p-6" dir="rtl">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">داشبورد</h1>
          <p className="text-sm text-slate-500 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="انتخاب بازه زمانی" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(TIME_FILTER_LABELS) as [TimeFilter, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="کل درآمد این ماه"
          value={`${toPersian(Math.round(KPI_DATA.totalRevenue / 1_000_000))} میلیون`}
          subtitle="تومان"
          trend="up"
          trendValue="+۱۲٪"
          icon={<TrendingUp size={18} className="text-teal-600" />}
          iconBg="bg-teal-50"
        />
        <KPICard
          title="نوبت‌های این ماه"
          value={KPI_DATA.totalBookingsMonth}
          trend="up"
          trendValue="+۸٪"
          icon={<BookOpen size={18} className="text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <KPICard
          title="نرخ موفقیت پرداخت"
          value={`${toPersian(KPI_DATA.bookingSuccessRate)}٪`}
          trend="up"
          trendValue="+۲.۱٪"
          icon={<CheckCircle size={18} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <KPICard
          title="نوبت‌های امروز"
          value={KPI_DATA.todayBookings}
          subtitle={`${toPersian(3)} باقی‌مانده`}
          icon={<Calendar size={18} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="نرخ عدم حضور"
          value={`${toPersian(KPI_DATA.noShowRate)}٪`}
          trend="down"
          trendValue="-۱.۲٪"
          icon={<Users size={18} className="text-amber-600" />}
          iconBg="bg-amber-50"
          valueColor="text-amber-700"
        />
        <KPICard
          title="نرخ لغو"
          value={`${toPersian(KPI_DATA.cancellationRate)}٪`}
          trend="neutral"
          trendValue="بدون تغییر"
          icon={<XCircle size={18} className="text-red-500" />}
          iconBg="bg-red-50"
          valueColor="text-red-600"
        />
        <KPICard
          title="پرداخت معلق"
          value={KPI_DATA.pendingPayments}
          subtitle="نیاز به بررسی"
          icon={<Clock size={18} className="text-orange-500" />}
          iconBg="bg-orange-50"
          valueColor="text-orange-600"
        />
        <KPICard
          title="نرخ استرداد"
          value={`${toPersian(KPI_DATA.refundRate)}٪`}
          trend="down"
          trendValue="-۰.۸٪"
          icon={<RefreshCw size={18} className="text-purple-600" />}
          iconBg="bg-purple-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">درآمد ماهانه</h3>
            <span className="text-xs text-slate-400">۵ ماه اخیر</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_CHART}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Vazirmatn' }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip content={<PersianTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="درآمد"
                stroke="#0D9488"
                strokeWidth={2.5}
                fill="url(#revGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">توزیع خدمات</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={SERVICE_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {SERVICE_DISTRIBUTION.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {SERVICE_DISTRIBUTION.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="text-slate-500 font-medium">{toPersian(item.value)}٪</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly bookings bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">نوبت‌های هفتگی</h3>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-500" />تایید شده</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" />لغو</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" />ناموفق</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY_BOOKINGS} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'Vazirmatn' }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip content={<PersianTooltip />} />
              <Bar dataKey="confirmed" name="تایید شده" fill="#0D9488" radius={[4,4,0,0]} />
              <Bar dataKey="cancelled" name="لغو" fill="#EF4444" radius={[4,4,0,0]} />
              <Bar dataKey="failed" name="ناموفق" fill="#F59E0B" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* System alerts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">هشدارهای سیستم</h3>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              {toPersian(3)} هشدار
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { type: 'warning', msg: 'پرداخت معلق بیش از ۳۰ دقیقه', time: '۵ دقیقه پیش' },
              { type: 'error', msg: 'callback زرین‌پال پاسخ نگرفت', time: '۱۵ دقیقه پیش' },
              { type: 'info', msg: 'اتاق لیزر از فردا در تعمیر', time: '۱ ساعت پیش' },
            ].map((alert, i) => (
              <div key={i} className={`flex gap-2.5 p-2.5 rounded-xl ${
                alert.type === 'error' ? 'bg-red-50' :
                alert.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
              }`}>
                <AlertCircle size={14} className={`flex-shrink-0 mt-0.5 ${
                  alert.type === 'error' ? 'text-red-600' :
                  alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                }`} />
                <div>
                  <p className={`text-xs font-medium ${
                    alert.type === 'error' ? 'text-red-700' :
                    alert.type === 'warning' ? 'text-amber-700' : 'text-blue-700'
                  }`}>{alert.msg}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">آخرین رزروها</h3>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="text-sm text-teal-600 flex items-center gap-1 hover:underline"
          >
            مشاهده همه
            <ArrowLeft size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">زیباجو</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">خدمات</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">مبلغ</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {BOOKINGS.slice(0, 5).map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{booking.patientName}</p>
                      <p className="text-xs text-slate-400 ltr">{booking.patientPhone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-slate-600 truncate max-w-[140px]">
                      {booking.services.map(s => s.name).join('، ')}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {new Date(booking.dateTime).toLocaleDateString('fa-IR', { timeZone: 'Asia/Tehran' })}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-700">
                    {formatPrice(booking.totalAmount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusChip status={booking.status} type="booking" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
