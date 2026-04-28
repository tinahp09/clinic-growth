import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Star, MapPin, Phone, Clock, ChevronLeft, ChevronRight,
  Shield, Award, Heart, Sparkles, ArrowLeft,
} from 'lucide-react';
import { CLINIC_INFO, SERVICES } from '../../data/mockData';
import { toPersian, formatPrice, formatDuration } from '../../utils/persian';

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1759262151080-e05ba1c6294f?w=800',
  'https://images.unsplash.com/photo-1761718210055-e83ca7e2c9ad?w=800',
  'https://images.unsplash.com/photo-1700760933574-9f0f4ea9aa3b?w=800',
];

const FEATURES = [
  { icon: <Shield size={18} className="text-teal-600" />, label: 'تجهیزات پیشرفته' },
  { icon: <Award size={18} className="text-teal-600" />, label: 'پزشکان متخصص' },
  { icon: <Heart size={18} className="text-teal-600" />, label: 'مراقبت ویژه' },
  { icon: <Sparkles size={18} className="text-teal-600" />, label: 'نتایج دائمی' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'جوانسازی': 'bg-teal-50 text-teal-700',
  'لیزر': 'bg-purple-50 text-purple-700',
  'تزریقی': 'bg-rose-50 text-rose-700',
  'لیفتینگ': 'bg-orange-50 text-orange-700',
  'مراقبت پوست': 'bg-blue-50 text-blue-700',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);

  const featuredServices = SERVICES.slice(0, 4);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        <div className="relative h-72 overflow-hidden">
          {GALLERY_IMAGES.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === activeImg ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Gallery dots */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
            {GALLERY_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeImg ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Clinic info on hero */}
          <div className="absolute bottom-0 inset-x-0 p-4">
            <h1 className="text-xl font-bold text-white">{CLINIC_INFO.name}</h1>
            <p className="text-white/80 text-sm mt-0.5">{CLINIC_INFO.tagline}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-white text-sm font-medium">{toPersian(CLINIC_INFO.rating)}</span>
                <span className="text-white/60 text-xs">({toPersian(CLINIC_INFO.reviewCount)} نظر)</span>
              </div>
              <div className="w-px h-3 bg-white/30" />
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Clock size={12} />
                <span>{CLINIC_INFO.openHours}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick info bar */}
      <div className="bg-teal-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-white text-xs">
          <MapPin size={13} />
          <span className="truncate max-w-[180px]">{CLINIC_INFO.address.split('،')[1]}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white text-xs">
          <Phone size={13} />
          <span className="ltr">{CLINIC_INFO.phone}</span>
        </div>
      </div>

      {/* Book CTA */}
      <div className="px-4 py-5">
        <button
          onClick={() => navigate('/client/services')}
          className="w-full bg-gradient-to-l from-teal-600 to-teal-700 text-white py-4 rounded-2xl font-semibold text-base shadow-lg shadow-teal-200 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-teal-200 transition-all active:scale-98"
        >
          <Sparkles size={18} />
          رزرو نوبت آنلاین
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* Features */}
      <div className="px-4 pb-4 grid grid-cols-4 gap-2">
        {FEATURES.map((f, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl text-center">
            {f.icon}
            <span className="text-xs text-slate-600 leading-tight">{f.label}</span>
          </div>
        ))}
      </div>

      {/* Services section */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">خدمات ما</h2>
          <button
            onClick={() => navigate('/client/services')}
            className="text-sm text-teal-600 flex items-center gap-1"
          >
            همه خدمات
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="space-y-2.5">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm hover:border-teal-200 transition-colors cursor-pointer"
              onClick={() => navigate('/client/services')}
            >
              {service.image && (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                </div>
              )}
              {!service.image && (
                <div className="w-14 h-14 rounded-xl bg-teal-50 flex-shrink-0 flex items-center justify-center">
                  <Sparkles size={20} className="text-teal-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-800 text-sm">{service.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-lg flex-shrink-0 ${
                    CATEGORY_COLORS[service.category] || 'bg-slate-50 text-slate-600'
                  }`}>
                    {service.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{service.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={11} />
                    {formatDuration(service.duration)}
                  </span>
                  <span className="text-xs font-semibold text-teal-700">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-4 py-5">
        <h2 className="font-semibold text-slate-800 mb-3">نظرات زیباجوان</h2>
        <div className="space-y-3">
          {[
            { name: 'فاطمه م.', text: 'بهترین کلینیک زیبایی که تا به حال رفتم. نتیجه مزوتراپی فوق‌العاده بود!', rating: 5 },
            { name: 'سارا ک.', text: 'دکتر رضایی خیلی حرفه‌ای و مهربان هستند. قطعاً برمی‌گردم.', rating: 5 },
            { name: 'نیلوفر ت.', text: 'سیستم رزرو آنلاین خیلی راحت است. مراقبت بعد از درمان هم عالی بود.', rating: 4 },
          ].map((r, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-700 text-sm font-medium">{r.name[0]}</span>
                </div>
                <span className="text-sm font-medium text-slate-700">{r.name}</span>
                <div className="flex mr-auto">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

    
    </div>
  );
}
