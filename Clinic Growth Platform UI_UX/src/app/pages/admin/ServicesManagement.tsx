import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, Search, Scissors, AlertCircle } from 'lucide-react';
import { SERVICES, type Service } from '../../data/mockData';
import { toPersian, formatPrice, formatDuration } from '../../utils/persian';

const CATEGORY_COLORS: Record<string, string> = {
  'جوانسازی': 'bg-teal-50 text-teal-700 border-teal-200',
  'لیزر': 'bg-purple-50 text-purple-700 border-purple-200',
  'تزریقی': 'bg-rose-50 text-rose-700 border-rose-200',
  'لیفتینگ': 'bg-orange-50 text-orange-700 border-orange-200',
  'مراقبت پوست': 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function ServicesManagement() {
  const [services, setServices] = useState(SERVICES);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filtered = services.filter(s =>
    !search || s.name.includes(search) || s.category.includes(search)
  );

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">مدیریت خدمات</h1>
          <p className="text-sm text-slate-500 mt-0.5">{toPersian(services.length)} خدمت ثبت شده</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-teal-200 hover:bg-teal-700 transition-colors"
        >
          <Plus size={16} />
          خدمت جدید
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجو نام خدمت یا دسته‌بندی..."
          className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
        />
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            {service.image && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs border font-medium ${
                  CATEGORY_COLORS[service.category] || 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {service.category}
                </div>
              </div>
            )}
            {!service.image && (
              <div className={`w-full h-20 rounded-xl mb-4 flex items-center justify-center ${
                CATEGORY_COLORS[service.category]?.split(' ')[0] || 'bg-slate-50'
              }`}>
                <Scissors size={28} className="text-slate-300" />
              </div>
            )}

            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-slate-800">{service.name}</h3>
              {!service.image && (
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  CATEGORY_COLORS[service.category] || 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {service.category}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{service.description}</p>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                <Clock size={11} />
                {formatDuration(service.duration)}
              </div>
              <div className="text-sm font-bold text-teal-700">{formatPrice(service.price)}</div>
            </div>

            {/* Incompatibilities */}
            {service.incompatibleWith && service.incompatibleWith.length > 0 && (
              <div className="mb-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                <AlertCircle size={12} />
                ناسازگار با {toPersian(service.incompatibleWith.length)} خدمت
              </div>
            )}

            {/* Required room */}
            {service.requiresRoom && (
              <div className="mb-3 text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                نیاز به اتاق: {service.requiresRoom === 'LASER' ? 'لیزر' : service.requiresRoom}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-teal-200 text-teal-600 text-xs font-medium hover:bg-teal-50 transition-colors">
                <Edit size={13} />
                ویرایش
              </button>
              <button className="flex items-center justify-center p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center gap-2 hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer min-h-[200px]"
        >
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
            <Plus size={20} className="text-teal-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">افزودن خدمت جدید</p>
        </button>
      </div>

      {/* Add form modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-5">افزودن خدمت جدید</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">نام خدمت</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="مثال: مزوتراپی پوست"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">مدت (دقیقه)</label>
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">قیمت (تومان)</label>
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ltr"
                    placeholder="1500000"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">دسته‌بندی</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  <option>جوانسازی</option>
                  <option>لیزر</option>
                  <option>تزریقی</option>
                  <option>لیفتینگ</option>
                  <option>مراقبت پوست</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium"
              >
                انصراف
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold shadow-lg shadow-teal-200"
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
