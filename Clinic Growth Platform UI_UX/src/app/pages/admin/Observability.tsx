import React, { useState } from 'react';
import {
  AlertTriangle, AlertCircle, CheckCircle, RefreshCw,
  Activity, Clock, Zap, Database, Bell, XCircle, TrendingDown,
} from 'lucide-react';
import { toPersian } from '../../utils/persian';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type AlertLevel = 'ERROR' | 'WARNING' | 'INFO';

interface SystemAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  time: string;
  resolved: boolean;
}

const ALERTS: SystemAlert[] = [
  { id: 'a1', level: 'ERROR', title: 'Callback زرین‌پال پاسخ نگرفت', message: 'Authority A0000...002 پس از ۳۰ دقیقه Callback دریافت نکرد. رزرو در حالت PENDING_CALLBACK مانده.', time: '۱۵ دقیقه پیش', resolved: false },
  { id: 'a2', level: 'WARNING', title: 'پرداخت معلق طولانی', message: 'تراکنش txn-002 بیش از ۲۵ دقیقه در وضعیت REDIRECTED است. احتمال ABANDONED.', time: '۲۰ دقیقه پیش', resolved: false },
  { id: 'a3', level: 'WARNING', title: 'صف DLQ غیر خالی', message: 'Dead Letter Queue شامل ۳ پیام پردازش‌نشده است. نیاز به بررسی دستی.', time: '۴۵ دقیقه پیش', resolved: false },
  { id: 'a4', level: 'INFO', title: 'اتاق ریکاوری تعمیر تمام شد', message: 'اتاق rm-005 در ۱۸:۰۰ امروز در دسترس خواهد بود.', time: '۱ ساعت پیش', resolved: true },
  { id: 'a5', level: 'ERROR', title: 'خطای ارسال SMS', message: 'ارسال ۲ پیامک تایید نوبت با خطا مواجه شد. سرویس SMS provider پاسخ نداد.', time: '۲ ساعت پیش', resolved: true },
];

const LEVEL_COLORS: Record<AlertLevel, string> = {
  ERROR: 'bg-red-50 border-red-200',
  WARNING: 'bg-amber-50 border-amber-200',
  INFO: 'bg-blue-50 border-blue-200',
};
const LEVEL_ICONS: Record<AlertLevel, React.ReactNode> = {
  ERROR: <XCircle size={16} className="text-red-600" />,
  WARNING: <AlertTriangle size={16} className="text-amber-600" />,
  INFO: <AlertCircle size={16} className="text-blue-600" />,
};
const LEVEL_TEXT: Record<AlertLevel, string> = {
  ERROR: 'text-red-700',
  WARNING: 'text-amber-700',
  INFO: 'text-blue-700',
};

const RESPONSE_TIME_DATA = [
  { time: '۸:۰۰', p50: 180, p95: 420, p99: 850 },
  { time: '۹:۰۰', p50: 195, p95: 450, p99: 900 },
  { time: '۱۰:۰۰', p50: 210, p95: 510, p99: 980 },
  { time: '۱۱:۰۰', p50: 185, p95: 430, p99: 820 },
  { time: '۱۲:۰۰', p50: 220, p95: 560, p99: 1100 },
  { time: '۱۳:۰۰', p50: 175, p95: 390, p99: 750 },
  { time: '۱۴:۰۰', p50: 200, p95: 470, p99: 920 },
];

export default function Observability() {
  const [alerts, setAlerts] = useState(ALERTS);
  const [filterResolved, setFilterResolved] = useState(false);

  const unresolved = alerts.filter(a => !a.resolved);
  const resolve = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));

  const displayed = filterResolved ? alerts : alerts.filter(a => !a.resolved);

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">نظارت سیستم</h1>
          <p className="text-sm text-slate-500 mt-0.5">هشدارها، DLQ و سلامت سیستم</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full ${
            unresolved.filter(a => a.level === 'ERROR').length > 0
              ? 'bg-red-100 text-red-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              unresolved.filter(a => a.level === 'ERROR').length > 0 ? 'bg-red-500' : 'bg-emerald-500'
            }`} />
            {unresolved.filter(a => a.level === 'ERROR').length > 0
              ? `${toPersian(unresolved.filter(a => a.level === 'ERROR').length)} خطای حل‌نشده`
              : 'سیستم سالم'
            }
          </span>
        </div>
      </div>

      {/* System health metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Uptime', value: '۹۹.۹٪', icon: <Activity size={16} className="text-emerald-600" />, bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'میانگین پاسخ‌دهی', value: `${toPersian(195)} ms`, icon: <Zap size={16} className="text-blue-600" />, bg: 'bg-blue-50', color: 'text-blue-700' },
          { label: 'صف DLQ', value: `${toPersian(3)} پیام`, icon: <Database size={16} className="text-amber-600" />, bg: 'bg-amber-50', color: 'text-amber-700' },
          { label: 'هشدار فعال', value: toPersian(unresolved.length), icon: <Bell size={16} className="text-red-500" />, bg: 'bg-red-50', color: 'text-red-700' },
        ].map((m, i) => (
          <div key={i} className={`${m.bg} rounded-2xl border border-white p-4`}>
            <div className="flex items-center gap-2 mb-2">
              {m.icon}
              <span className="text-xs text-slate-500">{m.label}</span>
            </div>
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Response time chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">زمان پاسخ‌دهی API (امروز)</h3>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-500" />P50</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" />P95</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" />P99</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={RESPONSE_TIME_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fontFamily: 'Vazirmatn' }} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip />
            <Area type="monotone" dataKey="p50" name="P50 (ms)" stroke="#0D9488" fill="#F0FDFA" strokeWidth={2} />
            <Area type="monotone" dataKey="p95" name="P95 (ms)" stroke="#F59E0B" fill="#FFFBEB" strokeWidth={2} />
            <Area type="monotone" dataKey="p99" name="P99 (ms)" stroke="#EF4444" fill="#FEF2F2" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">هشدارها و رویدادها</h3>
          <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
            <div
              onClick={() => setFilterResolved(!filterResolved)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${filterResolved ? 'bg-teal-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${filterResolved ? 'right-0.5' : 'left-0.5'}`} />
            </div>
            نمایش حل‌شده‌ها
          </label>
        </div>

        <div className="space-y-3">
          {displayed.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400" />
              <p className="text-sm">هیچ هشدار فعالی وجود ندارد</p>
            </div>
          )}
          {displayed.map(alert => (
            <div
              key={alert.id}
              className={`border rounded-2xl p-4 ${LEVEL_COLORS[alert.level]} ${alert.resolved ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 flex-shrink-0">{LEVEL_ICONS[alert.level]}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-semibold ${LEVEL_TEXT[alert.level]}`}>{alert.title}</p>
                      {alert.resolved && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">حل شده</span>
                      )}
                    </div>
                    <p className={`text-xs ${LEVEL_TEXT[alert.level]} opacity-75`}>{alert.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                  </div>
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => resolve(alert.id)}
                    className="flex-shrink-0 text-xs text-slate-500 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    علامت‌گذاری حل شده
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
