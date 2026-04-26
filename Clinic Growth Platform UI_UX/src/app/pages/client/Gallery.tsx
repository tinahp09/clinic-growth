import React, { useState } from 'react';
import { Image, ChevronLeft, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { MEDIA_ITEMS, SERVICES, type MediaItem } from '../../data/mockData';
import { toPersian } from '../../utils/persian';

type FilterType = 'ALL' | 'BEFORE' | 'AFTER';
type ViewMode = 'side-by-side' | 'single';

const TYPE_COLORS: Record<string, string> = {
  BEFORE: 'bg-amber-100 text-amber-700',
  AFTER: 'bg-emerald-100 text-emerald-700',
};

const TYPE_LABELS: Record<string, string> = {
  BEFORE: 'قبل از درمان',
  AFTER: 'بعد از درمان',
};

function BeforeAfterPair({
  beforeItem,
  afterItem,
  onView,
}: {
  beforeItem: MediaItem;
  afterItem: MediaItem;
  onView: (item: MediaItem) => void;
}) {
  return (
    <div
      className="relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer group aspect-[4/3]"
      onClick={() => onView(afterItem)}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }}>
          <img
            src={beforeItem.url}
            alt="قبل"
            className="w-[200%] h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 0 50%)' }}>
          <img
            src={afterItem.url}
            alt="بعد"
            className="w-[200%] h-full object-cover mr-[-100%]"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute right-1/2 top-0 bottom-0 w-0.5 bg-white shadow-lg z-10" />
          <div className="absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg z-20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-600">
              <path d="M4 7H10M4 7L6 5M4 7L6 9M10 7L8 5M10 7L8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 text-amber-700">
          قبل
        </div>
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 text-emerald-700">
          بعد
        </div>
      </div>
      <div className="p-4 border-t border-slate-50">
        <p className="text-sm font-semibold text-slate-800 text-center">
          {beforeItem.serviceName}
        </p>
        <p className="text-xs text-slate-400 mt-1 text-center">
          نتایج واقعی درمان
        </p>
      </div>
    </div>
  );
}

function GalleryModal({
  item,
  beforeItem,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  item: MediaItem;
  beforeItem?: MediaItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-full text-white transition-colors z-10"
      >
        <X size={20} />
      </button>

      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 hover:bg-white/10 rounded-full text-white transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      )}

      <div className="max-w-4xl w-full mx-4">
        <div className="relative bg-white rounded-2xl overflow-hidden aspect-[16/9]">
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: beforeItem ? 'inset(0 50% 0 0)' : 'inset(0 0 0 0)' }}>
            {beforeItem && (
              <img
                src={beforeItem.url}
                alt="قبل"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 0 50%)' }}>
            <img
              src={item.url}
              alt="بعد"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute right-1/2 top-0 bottom-0 w-0.5 bg-white shadow-lg z-10" />
            <div className="absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg z-20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-600">
                <path d="M5 8H11M11 8L8.5 5.5M11 8L8.5 10.5M5 8L7.5 5.5M5 8L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl text-sm font-bold bg-white/90 text-amber-700">
            قبل از درمان
          </div>
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl text-sm font-bold bg-white/90 text-emerald-700">
            بعد از درمان
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-white font-semibold text-lg">{item.serviceName}</p>
          <p className="text-white/60 text-sm mt-1">
            نتیجه واقعی درمان با {item.serviceName}
          </p>
        </div>
      </div>

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 hover:bg-white/10 rounded-full text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      )}
    </div>
  );
}

export default function Gallery() {
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const publicMedia = MEDIA_ITEMS.filter(
    (m) => m.isPublic && m.publicConsentGiven && m.isAnonymized
  );

  const filtered = publicMedia.filter((item) => {
    const matchesService = serviceFilter === 'ALL' || item.serviceId === serviceFilter;
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesService && matchesType;
  });

  const beforeItems = filtered.filter((m) => m.type === 'BEFORE');
  const afterItems = filtered.filter((m) => m.type === 'AFTER');

  const getPairs = () => {
    const pairs: { before: MediaItem; after: MediaItem }[] = [];
    const usedAfter = new Set<string>();

    beforeItems.forEach((before) => {
      const matchingAfter = afterItems.find(
        (after) =>
          after.serviceId === before.serviceId &&
          !usedAfter.has(after.id)
      );
      if (matchingAfter) {
        pairs.push({ before, after: matchingAfter });
        usedAfter.add(matchingAfter.id);
      }
    });

    afterItems.forEach((after) => {
      if (!usedAfter.has(after.id)) {
        pairs.push({ before: after, after });
        usedAfter.add(after.id);
      }
    });

    return pairs;
  };

  const pairs = getPairs();

  const handleViewItem = (item: MediaItem) => {
    const idx = filtered.findIndex((m) => m.id === item.id);
    setSelectedIndex(idx);
    setSelectedItem(item);
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      const newIdx = selectedIndex - 1;
      setSelectedIndex(newIdx);
      setSelectedItem(filtered[newIdx]);
    }
  };

  const handleNext = () => {
    if (selectedIndex < filtered.length - 1) {
      const newIdx = selectedIndex + 1;
      setSelectedIndex(newIdx);
      setSelectedItem(filtered[newIdx]);
    }
  };

  const getBeforeForCurrent = () => {
    if (!selectedItem) return undefined;
    return filtered.find(
      (m) => m.type === 'BEFORE' && m.serviceId === selectedItem.serviceId && m.id !== selectedItem.id
    );
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                نمونه کارها و نتایج درمان
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                مشاهده نتایج واقعی درمان‌های زیبایی
              </p>
            </div>
            <Link
              to="/client"
              className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
            >
              <ArrowLeft size={14} />
              بازگشت
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="ALL">همه خدمات</option>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(['ALL', 'BEFORE', 'AFTER'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === f
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f === 'ALL' ? 'همه' : f === 'BEFORE' ? 'قبل' : 'بعد'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span>{toPersian(pairs.length)} جفت نتیجه یافت شد</span>
          <span className="mx-2">•</span>
          <span>تمام تصاویر با رضایت زیباجو و ناشناس‌شده منتشر شده‌اند</span>
        </div>

        {pairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Image size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium mb-1">تصویری یافت نشد</p>
            <p className="text-sm text-slate-400">
              نتایج درمان‌ها به زودی اضافه می‌شوند
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {pairs.map((pair, idx) => (
              <BeforeAfterPair
                key={idx}
                beforeItem={pair.before}
                afterItem={pair.after}
                onView={handleViewItem}
              />
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-3xl p-6 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-3 text-center">
            مشاوره رایگان
          </h2>
          <p className="text-sm text-slate-500 text-center mb-4">
            برای دریافت مشاوره رایگان درباره خدمات زیبایی با ما تماس بگیرید
          </p>
          <Link
            to="/client/services"
            className="block w-full text-center bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            رزرو مشاوره رایگان
          </Link>
        </div>
      </div>

      {selectedItem && (
        <GalleryModal
          item={selectedItem}
          beforeItem={getBeforeForCurrent()}
          onClose={() => setSelectedItem(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < filtered.length - 1}
        />
      )}
    </div>
  );
}