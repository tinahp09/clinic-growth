import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronRight, CreditCard, Shield, Loader2,
  CheckCircle, XCircle, RefreshCw, AlertCircle, Lock,
} from 'lucide-react';
import { CountdownTimer } from '../../components/clinic/CountdownTimer';
import { toPersian, formatPrice } from '../../utils/persian';

type PaymentState = 'SUMMARY' | 'PROCESSING' | 'REDIRECTED' | 'SUCCESS' | 'FAILED' | 'RETRY';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [paymentState, setPaymentState] = useState<PaymentState>('SUMMARY');
  const [retryUsed, setRetryUsed] = useState(false);
  const amount = 5_000_000;
  const reservedUntil = new Date(Date.now() + 8 * 60 * 1000).toISOString();

  const handlePayment = () => {
    setPaymentState('PROCESSING');
    setTimeout(() => {
      setPaymentState('REDIRECTED');
      setTimeout(() => {
        // Simulate random success/failure
        const success = Math.random() > 0.3;
        setPaymentState(success ? 'SUCCESS' : 'FAILED');
        if (success) {
          setTimeout(() => navigate('/client/confirmation'), 1500);
        }
      }, 2000);
    }, 1500);
  };

  const handleRetry = () => {
    if (retryUsed) return;
    setRetryUsed(true);
    setPaymentState('PROCESSING');
    setTimeout(() => {
      setPaymentState('REDIRECTED');
      setTimeout(() => {
        setPaymentState('SUCCESS');
        setTimeout(() => navigate('/client/confirmation'), 1500);
      }, 2000);
    }, 1500);
  };

  if (paymentState === 'SUCCESS') {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 animate-bounce">
          <CheckCircle size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">پرداخت موفق!</h2>
        <p className="text-slate-500 text-center text-sm">
          در حال انتقال به صفحه تایید...
        </p>
        <div className="mt-4">
          <Loader2 size={24} className="text-teal-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (paymentState === 'FAILED') {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-5">
          <XCircle size={40} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">پرداخت ناموفق</h2>
        <p className="text-slate-500 text-center text-sm mb-6">
          متأسفانه پرداخت انجام نشد. رزرو شما هنوز در وضعیت موقت است.
        </p>

        {/* Retry option */}
        {!retryUsed ? (
          <div className="w-full space-y-3">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
              <p className="text-sm text-amber-700 font-medium">یک بار فرصت تلاش مجدد دارید</p>
              <p className="text-xs text-amber-600 mt-1">پس از آن رزرو لغو خواهد شد</p>
            </div>
            <button
              onClick={handleRetry}
              className="w-full bg-teal-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
            >
              <RefreshCw size={18} />
              تلاش مجدد برای پرداخت
            </button>
            <button
              onClick={() => navigate('/client/appointments')}
              className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-medium text-sm"
            >
              انصراف از رزرو
            </button>
          </div>
        ) : (
          <div className="w-full space-y-3">
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center">
              <p className="text-sm text-red-700 font-medium">تلاش مجدد استفاده شد</p>
              <p className="text-xs text-red-600 mt-1">رزرو شما به زودی منقضی می‌شود</p>
            </div>
            <button
              onClick={() => navigate('/client')}
              className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-medium text-sm"
            >
              بازگشت به خانه
            </button>
          </div>
        )}
      </div>
    );
  }

  if (paymentState === 'PROCESSING' || paymentState === 'REDIRECTED') {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-5">
          <Loader2 size={36} className="text-teal-600 animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          {paymentState === 'PROCESSING' ? 'در حال اتصال به درگاه...' : 'انتقال به درگاه زرین‌پال'}
        </h2>
        <p className="text-slate-500 text-sm text-center">
          {paymentState === 'REDIRECTED'
            ? 'لطفاً صبر کنید. این صفحه را نبندید.'
            : 'در حال برقراری ارتباال امن...'}
        </p>
        {paymentState === 'REDIRECTED' && (
          <div className="mt-6 w-full bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={14} className="text-teal-600" />
              <span className="text-xs font-medium text-slate-600">اتصال امن SSL</span>
            </div>
            <p className="text-xs text-slate-500">
              پرداخت شما از طریق درگاه امن زرین‌پال پردازش می‌شود
            </p>
            {/* Mock ZarinPal UI */}
            <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">Z</div>
                <span className="text-xs font-semibold text-yellow-800">درگاه زرین‌پال</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button
            onClick={() => navigate('/client/summary')}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
          <div>
            <h1 className="font-semibold text-slate-800">پرداخت</h1>
            <p className="text-xs text-slate-500">مرحله نهایی رزرو</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Countdown timer */}
        <CountdownTimer expiresAt={reservedUntil} onExpire={() => navigate('/client')} />

        {/* Amount card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
          <p className="text-sm text-slate-500 mb-1">مبلغ قابل پرداخت</p>
          <p className="text-3xl font-bold text-teal-700">{formatPrice(amount)}</p>
          <p className="text-xs text-slate-400 mt-1">معادل {toPersian((amount / 10).toLocaleString())} ریال</p>
        </div>

        {/* Booking ref */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">شماره رزرو</span>
            <span className="text-sm font-bold text-slate-800 ltr">CGP-۱۴۰۴-XXXX</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-slate-500">خدمات</span>
            <span className="text-sm text-slate-700">مزوتراپی + بوتاکس</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-slate-500">تاریخ</span>
            <span className="text-sm text-slate-700">۱۵ اردیبهشت ۱۴۰۴، ساعت ۱۱:۰۰</span>
          </div>
        </div>

        {/* ZarinPal payment button */}
        <button
          onClick={handlePayment}
          className="w-full bg-gradient-to-l from-amber-500 to-amber-400 text-white py-4 rounded-2xl font-semibold text-sm shadow-lg shadow-amber-200 hover:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <div className="w-7 h-7 bg-white/30 rounded-full flex items-center justify-center font-bold">Z</div>
          پرداخت از طریق زرین‌پال
        </button>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Shield size={13} className="text-emerald-500" />
            پرداخت امن
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lock size={13} className="text-emerald-500" />
            رمزنگاری SSL
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <CreditCard size={13} className="text-emerald-500" />
            همه بانک‌ها
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
          <AlertCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            پس از پرداخت موفق، رزرو شما تایید می‌شود و کد تأییدیه به شماره موبایل‌تان ارسال می‌گردد.
          </p>
        </div>
      </div>
    </div>
  );
}
