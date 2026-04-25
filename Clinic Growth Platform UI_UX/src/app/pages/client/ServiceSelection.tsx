import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronRight, Clock, Sparkles, AlertCircle, Info } from 'lucide-react';
import { SERVICES, type Service } from '../../data/mockData';
import { toPersian, formatPrice, formatDuration } from '../../utils/persian';

const CATEGORIES = ['همه', 'جوانسازی', 'لیزر', 'تزریقی', 'لیفتینگ', 'مراقبت پوست'];

const CATEGORY_COLORS: Record<string, string> = {
  'جوانسازی': 'bg-teal-50 text-teal-700 border-teal-200',
  'لیزر': 'bg-purple-50 text-purple-700 border-purple-200',
  'تزریقی': 'bg-rose-50 text-rose-700 border-rose-200',
  'لیفتینگ': 'bg-orange-50 text-orange-700 border-orange-200',
  'مراقبت پوست': 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function ServiceSelection() {
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('همه');

  const filteredServices = activeCategory === 'همه'
    ? SERVICES
    : SERVICES.filter(s => s.category === activeCategory);

  const isIncompatible = (service: Service): boolean => {
    if (!service.incompatibleWith) return false;
    return service.incompatibleWith.some(id => selectedServices.includes(id));
  };

  const isAlreadyIncompatibleWith = (service: Service): string[] => {
    if (!service.incompatibleWith) return [];
    return service.incompatibleWith.filter(id => selectedServices.includes(id));
  };

  const toggleService = (service: Service) => {
    if (isIncompatible(service)) return;
    if (selectedServices.includes(service.id)) {
      setSelectedServices(prev => prev.filter(id => id !== service.id));
    } else {
      setSelectedServices(prev => [...prev, service.id]);
    }
  };

  const selectedData = SERVICES.filter(s => selectedServices.includes(s.id));
  const totalDuration = selectedData.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedData.reduce((sum, s) => sum + s.price, 0);

  const handleContinue = () => {
    if (selectedServices.length === 0) return;
    // In real app, pass selection via state/context
    navigate('/client/date');
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button
            onClick={() => navigate('/client')}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <div>
            <h1 className="font-semibold text-slate-800">انتخاب خدمات</h1>
            <p className="text-xs text-slate-500">می‌توانید چند خدمت انتخاب کنید</p>
          </div>
          {selectedServices.length > 0 && (
            <span className="mr-auto bg-teal-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
              {toPersian(selectedServices.length)}
            </span>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services list */}
      <div className="px-4 py-3 space-y-2.5">
        {filteredServices.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          const incompatible = isIncompatible(service);
          const incompatibleNames = isAlreadyIncompatibleWith(service)
            .map(id => SERVICES.find(s => s.id === id)?.name || '');

          return (
            <div
              key={service.id}
              onClick={() => toggleService(service)}
              className={`
                relative bg-white rounded-2xl border-2 p-4 transition-all cursor-pointer
                ${isSelected
                  ? 'border-teal-500 shadow-md shadow-teal-100'
                  : incompatible
                  ? 'border-slate-100 opacity-50 cursor-not-allowed'
                  : 'border-transparent shadow-sm hover:border-slate-200 hover:shadow-md'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 left-3 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}

              <div className="flex gap-3">
                {service.image ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center">
                    <Sparkles size={22} className="text-slate-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 pr-6">
                    <p className="font-medium text-slate-800 text-sm">{service.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-lg border flex-shrink-0 ${
                      CATEGORY_COLORS[service.category] || 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {service.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{service.description}</p>

                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={11} />
                      {formatDuration(service.duration)}
                    </span>
                    <span className="text-sm font-bold text-teal-700">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Incompatibility warning */}
              {incompatible && incompatibleNames.length > 0 && (
                <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded-xl p-2.5">
                  <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    با «{incompatibleNames.join('، ')}» قابل ترکیب نیست
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Multi-service info */}
      {selectedServices.length > 1 && (
        <div className="mx-4 mb-3 flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
          <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            زمان کل ممکن است کمتر از جمع زمان‌ها باشد. پزشک تایم بهینه را تعیین می‌کند.
          </p>
        </div>
      )}

      {/* Bottom summary + CTA */}
      {selectedServices.length > 0 && (
        <div className="sticky bottom-20 mx-4 mb-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500">
                  {toPersian(selectedServices.length)} خدمت انتخاب شده
                </p>
                <p className="text-sm font-medium text-slate-700">
                  مدت: {formatDuration(totalDuration)}
                </p>
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500">جمع کل</p>
                <p className="text-base font-bold text-teal-700">{formatPrice(totalPrice)}</p>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-teal-700 transition-colors"
            >
              ادامه — انتخاب تاریخ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
