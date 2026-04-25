import React from 'react';
import { Check, Clock, CreditCard, X, AlertCircle, RefreshCw, Hourglass } from 'lucide-react';
import type { BookingStatus, PaymentStatus } from '../../data/mockData';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../data/mockData';
import { toPersian } from '../../utils/persian';

interface TimelineStep {
  status: string;
  label: string;
  date?: string;
  isActive: boolean;
  isCompleted: boolean;
  isFailed?: boolean;
  icon: React.ReactNode;
}

interface BookingTimelineProps {
  bookingStatus: BookingStatus;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
  reservedUntil?: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

function getIcon(status: string, size = 14) {
  switch (status) {
    case 'CREATED': return <Clock size={size} />;
    case 'RESERVED': return <Hourglass size={size} />;
    case 'PENDING_PAYMENT': return <CreditCard size={size} />;
    case 'CONFIRMED': return <Check size={size} />;
    case 'CANCELLED': return <X size={size} />;
    case 'FAILED_PAYMENT': return <AlertCircle size={size} />;
    case 'EXPIRED': return <Clock size={size} />;
    case 'VERIFIED': return <Check size={size} />;
    case 'REFUNDED': return <RefreshCw size={size} />;
    default: return <Clock size={size} />;
  }
}

const BOOKING_FLOW: BookingStatus[] = [
  'CREATED', 'RESERVED', 'PENDING_PAYMENT', 'CONFIRMED'
];

const STATUS_ORDER: Record<BookingStatus, number> = {
  CREATED: 0,
  RESERVED: 1,
  PENDING_PAYMENT: 2,
  CONFIRMED: 3,
  CANCELLED: -1,
  FAILED_PAYMENT: -1,
  EXPIRED: -1,
};

export function BookingTimeline({ bookingStatus, createdAt }: BookingTimelineProps) {
  const currentOrder = STATUS_ORDER[bookingStatus];
  const isTerminal = currentOrder === -1;

  const steps = BOOKING_FLOW.map((status, i) => {
    const order = STATUS_ORDER[status];
    const isCompleted = !isTerminal && currentOrder > order;
    const isActive = !isTerminal && currentOrder === order;

    return {
      status,
      label: BOOKING_STATUS_LABELS[status],
      isActive,
      isCompleted,
      isFailed: false,
      icon: getIcon(status),
    };
  });

  if (isTerminal) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
          {getIcon(bookingStatus)}
        </div>
        <div>
          <p className="text-sm font-medium text-red-700">{BOOKING_STATUS_LABELS[bookingStatus]}</p>
          {createdAt && (
            <p className="text-xs text-red-500">
              {new Date(createdAt).toLocaleString('fa-IR')}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <React.Fragment key={step.status}>
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs
                ${step.isCompleted
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                  : step.isActive
                  ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500 ring-offset-1'
                  : 'bg-slate-100 text-slate-400'
                }
              `}>
                {step.isCompleted ? <Check size={14} /> : step.icon}
              </div>
              <span className={`text-xs text-center leading-tight max-w-[60px] ${
                step.isActive ? 'text-teal-700 font-medium' :
                step.isCompleted ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-shrink-0 w-8 -mt-5 transition-colors ${
                steps[i + 1].isCompleted || steps[i + 1].isActive
                  ? 'bg-teal-400'
                  : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Compact list version for booking details page
export function BookingEventLog({ events }: {
  events: Array<{ label: string; date: string; type: 'success' | 'warning' | 'error' | 'info' }>
}) {
  return (
    <div className="space-y-3">
      {events.map((event, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
              event.type === 'success' ? 'bg-emerald-500' :
              event.type === 'warning' ? 'bg-amber-500' :
              event.type === 'error' ? 'bg-red-500' :
              'bg-blue-400'
            }`} />
            {i < events.length - 1 && (
              <div className="w-px flex-1 bg-slate-200 mt-1" style={{ minHeight: '20px' }} />
            )}
          </div>
          <div className="pb-3">
            <p className="text-sm text-slate-800">{event.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{event.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
