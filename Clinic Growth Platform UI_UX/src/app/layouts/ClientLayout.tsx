import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { Calendar, Home, User, Image, ArrowRight } from 'lucide-react';
import { CLINIC_INFO } from '../data/mockData';

export function ClientLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      {/* Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 z-50">
        <div className="max-w-md mx-auto flex">
          <NavItem to="/client" icon={<Home size={22} />} label="خانه" end />
          <NavItem to="/client/appointments" icon={<Calendar size={22} />} label="نوبت‌هایم" />
          <NavItem to="/client/vault" icon={<Image size={22} />} label="آرشیو تصاویر" />
          <NavItem to="/client/profile" icon={<User size={22} />} label="پروفایل" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-colors ${
          isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
            {icon}
          </div>
          <span className="text-xs">{label}</span>
          {/* @ts-ignore */}
          {/* active dot */}
        </>
      )}
    </NavLink>
  );
}
