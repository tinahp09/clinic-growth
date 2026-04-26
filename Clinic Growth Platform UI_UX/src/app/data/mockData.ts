// Mock data for Clinic Growth Platform

export type BookingStatus = 'CREATED' | 'RESERVED' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'FAILED_PAYMENT' | 'EXPIRED';
export type PaymentStatus = 'INITIATED' | 'REDIRECTED' | 'PENDING_CALLBACK' | 'VERIFIED' | 'FAILED' | 'ABANDONED' | 'REFUNDED';
export type RefundStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type StaffRole = 'DOCTOR' | 'NURSE' | 'TECHNICIAN' | 'RECEPTIONIST';
export type RoomType = 'CONSULTATION' | 'TREATMENT' | 'LASER' | 'RECOVERY';

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number; // Tomans
  category: string;
  image?: string;
  incompatibleWith?: string[];
  requiresRoom?: RoomType;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  specialty: string;
  avatar?: string;
  availableDays: number[]; // 0=Saturday, 6=Friday (Jalali)
  workStart: string; // HH:MM
  workEnd: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export interface Booking {
  id: string;
  bookingNumber: string;
  patientName: string;
  patientPhone: string;
  services: Service[];
  staffId: string;
  staffName: string;
  roomId: string;
  roomName: string;
  dateTime: string; // ISO UTC
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  totalAmount: number;
  paymentRef?: string;
  notes?: string;
  createdAt: string;
  reservedUntil?: string;
  cancelReason?: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  bookingNumber: string;
  patientName: string;
  amount: number;
  status: PaymentStatus;
  zarinpalRef?: string;
  authority?: string;
  createdAt: string;
  verifiedAt?: string;
  gatewayResponse?: string;
}

export interface Refund {
  id: string;
  bookingId: string;
  bookingNumber: string;
  patientName: string;
  amount: number;
  status: RefundStatus;
  reason: string;
  requestedAt: string;
  processedAt?: string;
  refundRef?: string;
}

// === SERVICES ===
export const SERVICES: Service[] = [
  {
    id: 'svc-001',
    name: 'مزوتراپی پوست',
    description: 'تزریق ویتامین و مواد مغذی به لایه‌های میانی پوست برای جوانسازی',
    duration: 60,
    price: 1_800_000,
    category: 'جوانسازی',
    image: 'https://images.unsplash.com/photo-1761718210055-e83ca7e2c9ad?w=400',
  },
  {
    id: 'svc-002',
    name: 'لیزر موهای زائد',
    description: 'حذف دائمی موهای زائد با دستگاه لیزر پیشرفته',
    duration: 90,
    price: 2_500_000,
    category: 'لیزر',
    image: 'https://images.unsplash.com/photo-1700760933574-9f0f4ea9aa3b?w=400',
    requiresRoom: 'LASER',
    incompatibleWith: ['svc-004'],
  },
  {
    id: 'svc-003',
    name: 'تزریق بوتاکس',
    description: 'رفع خطوط چروک و خطوط بیان صورت با بوتاکس اصل',
    duration: 45,
    price: 3_200_000,
    category: 'تزریقی',
    image: 'https://images.unsplash.com/photo-1551601651-09492b5468b6?w=400',
  },
  {
    id: 'svc-004',
    name: 'هایفو (HIFU)',
    description: 'لیفتینگ غیرجراحی پوست با امواج فراصوت متمرکز',
    duration: 120,
    price: 4_500_000,
    category: 'لیفتینگ',
    requiresRoom: 'LASER',
    incompatibleWith: ['svc-002'],
  },
  {
    id: 'svc-005',
    name: 'پاکسازی عمیق پوست',
    description: 'پاکسازی منافذ، جوش‌های سرسفید و سرسیاه',
    duration: 75,
    price: 950_000,
    category: 'مراقبت پوست',
  },
  {
    id: 'svc-006',
    name: 'تزریق ژل لب',
    description: 'حجم‌دهی و فرم‌دهی لب با فیلر هیالورونیک اسید',
    duration: 45,
    price: 2_800_000,
    category: 'تزریقی',
  },
  {
    id: 'svc-007',
    name: 'میکرونیدلینگ',
    description: 'درمان اسکار، منافذ بزرگ و رنگ‌پریدگی پوست',
    duration: 90,
    price: 1_600_000,
    category: 'جوانسازی',
  },
  {
    id: 'svc-008',
    name: 'پیلینگ شیمیایی',
    description: 'لایه‌برداری شیمیایی برای یکنواختی رنگ پوست',
    duration: 60,
    price: 1_200_000,
    category: 'مراقبت پوست',
  },
];

// === STAFF ===
export const STAFF: Staff[] = [
  {
    id: 'stf-001',
    name: 'دکتر نیلوفر رضایی',
    role: 'DOCTOR',
    specialty: 'متخصص پوست و مو',
    avatar: 'https://images.unsplash.com/photo-1673865641073-4479f93a7776?w=150',
    availableDays: [0, 1, 2, 3, 4], // Sat-Wed
    workStart: '09:00',
    workEnd: '17:00',
  },
  {
    id: 'stf-002',
    name: 'دکتر علیرضا محمدی',
    role: 'DOCTOR',
    specialty: 'جراح پلاستیک و زیبایی',
    avatar: 'https://images.unsplash.com/photo-1666887359800-60e37f543dbd?w=150',
    availableDays: [0, 1, 3, 4, 5], // Sat, Sun, Tue, Wed, Thu
    workStart: '10:00',
    workEnd: '18:00',
  },
  {
    id: 'stf-003',
    name: 'سارا کریمی',
    role: 'TECHNICIAN',
    specialty: 'کارشناس لیزر',
    availableDays: [0, 1, 2, 3, 4, 5],
    workStart: '08:00',
    workEnd: '16:00',
  },
  {
    id: 'stf-004',
    name: 'مریم احمدی',
    role: 'NURSE',
    specialty: 'پرستار زیبایی',
    availableDays: [0, 1, 2, 3, 4],
    workStart: '08:30',
    workEnd: '16:30',
  },
];

// === ROOMS ===
export const ROOMS: Room[] = [
  { id: 'rm-001', name: 'اتاق مشاوره ۱', type: 'CONSULTATION', capacity: 2, status: 'AVAILABLE' },
  { id: 'rm-002', name: 'اتاق درمان ۱', type: 'TREATMENT', capacity: 3, status: 'AVAILABLE' },
  { id: 'rm-003', name: 'اتاق درمان ۲', type: 'TREATMENT', capacity: 3, status: 'OCCUPIED' },
  { id: 'rm-004', name: 'اتاق لیزر', type: 'LASER', capacity: 2, status: 'AVAILABLE' },
  { id: 'rm-005', name: 'اتاق ریکاوری', type: 'RECOVERY', capacity: 4, status: 'MAINTENANCE' },
];

// === BOOKINGS ===
export const BOOKINGS: Booking[] = [
  {
    id: 'bk-001',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۱',
    patientName: 'فاطمه حسینی',
    patientPhone: '۰۹۱۲۳۴۵۶۷۸۹',
    services: [SERVICES[0], SERVICES[2]],
    staffId: 'stf-001',
    staffName: 'دکتر نیلوفر رضایی',
    roomId: 'rm-002',
    roomName: 'اتاق درمان ۱',
    dateTime: '2025-05-10T10:00:00Z',
    status: 'CONFIRMED',
    paymentStatus: 'VERIFIED',
    totalAmount: 5_000_000,
    paymentRef: 'ZP-98765432',
    createdAt: '2025-05-08T14:22:00Z',
  },
  {
    id: 'bk-002',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۲',
    patientName: 'زهره محمدی',
    patientPhone: '۰۹۱۷۶۵۴۳۲۱۰',
    services: [SERVICES[1]],
    staffId: 'stf-003',
    staffName: 'سارا کریمی',
    roomId: 'rm-004',
    roomName: 'اتاق لیزر',
    dateTime: '2025-05-10T14:00:00Z',
    status: 'RESERVED',
    totalAmount: 2_500_000,
    createdAt: '2025-05-10T13:45:00Z',
    reservedUntil: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'bk-003',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۳',
    patientName: 'مهدی اکبری',
    patientPhone: '۰۹۱۵۵۶۶۷۷۸۸',
    services: [SERVICES[3]],
    staffId: 'stf-001',
    staffName: 'دکتر نیلوفر رضایی',
    roomId: 'rm-004',
    roomName: 'اتاق لیزر',
    dateTime: '2025-05-11T11:00:00Z',
    status: 'PENDING_PAYMENT',
    paymentStatus: 'INITIATED',
    totalAmount: 4_500_000,
    createdAt: '2025-05-10T09:15:00Z',
  },
  {
    id: 'bk-004',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۴',
    patientName: 'نرگس کریمی',
    patientPhone: '۰۹۱۱۲۲۳۳۴۴۵',
    services: [SERVICES[4], SERVICES[6]],
    staffId: 'stf-004',
    staffName: 'مریم احمدی',
    roomId: 'rm-002',
    roomName: 'اتاق درمان ۱',
    dateTime: '2025-05-09T09:00:00Z',
    status: 'CANCELLED',
    totalAmount: 2_550_000,
    cancelReason: 'درخواست زیباجو',
    createdAt: '2025-05-07T16:40:00Z',
  },
  {
    id: 'bk-005',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۵',
    patientName: 'شیرین تهرانی',
    patientPhone: '۰۹۱۲۹۸۷۶۵۴۳',
    services: [SERVICES[2], SERVICES[5]],
    staffId: 'stf-002',
    staffName: 'دکتر علیرضا محمدی',
    roomId: 'rm-002',
    roomName: 'اتاق درمان ۱',
    dateTime: '2025-05-12T15:00:00Z',
    status: 'CONFIRMED',
    paymentStatus: 'VERIFIED',
    totalAmount: 6_000_000,
    paymentRef: 'ZP-11223344',
    createdAt: '2025-05-09T10:00:00Z',
  },
  {
    id: 'bk-006',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۶',
    patientName: 'رضا قاسمی',
    patientPhone: '۰۹۱۳۴۴۵۵۶۶۷',
    services: [SERVICES[7]],
    staffId: 'stf-001',
    staffName: 'دکتر نیلوفر رضایی',
    roomId: 'rm-002',
    roomName: 'اتاق درمان ۱',
    dateTime: '2025-05-08T11:00:00Z',
    status: 'CONFIRMED',
    paymentStatus: 'VERIFIED',
    totalAmount: 1_200_000,
    paymentRef: 'ZP-55667788',
    createdAt: '2025-05-06T12:00:00Z',
  },
];

// === TRANSACTIONS ===
export const TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001',
    bookingId: 'bk-001',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۱',
    patientName: 'فاطمه حسینی',
    amount: 5_000_000,
    status: 'VERIFIED',
    zarinpalRef: 'ZP-98765432',
    authority: 'A00000000000000000000000000000001',
    createdAt: '2025-05-08T14:25:00Z',
    verifiedAt: '2025-05-08T14:28:00Z',
    gatewayResponse: '{"code":100,"message":"OK"}',
  },
  {
    id: 'txn-002',
    bookingId: 'bk-003',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۳',
    patientName: 'مهدی اکبری',
    amount: 4_500_000,
    status: 'REDIRECTED',
    authority: 'A00000000000000000000000000000002',
    createdAt: '2025-05-10T09:18:00Z',
    gatewayResponse: '{"code":100,"message":"OK"}',
  },
  {
    id: 'txn-003',
    bookingId: 'bk-004',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۴',
    patientName: 'نرگس کریمی',
    amount: 2_550_000,
    status: 'REFUNDED',
    zarinpalRef: 'ZP-44332211',
    createdAt: '2025-05-07T16:45:00Z',
    verifiedAt: '2025-05-07T16:48:00Z',
    gatewayResponse: '{"code":100,"message":"OK"}',
  },
  {
    id: 'txn-004',
    bookingId: 'bk-005',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۵',
    patientName: 'شیرین تهرانی',
    amount: 6_000_000,
    status: 'VERIFIED',
    zarinpalRef: 'ZP-11223344',
    authority: 'A00000000000000000000000000000004',
    createdAt: '2025-05-09T10:05:00Z',
    verifiedAt: '2025-05-09T10:07:00Z',
    gatewayResponse: '{"code":100,"message":"OK"}',
  },
  {
    id: 'txn-005',
    bookingId: 'bk-006',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۶',
    patientName: 'رضا قاسمی',
    amount: 1_200_000,
    status: 'VERIFIED',
    zarinpalRef: 'ZP-55667788',
    authority: 'A00000000000000000000000000000005',
    createdAt: '2025-05-06T12:05:00Z',
    verifiedAt: '2025-05-06T12:08:00Z',
    gatewayResponse: '{"code":100,"message":"OK"}',
  },
];

// === REFUNDS ===
export const REFUNDS: Refund[] = [
  {
    id: 'ref-001',
    bookingId: 'bk-004',
    bookingNumber: 'CGP-۱۴۰۴-۰۰۰۴',
    patientName: 'نرگس کریمی',
    amount: 2_550_000,
    status: 'COMPLETED',
    reason: 'لغو توسط زیباجو - بیش از ۲۴ ساعت قبل',
    requestedAt: '2025-05-09T08:00:00Z',
    processedAt: '2025-05-09T10:30:00Z',
    refundRef: 'REF-001122',
  },
];

// === KPI DATA ===
export const KPI_DATA = {
  bookingSuccessRate: 87.3,
  paymentFailureRate: 5.2,
  noShowRate: 4.1,
  cancellationRate: 8.7,
  refundRate: 3.4,
  totalRevenue: 48_700_000,
  totalBookingsMonth: 142,
  avgBookingValue: 2_850_000,
  pendingPayments: 3,
  todayBookings: 8,
};

// === CHART DATA ===
export const WEEKLY_BOOKINGS = [
  { day: 'ش', confirmed: 12, cancelled: 2, failed: 1 },
  { day: 'ی', confirmed: 18, cancelled: 3, failed: 0 },
  { day: 'د', confirmed: 15, cancelled: 1, failed: 2 },
  { day: 'س', confirmed: 22, cancelled: 4, failed: 1 },
  { day: 'چ', confirmed: 19, cancelled: 2, failed: 0 },
  { day: 'پ', confirmed: 25, cancelled: 5, failed: 2 },
  { day: 'ج', confirmed: 8, cancelled: 1, failed: 0 },
];

export const REVENUE_CHART = [
  { month: 'فروردین', revenue: 38_500_000 },
  { month: 'اردیبهشت', revenue: 45_200_000 },
  { month: 'خرداد', revenue: 42_800_000 },
  { month: 'تیر', revenue: 51_300_000 },
  { month: 'مرداد', revenue: 48_700_000 },
];

export const SERVICE_DISTRIBUTION = [
  { name: 'بوتاکس', value: 28 },
  { name: 'لیزر', value: 22 },
  { name: 'مزوتراپی', value: 18 },
  { name: 'هایفو', value: 15 },
  { name: 'سایر', value: 17 },
];

// === MEDIA VAULT (v2) ===
export interface MediaItem {
  id: string;
  bookingId: string;
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
  type: 'BEFORE' | 'AFTER' | 'PROGRESS';
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedByStaffId: string;
  consentGiven: boolean;
  isPublic: boolean;
  publicConsentGiven: boolean;
  publicConsentAt?: string;
  isAnonymized: boolean;
  notes?: string;
  visibleToClient: boolean;
}

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'med-001',
    bookingId: 'bk-001',
    patientId: 'pat-001',
    patientName: 'فاطمه حسینی',
    serviceId: 'svc-001',
    serviceName: 'مزوتراپی پوست',
    type: 'BEFORE',
    url: 'https://images.unsplash.com/photo-1707544738444-acd9233e646e?w=400',
    uploadedAt: '2025-05-10T10:05:00Z',
    uploadedByStaffId: 'stf-001',
    consentGiven: true,
    isPublic: true,
    publicConsentGiven: true,
    publicConsentAt: '2025-05-10T12:00:00Z',
    isAnonymized: true,
    visibleToClient: true,
  },
  {
    id: 'med-002',
    bookingId: 'bk-001',
    patientId: 'pat-001',
    patientName: 'فاطمه حسینی',
    serviceId: 'svc-001',
    serviceName: 'مزوتراپی پوست',
    type: 'AFTER',
    url: 'https://images.unsplash.com/photo-1761718210055-e83ca7e2c9ad?w=400',
    uploadedAt: '2025-05-10T11:15:00Z',
    uploadedByStaffId: 'stf-001',
    consentGiven: true,
    isPublic: true,
    publicConsentGiven: true,
    publicConsentAt: '2025-05-10T12:00:00Z',
    isAnonymized: true,
    visibleToClient: true,
  },
  {
    id: 'med-003',
    bookingId: 'bk-006',
    patientId: 'pat-002',
    patientName: 'رضا قاسمی',
    serviceId: 'svc-008',
    serviceName: 'پیلینگ شیمیایی',
    type: 'BEFORE',
    url: 'https://images.unsplash.com/photo-1551601651-09492b5468b6?w=400',
    uploadedAt: '2025-05-08T11:05:00Z',
    uploadedByStaffId: 'stf-001',
    consentGiven: true,
    isPublic: false,
    publicConsentGiven: false,
    isAnonymized: false,
    visibleToClient: true,
  },
  {
    id: 'med-004',
    bookingId: 'bk-006',
    patientId: 'pat-002',
    patientName: 'رضا قاسمی',
    serviceId: 'svc-008',
    serviceName: 'پیلینگ شیمیایی',
    type: 'AFTER',
    url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b6?w=400',
    uploadedAt: '2025-05-08T12:30:00Z',
    uploadedByStaffId: 'stf-001',
    consentGiven: true,
    isPublic: false,
    publicConsentGiven: false,
    isAnonymized: false,
    visibleToClient: true,
  },
  {
    id: 'med-005',
    bookingId: 'bk-005',
    patientId: 'pat-003',
    patientName: 'شیرین تهرانی',
    serviceId: 'svc-003',
    serviceName: 'تزریق بوتاکس',
    type: 'BEFORE',
    url: 'https://images.unsplash.com/photo-1512290923901-3a592a77b1c2?w=400',
    uploadedAt: '2025-05-12T15:10:00Z',
    uploadedByStaffId: 'stf-002',
    consentGiven: true,
    isPublic: true,
    publicConsentGiven: true,
    publicConsentAt: '2025-05-12T16:00:00Z',
    isAnonymized: true,
    visibleToClient: true,
  },
  {
    id: 'med-006',
    bookingId: 'bk-005',
    patientId: 'pat-003',
    patientName: 'شیرین تهرانی',
    serviceId: 'svc-003',
    serviceName: 'تزریق بوتاکس',
    type: 'AFTER',
    url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    uploadedAt: '2025-05-12T16:15:00Z',
    uploadedByStaffId: 'stf-002',
    consentGiven: true,
    isPublic: true,
    publicConsentGiven: true,
    publicConsentAt: '2025-05-12T16:00:00Z',
    isAnonymized: true,
    visibleToClient: true,
  },
];

// Booking status labels
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  CREATED: 'ایجاد شده',
  RESERVED: 'رزرو موقت',
  PENDING_PAYMENT: 'در انتظار پرداخت',
  CONFIRMED: 'تایید شده',
  CANCELLED: 'لغو شده',
  FAILED_PAYMENT: 'پرداخت ناموفق',
  EXPIRED: 'منقضی شده',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  INITIATED: 'شروع شده',
  REDIRECTED: 'انتقال ��ه درگاه',
  PENDING_CALLBACK: 'در انتظار تایید',
  VERIFIED: 'تایید شده',
  FAILED: 'ناموفق',
  ABANDONED: 'رها شده',
  REFUNDED: 'برگشت داده شده',
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  CONSULTATION: 'مشاوره',
  TREATMENT: 'درمان',
  LASER: 'لیزر',
  RECOVERY: 'ریکاوری',
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  DOCTOR: 'پزشک',
  NURSE: 'پرستار',
  TECHNICIAN: 'تکنسین',
  RECEPTIONIST: 'پذیرش',
};

// Clinic info
export const CLINIC_INFO = {
  name: 'کلینیک زیبایی آرام',
  tagline: 'زیبایی شما، تخصص ماست',
  address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲۳',
  phone: '۰۲۱-۸۸۷۷۶۶۵۵',
  rating: 4.8,
  reviewCount: 312,
  openDays: 'شنبه تا پنجشنبه',
  openHours: '۰۸:۰۰ - ۲۰:۰۰',
};
