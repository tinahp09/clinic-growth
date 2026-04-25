import React, { useState } from 'react';
import { Save, Globe, Clock, CreditCard, Bell, Shield, ChevronLeft } from 'lucide-react';
import { CLINIC_INFO } from '../../data/mockData';
import { toPersian } from '../../utils/persian';

export default function TenantSettings() {
  const [clinicName, setClinicName] = useState(CLINIC_INFO.name);
  const [timezone, setTimezone] = useState('Asia/Tehran');
  const [calendarType, setCalendarType] = useState('jalali');
  const [digits, setDigits] = useState('persian');
  const [saved, setSaved] = useState(false);
  const [zarinpalKey, setZarinpalKey] = useState('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">تنظیمات کلینیک</h1>
          <p className="text-sm text-slate-500 mt-0.5">تنظیمات عمومی و یکپارچه‌سازی‌ها</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            saved ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white shadow-md shadow-teal-200 hover:bg-teal-700'
          }`}
        >
          <Save size={15} />
          {saved ? 'ذخیره شد ✓' : 'ذخیره'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General settings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Globe size={16} className="text-teal-600" />
            اطلاعات کلینیک
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">نام کلینیک</label>
              <input
                type="text"
                value={clinicName}
                onChange={e => setClinicName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">آدرس</label>
              <textarea
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                rows={2}
                defaultValue={CLINIC_INFO.address}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">شماره تماس</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr"
                defaultValue={CLINIC_INFO.phone}
              />
            </div>
          </div>
        </div>

        {/* Calendar & timezone */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-teal-600" />
            تقویم و منطقه زمانی
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">منطقه زمانی</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Asia/Tehran">Asia/Tehran (UTC+3:30)</option>
                <option value="UTC">UTC (UTC+0)</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">ذخیره‌سازی داخلی: Gregorian UTC</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">نوع تقویم نمایش</label>
              <div className="flex gap-2">
                {[
                  { value: 'jalali', label: 'شمسی (جلالی)' },
                  { value: 'gregorian', label: 'میلادی' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCalendarType(opt.value)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                      calendarType === opt.value
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">نوع اعداد</label>
              <div className="flex gap-2">
                {[
                  { value: 'persian', label: `فارسی (${toPersian('123')})` },
                  { value: 'western', label: 'لاتین (123)' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDigits(opt.value)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                      digits === opt.value
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ZarinPal integration */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-amber-500" />
            یکپارچه‌سازی زرین‌پال
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Merchant ID</label>
              <input
                type="text"
                value={zarinpalKey}
                onChange={e => setZarinpalKey(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">محیط</label>
              <div className="flex gap-2">
                {['sandbox', 'production'].map(env => (
                  <button
                    key={env}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium ${
                      env === 'sandbox' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                    }`}
                  >
                    {env === 'sandbox' ? 'آزمایشی (Sandbox)' : 'اصلی (Production)'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Callback URL</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr font-mono"
                defaultValue="https://clinicgrowth.ir/api/payments/callback"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">TTL رزرو موقت (دقیقه)</label>
              <input
                type="number"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr"
                defaultValue="15"
              />
              <p className="text-xs text-slate-400 mt-1">زمان انقضای رزرو موقت قبل از تایید پرداخت</p>
            </div>
          </div>
        </div>

        {/* Cancellation policy */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield size={16} className="text-teal-600" />
            قوانین لغو و استرداد
          </h3>
          <div className="space-y-4">
            {[
              { label: 'لغو بیش از ۲۴ ساعت قبل', value: '100', desc: '% استرداد' },
              { label: 'لغو ۲ تا ۲۴ ساعت قبل', value: '50', desc: '% استرداد' },
              { label: 'لغو کمتر از ۲ ساعت قبل', value: '0', desc: '% استرداد' },
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{rule.label}</p>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    defaultValue={rule.value}
                    min="0"
                    max="100"
                    className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500 ltr"
                  />
                  <span className="text-xs text-slate-500">{rule.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
