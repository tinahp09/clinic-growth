import React, { useState } from 'react';
import { Image, Lock, Shield, Eye, Download, Info, X } from 'lucide-react';
import { MEDIA_ITEMS, type MediaItem } from '../../data/mockData';
import { toPersian } from '../../utils/persian';

type FilterType = 'ALL' | 'BEFORE' | 'AFTER' | 'PROGRESS';

const FILTER_LABELS: Record<FilterType, string> = {
  ALL: 'همه',
  BEFORE: 'قبل از درمان',
  AFTER: 'بعد از درمان',
  PROGRESS: 'پیشرفت',
};

const TYPE_COLORS: Record<string, string> = {
  BEFORE: 'bg-amber-100 text-amber-700',
  AFTER: 'bg-emerald-100 text-emerald-700',
  PROGRESS: 'bg-blue-100 text-blue-700',
};
const TYPE_LABELS: Record<string, string> = {
  BEFORE: 'قبل',
  AFTER: 'بعد',
  PROGRESS: 'پیشرفت',
};

function ImageModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
            <p className="font-semibold text-slate-800 text-sm">{item.serviceName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(item.uploadedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
              <Download size={16} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="relative">
          <img src={item.url} alt="" className="w-full aspect-square object-cover" />
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold ${TYPE_COLORS[item.type]}`}>
            {TYPE_LABELS[item.type]}
          </div>
          {item.consentGiven && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1 text-xs text-emerald-700 font-medium">
              <Shield size={11} />
              رضایت‌نامه ثبت شده
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-slate-500">
            این تصویر مربوط به نوبت {item.bookingId} می‌باشد
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MediaVault() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [consentChecked] = useState(true); // Simulated

  const filtered = MEDIA_ITEMS.filter(item =>
    filter === 'ALL' || item.type === filter
  );

  const filters: FilterType[] = ['ALL', 'BEFORE', 'AFTER', 'PROGRESS'];

  if (!consentChecked) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Lock size={28} className="text-slate-400" />
        </div>
        <h2 className="font-bold text-slate-800 text-lg mb-2">آرشیو تصاویر قفل است</h2>
        <p className="text-sm text-slate-500">
          دسترسی به آرشیو تصاویر نیاز به تایید رزرو، انجام درمان و ارائه رضایت‌نامه دارد.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">آرشیو تصاویر</h1>
              <p className="text-sm text-slate-400 mt-0.5">تصاویر قبل و بعد از درمان</p>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">
              <Shield size={13} className="text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">محرمانه</span>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy notice */}
      <div className="mx-4 mt-4 flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
        <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          این تصاویر فقط برای شما قابل مشاهده است و اطلاعات شما کاملاً محرمانه نگه داشته می‌شود.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 mt-3">
        {[
          { label: 'قبل از درمان', count: MEDIA_ITEMS.filter(m => m.type === 'BEFORE').length, color: 'text-amber-600' },
          { label: 'بعد از درمان', count: MEDIA_ITEMS.filter(m => m.type === 'AFTER').length, color: 'text-emerald-600' },
          { label: 'پیشرفت', count: MEDIA_ITEMS.filter(m => m.type === 'PROGRESS').length, color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-3 text-center border border-slate-100">
            <p className={`text-xl font-bold ${stat.color}`}>{toPersian(stat.count)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="px-4 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Image size={24} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">تصویری یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(item => (
              <div
                key={item.id}
                className="relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer group"
                onClick={() => setSelected(item)}
              >
                <div className="relative aspect-square">
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Type badge */}
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${TYPE_COLORS[item.type]}`}>
                    {TYPE_LABELS[item.type]}
                  </div>
                  {/* Consent badge */}
                  {item.consentGiven && (
                    <div className="absolute bottom-2 left-2 bg-white/90 rounded-full p-1">
                      <Shield size={11} className="text-emerald-600" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye size={24} className="text-white" />
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-slate-700 truncate">{item.serviceName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(item.uploadedAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image modal */}
      {selected && (
        <ImageModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
