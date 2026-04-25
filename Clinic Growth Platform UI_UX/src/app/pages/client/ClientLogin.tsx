import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Smartphone, KeyRound, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../../components/ui/input-otp';
import { CLINIC_INFO } from '../../data/mockData';

export default function ClientLogin() {
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = () => {
    if (!clientPhone || clientPhone.length < 10) return;
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 1000);
  };

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (otpCode === '123456') {
        navigate('/client');
      } else {
        setError('کد OTP اشتباه است');
      }
    }, 1000);
  };

  const handleClientRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clientName.trim()) {
      setError('لطفا نام کامل را وارد کنید');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (otpCode === '123456') {
        navigate('/client');
      } else {
        setError('کد OTP اشتباه است');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        {/* <button
          onClick={() => navigate('/clinic-login')}
          className="absolute top-4 left-4 p-2 text-slate-500 hover:text-slate-700 flex items-center gap-2"
        >
          <ArrowLeft size={18} className="rotate-180" />
          <span className="text-sm">ورود مدیر کلینیک</span>
        </button> */}

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg shadow-teal-200">
            <span className="text-white text-xl font-bold">CGP</span>
          </div>
          {/* <h1 className="text-xl font-bold text-slate-800">{CLINIC_INFO.name}</h1> */}
          <p className="text-sm text-slate-500 mt-1">
            {isRegisterMode ? 'ثبت نام بیمار' : 'ورود بیمار'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-7">
          {!isRegisterMode ? (
            <>
              <h2 className="font-bold text-slate-800 mb-1 text-right">ورود بیمار</h2>
              <p className="text-sm text-slate-500 mb-4 text-right">با شماره موبایل و کد تایید وارد شوید</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">!</span>
                  {error}
                </div>
              )}

              {!otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">شماره موبایل</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ltr text-right"
                        dir="rtl"
                      />
                      <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || !clientPhone}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      loading || !clientPhone
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        در حال ارسال...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <KeyRound size={16} />
                        دریافت کد تایید
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleClientLogin} className="space-y-4">
                  <div className="bg-teal-50 rounded-xl p-3 mb-4">
                    <p className="text-sm text-teal-700">کد تایید به شماره {clientPhone} ارسال شد</p>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-sm text-teal-600 underline mt-1"
                    >
                      تغییر شماره
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">کد تایید</label>
                    <div className="justify-center flex" dir="ltr">
                      <InputOTP value={otpCode} onChange={setOtpCode} maxLength={6} className="gap-2">
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-12 rounded-xl border-slate-200" />
                          <InputOTPSlot index={1} className="w-12 h-12 rounded-xl border-slate-200" />
                          <InputOTPSeparator />
                          <InputOTPSlot index={2} className="w-12 h-12 rounded-xl border-slate-200" />
                          <InputOTPSlot index={3} className="w-12 h-12 rounded-xl border-slate-200" />
                          <InputOTPSeparator />
                          <InputOTPSlot index={4} className="w-12 h-12 rounded-xl border-slate-200" />
                          <InputOTPSlot index={5} className="w-12 h-12 rounded-xl border-slate-200" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      loading || otpCode.length < 6
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        در حال ورود...
                      </span>
                    ) : 'ورود به حساب'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <h2 className="font-bold text-slate-800 mb-1 text-right">ثبت نام بیمار</h2>
              <p className="text-sm text-slate-500 mb-4 text-right">مشخصات خود را وارد کنید</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">!</span>
                  {error}
                </div>
              )}

              {!otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">نام کامل</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        placeholder="نام و نام خانوادگی"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-right"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">شماره موبایل</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ltr text-right"
                        dir="rtl"
                      />
                      <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || !clientPhone || !clientName}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      loading || !clientPhone || !clientName
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        در حال ارسال...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <KeyRound size={16} />
                        دریافت کد تایید
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleClientRegister} className="space-y-4">
                  <div className="bg-teal-50 rounded-xl p-3 mb-4">
                    <p className="text-sm text-teal-700">کد تایید به شماره {clientPhone} ارسال شد</p>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-sm text-teal-600 underline mt-1"
                    >
                      تغییر شماره
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">کد تایید</label>
                    <div className="justify-center flex" dir="ltr">
                      <InputOTP value={otpCode} onChange={setOtpCode} maxLength={6} className="gap-2">
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-12 rounded-xl border-slate-200" />
                          <InputOTPSlot index={1} className="w-12 h-12 rounded-xl border-slate-200" />
                          <InputOTPSeparator />
                          <InputOTPSlot index={2} className="w-12 h-12 rounded-xl border-slate-200" />
                          <InputOTPSlot index={3} className="w-12 h-12 rounded-xl border-slate-200" />
                          <InputOTPSeparator />
                          <InputOTPSlot index={4} className="w-12 h-12 rounded-xl border-slate-200" />
                          <InputOTPSlot index={5} className="w-12 h-12 rounded-xl border-slate-200" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      loading || otpCode.length < 6
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        در حال ثبت نام...
                      </span>
                    ) : 'ثبت نام'}
                  </button>
                </form>
              )}
            </>
          )}

          <div className="mt-4 text-center">
            <button 
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-sm text-teal-600 hover:underline"
            >
              {isRegisterMode ? 'حساب کاربری دارید؟ ورود' : 'حساب کاربری ندارید؟ ثبت نام'}
            </button>
          </div>
        </div>

        <div className="mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
          <p className="text-xs text-amber-700 font-medium mb-1">اطلاعات دموی ور��د</p>
          <p className="text-xs text-amber-600">کد OTP: 123456</p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-slate-400">
          <Shield size={12} className="text-emerald-500" />
          ارتباط امن رمزنگاری شده
        </div>
      </div>
    </div>
  );
}