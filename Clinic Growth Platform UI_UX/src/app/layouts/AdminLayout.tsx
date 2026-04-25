import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Calendar, CalendarDays, Clock, Scissors,
  Users, DoorOpen, CreditCard, RefreshCw, Settings, Activity,
  LogOut, ChevronLeft, ChevronRight, Bell, Menu, X,
  BookOpen, TrendingUp, Image,
} from 'lucide-react';
import { CLINIC_INFO } from '../data/mockData';
import { toPersian } from '../utils/persian';

const NAV_ITEMS = [
  { group: 'کلی', items: [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'داشبورد' },
  ]},
  { group: 'نوبت‌ها', items: [
    { to: '/admin/bookings', icon: <BookOpen size={18} />, label: 'لیست رزروها' },
    { to: '/admin/calendar', icon: <CalendarDays size={18} />, label: 'تقویم' },
  ]},
   { group: 'مدیریت', items: [
     { to: '/admin/working-hours', icon: <Clock size={18} />, label: 'ساعات کاری' },
     { to: '/admin/services', icon: <Scissors size={18} />, label: 'خدمات' },
     { to: '/admin/staff', icon: <Users size={18} />, label: 'کارمندان' },
     { to: '/admin/rooms', icon: <DoorOpen size={18} />, label: 'اتاق‌ها' },
     { to: '/admin/media', icon: <Image size={18} />, label: 'تصاویر قبل و بعد' },
   ]},
  { group: 'مالی', items: [
    { to: '/admin/payments', icon: <CreditCard size={18} />, label: 'پرداخت‌ها' },
    { to: '/admin/refunds', icon: <RefreshCw size={18} />, label: 'استرداد' },
  ]},
  { group: 'سیستم', items: [
    { to: '/admin/settings', icon: <Settings size={18} />, label: 'تنظیمات' },
    { to: '/admin/observability', icon: <Activity size={18} />, label: 'نظارت سیستم' },
  ]},
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full bg-white border-l border-slate-100 z-40
        flex flex-col transition-all duration-300 shadow-sm
        ${sidebarOpen ? 'w-60' : 'w-16'}
      `}>
        {/* Logo area */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          {sidebarOpen && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-bold">CGP</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 leading-none">{CLINIC_INFO.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">پنل مدیریت</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="mb-4">
              {sidebarOpen && (
                <p className="text-xs font-medium text-slate-400 uppercase px-2 mb-1.5 tracking-wide">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all mb-0.5 ${
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`
                  }
                  title={!sidebarOpen ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex-shrink-0 ${isActive ? 'text-teal-600' : ''}`}>
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                      {sidebarOpen && isActive && (
                        <span className="mr-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-100">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
            title={!sidebarOpen ? 'خروج از پنل' : undefined}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">خروج از پنل</span>}
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'mr-60' : 'mr-16'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-slate-700">
              {CLINIC_INFO.name}
            </h1>
            <span className="hidden md:flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              آنلاین
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">م</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-700">مدیر کلینیک</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
