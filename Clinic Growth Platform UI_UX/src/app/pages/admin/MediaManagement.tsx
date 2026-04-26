import React, { useState, useRef } from 'react';
import {
  Search, Filter, Image, Eye, Globe, GlobeLock,
  Shield, CheckCircle, XCircle, AlertTriangle, X,
  ChevronRight, ChevronLeft, Check, Sparkles, Plus, Upload, User, Calendar,
} from 'lucide-react';
import { MEDIA_ITEMS, SERVICES, BOOKINGS, type MediaItem } from '../../data/mockData';
import { toPersian } from '../../utils/persian';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

type FilterType = 'ALL' | 'BEFORE' | 'AFTER' | 'PROGRESS';
type StatusFilter = 'ALL' | 'PRIVATE' | 'PUBLIC_PENDING' | 'PUBLIC';

const FILTER_LABELS: Record<FilterType, string> = {
  ALL: 'همه',
  BEFORE: 'قبل',
  AFTER: 'بعد',
  PROGRESS: 'پیشرفت',
};

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  ALL: 'همه',
  PRIVATE: 'خصوصی',
  PUBLIC_PENDING: 'در انتظار عمومی‌سازی',
  PUBLIC: 'عمومی',
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

function ImageModal({
  item,
  onClose,
  onTogglePublic,
  allItems,
}: {
  item: MediaItem;
  onClose: () => void;
  onTogglePublic: () => void;
  allItems: MediaItem[];
}) {
  const canMakePublic = item.publicConsentGiven && item.isAnonymized;
  const showWarning = !item.publicConsentGiven || !item.isAnonymized;

  const beforeItem = allItems.find(
    (m) => m.serviceId === item.serviceId && m.type === 'BEFORE' && m.id !== item.id
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
            <p className="font-semibold text-slate-800 text-sm">{item.serviceName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(item.uploadedAt).toLocaleDateString('fa-IR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative bg-slate-100 aspect-[16/10]">
          <div className="relative w-full h-full">
            {beforeItem && (
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                <img
                  src={beforeItem.url}
                  alt="قبل"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
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
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-600">
                  <path d="M4 7H10M4 7L6 5M4 7L6 9M10 7L8 5M10 7L8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {beforeItem && (
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl text-sm font-bold bg-white/90 text-amber-700">
                قبل
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl text-sm font-bold bg-white/90 text-emerald-700">
              بعد
            </div>
            {item.isPublic && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-teal-600 text-white rounded-full px-3 py-1 text-xs font-medium">
                <Globe size={11} />
                عمومی
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Shield size={12} />
                رضایت شخصی
              </div>
              {item.consentGiven ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle size={12} /> دارد
                </span>
              ) : (
                <span className="text-red-500 font-medium flex items-center gap-1">
                  <XCircle size={12} /> ندارد
                </span>
              )}
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Globe size={12} />
                رضایت عمومی
              </div>
              {item.publicConsentGiven ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle size={12} /> دارد
                </span>
              ) : (
                <span className="text-red-500 font-medium flex items-center gap-1">
                  <XCircle size={12} /> ندارد
                </span>
              )}
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Sparkles size={12} />
                ناشناس‌سازی
              </div>
              {item.isAnonymized ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle size={12} /> شده
                </span>
              ) : (
                <span className="text-red-500 font-medium flex items-center gap-1">
                  <XCircle size={12} /> نشده
                </span>
              )}
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Eye size={12} />
                قابل مشاهده برای زیباجو
              </div>
              {item.visibleToClient ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle size={12} /> بله
                </span>
              ) : (
                <span className="text-red-500 font-medium flex items-center gap-1">
                  <XCircle size={12} /> خیر
                </span>
              )}
            </div>
          </div>

          {showWarning && (
            <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3 border border-amber-100">
              <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700">
                {!item.publicConsentGiven && (
                  <p className="mb-1">• رضایت‌نامه عمومی زیباجو اخذ نشده است</p>
                )}
                {!item.isAnonymized && (
                  <p>• تصویر ناشناس‌سازی نشده و قابل شناسایی است</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onTogglePublic}
              disabled={!canMakePublic}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.isPublic
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : canMakePublic
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {item.isPublic ? (
                <>
                  <GlobeLock size={15} />
                  حذف از عمومی
                </>
              ) : canMakePublic ? (
                <>
                  <Globe size={15} />
                  انتشار عمومی
                </>
              ) : (
                <>
                  <AlertTriangle size={15} />
                  نیاز به شرایط
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadModal({
  open,
  onClose,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (data: UploadData) => void;
}) {
  const [type, setType] = useState<'BEFORE' | 'AFTER' | 'PROGRESS'>('BEFORE');
  const [serviceId, setServiceId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [publicConsentGiven, setPublicConsentGiven] = useState(false);
  const [isAnonymized, setIsAnonymized] = useState(false);
  const [visibleToClient, setVisibleToClient] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!serviceId || !bookingId || !patientName || !imageUrl) return;
    onUpload({
      type,
      serviceId,
      bookingId,
      patientName,
      imageUrl,
      consentGiven,
      publicConsentGiven,
      isAnonymized,
      visibleToClient,
    });
    setType('BEFORE');
    setServiceId('');
    setBookingId('');
    setPatientName('');
    setImageUrl('');
    setConsentGiven(false);
    setPublicConsentGiven(false);
    setIsAnonymized(false);
    setVisibleToClient(true);
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedService = SERVICES.find((s) => s.id === serviceId);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload size={20} className="text-teal-600" />
            آپلود تصویر جدید
          </DialogTitle>
          <DialogDescription>
            تصویر قبل یا بعد از درمان را آپلود کنید
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>نوع تصویر</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEFORE">قبل از درمان</SelectItem>
                  <SelectItem value="AFTER">بعد از درمان</SelectItem>
                  <SelectItem value="PROGRESS">پیشرفت درمان</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>خدمات</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>شماره رزرو</Label>
            <Select value={bookingId} onValueChange={setBookingId}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب رزرو" />
              </SelectTrigger>
              <SelectContent>
                {BOOKINGS.filter((b) => b.status === 'CONFIRMED').map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.bookingNumber} - {b.patientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>نام زیباجو</Label>
            <Input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="نام زیباجو"
            />
          </div>

          <div className="space-y-2">
            <Label>تصویر</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
            >
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageUrl('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className="text-slate-400" />
                  <p className="text-sm text-slate-500">
                    برای آپلود کلیک کنید
                  </p>
                  <p className="text-xs text-slate-400">
                    فرمت‌های مجاز: JPG, PNG
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="space-y-3">
            <Label>رضایت‌ها</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600"
                />
                <span className="text-sm text-slate-600">
                  رضایت شخصی زیباجو برای مشاهده
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicConsentGiven}
                  onChange={(e) => setPublicConsentGiven(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600"
                />
                <span className="text-sm text-slate-600">
                  رضایت برای نمایش عمومی
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymized}
                  onChange={(e) => setIsAnonymized(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600"
                />
                <span className="text-sm text-slate-600">
                  تصویر ناشناس‌سازی شده
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleToClient}
                  onChange={(e) => setVisibleToClient(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600"
                />
                <span className="text-sm text-slate-600">
                  قابل مشاهده برای زیباجو
                </span>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!serviceId || !bookingId || !patientName || !imageUrl}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Check size={15} />
            آپلود تصویر
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type UploadData = {
  type: 'BEFORE' | 'AFTER' | 'PROGRESS';
  serviceId: string;
  bookingId: string;
  patientName: string;
  imageUrl: string;
  consentGiven: boolean;
  publicConsentGiven: boolean;
  isAnonymized: boolean;
  visibleToClient: boolean;
};

export default function MediaManagement() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(MEDIA_ITEMS);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = mediaItems.filter((item) => {
    const matchesSearch =
      !search ||
      item.patientName.includes(search) ||
      item.serviceName.includes(search);
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesService = serviceFilter === 'ALL' || item.serviceId === serviceFilter;
    let matchesStatus = true;
    if (statusFilter === 'PRIVATE') matchesStatus = !item.isPublic;
    else if (statusFilter === 'PUBLIC_PENDING')
      matchesStatus =
        !item.isPublic && (item.publicConsentGiven || item.isAnonymized);
    else if (statusFilter === 'PUBLIC') matchesStatus = item.isPublic;
    return matchesSearch && matchesType && matchesService && matchesStatus;
  });

  const handleTogglePublic = (item: MediaItem) => {
    setMediaItems((prev) =>
      prev.map((m) =>
        m.id === item.id
          ? {
              ...m,
              isPublic: !m.isPublic,
              publicConsentAt: !m.isPublic
                ? new Date().toISOString()
                : m.publicConsentAt,
            }
          : m
      )
    );
    setSelected(null);
  };

  const handleUpload = (data: UploadData) => {
    const newItem: MediaItem = {
      id: `med-${Date.now()}`,
      bookingId: data.bookingId,
      patientId: `pat-${Date.now()}`,
      patientName: data.patientName,
      serviceId: data.serviceId,
      serviceName: SERVICES.find((s) => s.id === data.serviceId)?.name || '',
      type: data.type,
      url: data.imageUrl,
      uploadedAt: new Date().toISOString(),
      uploadedByStaffId: 'stf-001',
      consentGiven: data.consentGiven,
      isPublic: false,
      publicConsentGiven: data.publicConsentGiven,
      isAnonymized: data.isAnonymized,
      visibleToClient: data.visibleToClient,
    };
    setMediaItems((prev) => [newItem, ...prev]);
  };

  const getPairs = () => {
    const pairs: { before?: MediaItem; after?: MediaItem; serviceName: string }[] = [];
    const used = new Set<string>();

    const services = [...new Set(mediaItems.map((m) => m.serviceId))];
    services.forEach((serviceId) => {
      const serviceItems = mediaItems.filter((m) => m.serviceId === serviceId);
      const serviceName = serviceItems[0]?.serviceName || '';

      const beforeItem = serviceItems.find((m) => m.type === 'BEFORE');
      const afterItem = serviceItems.find((m) => m.type === 'AFTER');

      if (beforeItem && afterItem && !used.has(beforeItem.id) && !used.has(afterItem.id)) {
        pairs.push({ before: beforeItem, after: afterItem, serviceName });
        used.add(beforeItem.id);
        used.add(afterItem.id);
      } else if (afterItem && !used.has(afterItem.id)) {
        pairs.push({ after: afterItem, serviceName });
        used.add(afterItem.id);
      }
    });

    mediaItems.forEach((item) => {
      if (!used.has(item.id)) {
        pairs.push({
          [item.type === 'BEFORE' ? 'before' : 'after']: item,
          serviceName: item.serviceName,
        });
      }
    });

    return pairs;
  };

  const pairs = getPairs();

  const stats = {
    total: mediaItems.length,
    private: mediaItems.filter((m) => !m.isPublic).length,
    public: mediaItems.filter((m) => m.isPublic).length,
    pending: mediaItems.filter(
      (m) => !m.isPublic && (m.publicConsentGiven || m.isAnonymized)
    ).length,
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">مدیریت رسانه</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {toPersian(filtered.length)} رسانه یافت شد
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 gap-2"
          >
            <Plus size={16} />
            آپلود تصویر
          </Button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Globe size={15} className="text-teal-600" />
            <span className="text-sm text-slate-600">
              عمومی: {toPersian(stats.public)}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <GlobeLock size={15} className="text-slate-400" />
            <span className="text-sm text-slate-600">
              خصوصی: {toPersian(stats.private)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو نام زیباجو، نام سرویس..."
              className="w-full border border-slate-200 rounded-xl pr-9 pl-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">همه خدمات</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="flex gap-1">
            {(['ALL', 'BEFORE', 'AFTER', 'PROGRESS'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  typeFilter === f
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {(['ALL', 'PRIVATE', 'PUBLIC_PENDING', 'PUBLIC'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === f
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {STATUS_FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {pairs.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Image size={24} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">رسانه‌ای یافت نشد</p>
          </div>
        ) : (
          pairs.map((pair, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer group hover:shadow-md transition-shadow aspect-[4/3]"
              onClick={() => pair.after && setSelected(pair.after)}
            >
              <div className="relative w-full h-full">
                {pair.before && (
                  <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                    <img
                      src={pair.before.url}
                      alt="قبل"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {pair.after && (
                  <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 0 50%)' }}>
                    <img
                      src={pair.after.url}
                      alt="بعد"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute right-1/2 top-0 bottom-0 w-0.5 bg-white shadow-lg z-10" />
                  <div className="absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg z-20 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-slate-500">
                      <path d="M2.5 5H7.5M7.5 5L5.5 3M7.5 5L5.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
                {pair.before && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs font-bold bg-white/90 text-amber-700">
                    قبل
                  </div>
                )}
                {pair.after && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold bg-white/90 text-emerald-700">
                    بعد
                  </div>
                )}
                {(pair.before?.isPublic || pair.after?.isPublic) && (
                  <div className="absolute top-2 right-2 bg-teal-600 text-white rounded-full p-1">
                    <Globe size={11} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {pair.serviceName}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <ImageModal
          item={selected}
          onClose={() => setSelected(null)}
          onTogglePublic={() => handleTogglePublic(selected)}
          allItems={mediaItems}
        />
      )}

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}