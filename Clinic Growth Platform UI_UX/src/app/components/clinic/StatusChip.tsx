import React from 'react';
import { type BookingStatus, type PaymentStatus, BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../data/mockData';

interface StatusChipProps {
  status: BookingStatus | PaymentStatus | string;
  type?: 'booking' | 'payment' | 'refund' | 'room';
  size?: 'sm' | 'md';
}

const BOOKING_COLORS: Record<BookingStatus, string> = {
  CREATED: 'bg-slate-100 text-slate-700 border-slate-200',
  RESERVED: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_PAYMENT: 'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  FAILED_PAYMENT: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  INITIATED: 'bg-slate-100 text-slate-700 border-slate-200',
  REDIRECTED: 'bg-blue-50 text-blue-700 border-blue-200',
  PENDING_CALLBACK: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  ABANDONED: 'bg-gray-100 text-gray-500 border-gray-200',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
};

const REFUND_COLORS: Record<string, string> = {
  REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
};

const REFUND_LABELS: Record<string, string> = {
  REQUESTED: 'درخواست داده شده',
  PROCESSING: 'در حال پردازش',
  COMPLETED: 'تکمیل شده',
  FAILED: 'ناموفق',
};

const ROOM_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OCCUPIED: 'bg-amber-50 text-amber-700 border-amber-200',
  MAINTENANCE: 'bg-red-50 text-red-700 border-red-200',
};

const ROOM_LABELS: Record<string, string> = {
  AVAILABLE: 'آزاد',
  OCCUPIED: 'اشغال',
  MAINTENANCE: 'تعمیر',
};

// Dot indicator for each status
const BOOKING_DOT: Record<BookingStatus, string> = {
  CREATED: 'bg-slate-400',
  RESERVED: 'bg-amber-400',
  PENDING_PAYMENT: 'bg-blue-400',
  CONFIRMED: 'bg-emerald-500',
  CANCELLED: 'bg-red-500',
  FAILED_PAYMENT: 'bg-red-500',
  EXPIRED: 'bg-gray-400',
};

export function StatusChip({ status, type = 'booking', size = 'md' }: StatusChipProps) {
  let colorClass = '';
  let label = '';
  let dotClass = '';

  if (type === 'booking') {
    colorClass = BOOKING_COLORS[status as BookingStatus] || 'bg-slate-100 text-slate-700 border-slate-200';
    label = BOOKING_STATUS_LABELS[status as BookingStatus] || status;
    dotClass = BOOKING_DOT[status as BookingStatus] || 'bg-slate-400';
  } else if (type === 'payment') {
    colorClass = PAYMENT_COLORS[status as PaymentStatus] || 'bg-slate-100 text-slate-700 border-slate-200';
    label = PAYMENT_STATUS_LABELS[status as PaymentStatus] || status;
    dotClass = 'bg-current';
  } else if (type === 'refund') {
    colorClass = REFUND_COLORS[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    label = REFUND_LABELS[status] || status;
    dotClass = 'bg-current';
  } else if (type === 'room') {
    colorClass = ROOM_COLORS[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    label = ROOM_LABELS[status] || status;
    dotClass = 'bg-current';
  }

  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${colorClass} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} flex-shrink-0`} />
      {label}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <StatusChip status={status} type="booking" />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <StatusChip status={status} type="payment" />;
}
