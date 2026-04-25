import React from 'react';
import { useNavigate } from 'react-router';
import {
  Smartphone, Monitor, Calendar, CreditCard, Users,
  ChevronLeft, Sparkles, Shield, Star, ArrowLeft,
  BarChart3, Clock, Settings,
} from 'lucide-react';
import { CLINIC_INFO } from '../data/mockData';
import { toPersian } from '../utils/persian';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900" dir="rtl">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/50">
            <span className="text-white text-sm font-bold">CGP</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Clinic Growth Platform</p>
            <p className="text-teal-400 text-xs">پلتفرم مدیریت کلینیک</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/client')}
            className="text-white/70 hover:text-white text-sm px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
          >
           
          </button>

        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-900/50 border border-teal-700/50 text-teal-300 px-4 py-2 rounded-full text-sm mb-6">
            <Sparkles size={14} />
            پلتفرم کامل مدیریت کلینیک زیبایی
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            سیستم مدیریت هوشمند
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-300 to-cyan-400">
              کلینیک زیبایی
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            تقویم جلالی، پرداخت زرین‌پال، مدیریت نوبت RTL-first
            طراحی شده برای کلینیک‌های زیبایی ایران
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => navigate('/client')}
              className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3.5 rounded-2xl font-semibold hover:bg-slate-100 transition-colors shadow-xl"
            >
              <Smartphone size={18} />
             نمای کلینیک (دمو)
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => navigate('/clinic-login')}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3.5 rounded-2xl font-semibold hover:bg-teal-500 transition-colors shadow-xl shadow-teal-900/50"
            >
              <Monitor size={18} />
              شروع
              <ArrowLeft size={18} />
            </button>
          </div>
        </div>

        {/* Screens preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Client App */}
          <div
            className="group cursor-pointer bg-gradient-to-br from-teal-800/40 to-teal-900/40 border border-teal-700/30 rounded-3xl p-6 hover:border-teal-500/50 transition-all hover:shadow-xl hover:shadow-teal-900/50"
            onClick={() => navigate('/client')}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-600/30 rounded-xl flex items-center justify-center">
                <Smartphone size={18} className="text-teal-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold">اپلیکیشن بیمار</h3>
                <p className="text-teal-400 text-xs">موبایل-فرست، RTL</p>
              </div>
              <ChevronLeft size={18} className="text-teal-400 mr-auto group-hover:-translate-x-1 transition-transform" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                '🏥 پروفایل کلینیک',
                '🗓️ انتخاب خدمات',
                '📅 تقویم جلالی',
                '⏰ انتخاب ساعت',
                '💳 پرداخت زرین‌پال',
                '🎫 کارت تایید رزرو',
                '📋 لیست نوبت‌ها',
                '🖼️ آرشیو تصاویر',
              ].map((item, i) => (
                <div key={i} className="bg-teal-900/30 rounded-xl px-3 py-2 text-teal-300">{item}</div>
              ))}
            </div>
          </div>

          {/* Admin Panel */}
          <div
            className="group cursor-pointer bg-gradient-to-br from-indigo-800/40 to-indigo-900/40 border border-indigo-700/30 rounded-3xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-900/50"
            onClick={() => navigate('/admin/dashboard')}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600/30 rounded-xl flex items-center justify-center">
                <Monitor size={18} className="text-indigo-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold">پنل مدیریت</h3>
                <p className="text-indigo-400 text-xs">دسکتاپ-فرست، داشبورد کامل</p>
              </div>
              <ChevronLeft size={18} className="text-indigo-400 mr-auto group-hover:-translate-x-1 transition-transform" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                '📊 داشبورد KPI',
                '📋 لیست رزروها',
                '🗓️ تقویم هفتگی',
                '⏰ ساعات کاری',
                '✂️ مدیریت خدمات',
                '👥 مدیریت کارمندان',
                '💰 تراکنش‌های مالی',
                '🔔 نظارت سیستم',
              ].map((item, i) => (
                <div key={i} className="bg-indigo-900/30 rounded-xl px-3 py-2 text-indigo-300">{item}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <Calendar size={20} className="text-teal-400" />, title: 'تقویم جلالی', desc: 'با تعطیلات رسمی' },
            { icon: <CreditCard size={20} className="text-amber-400" />, title: 'زرین‌پال', desc: 'پرداخت امن داخلی' },
            { icon: <Shield size={20} className="text-emerald-400" />, title: 'کاملاً RTL', desc: 'فارسی‌اول' },
            { icon: <BarChart3 size={20} className="text-blue-400" />, title: 'داشبورد تحلیلی', desc: 'KPI های کلیدی' },
            { icon: <Users size={20} className="text-purple-400" />, title: 'چند مستاجری', desc: 'Multi-tenant' },
            { icon: <Clock size={20} className="text-rose-400" />, title: 'رزرو موقت ۱۵ دقیقه', desc: 'TTL خودکار' },
            { icon: <Star size={20} className="text-yellow-400" />, title: 'آرشیو تصاویر', desc: 'با رضایت‌نامه' },
            { icon: <Settings size={20} className="text-slate-400" />, title: 'قابل تنظیم', desc: 'تمام پارامترها' },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
              <div className="mb-2">{f.icon}</div>
              <p className="text-white font-medium text-sm">{f.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-3">ساخته شده با</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            {['React + TypeScript', 'React Router v7', 'Tailwind CSS v4', 'jalaali-js', 'Recharts', 'Vazirmatn Font', 'ZarinPal API', 'Lucide Icons'].map(t => (
              <span key={t} className="bg-white/5 border border-white/10 text-slate-400 px-3 py-1.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
