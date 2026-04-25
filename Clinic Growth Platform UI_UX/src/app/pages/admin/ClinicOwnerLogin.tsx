import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, Loader2, Shield, User, ArrowLeft } from 'lucide-react';
import { CLINIC_INFO } from '../../data/mockData';

export default function ClinicOwnerLogin() {
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [clinicName, setClinicName] = useState('');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerRepeatPassword, setOwnerRepeatPassword] = useState('');

  const handleClinicOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (username === 'admin' && password === 'admin123') {
        navigate('/admin/dashboard');
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است');
      }
    }, 1000);
  };

  const handleClinicOwnerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clinicName.trim()) {
      setError('لطفا نام کلینیک را وارد کنید');
      return;
    }
    if (!ownerUsername.trim()) {
      setError('لطفا نام کاربری را وارد کنید');
      return;
    }
    if (ownerPassword !== ownerRepeatPassword) {
      setError('رمزهای عبور مطابقت ندارند');
      return;
    }
    if (ownerPassword.length < 4) {
      setError('رمز عبور باید حداقل ۴ کاراکتر باشد');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/admin/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        <button
          onClick={() => navigate('/client-login')}
          className="absolute top-4 left-4 p-2 text-slate-500 hover:text-slate-700 flex items-center gap-2"
        >
          <ArrowLeft size={18} className="rotate-180" />
          <span className="text-sm">ورود بیمار</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg shadow-teal-200">
            <span className="text-white text-xl font-bold">CGP</span>
          </div>
          {/* <h1 className="text-xl font-bold text-slate-800">{CLINIC_INFO.name}</h1> */}
          <p className="text-sm text-slate-500 mt-1">
            {isRegisterMode ? 'ثبت نام مدیر کلینیک' : 'ورود مدیر کلینیک'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-7">
          {!isRegisterMode ? (
            <>
              <h2 className="font-bold text-slate-800 mb-1 text-right">ورود مدیر کلینیک</h2>
              <p className="text-sm text-slate-500 mb-4 text-right">با نام کاربری و رمز عبور وارد شوید</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleClinicOwnerLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">نام کاربری</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="نام کاربری"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-left"
                      dir="ltr"
                    />
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">رمز عبور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                    <Lock size={16} className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    loading || !username || !password
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      در حال ورود...
                    </span>
                  ) : 'ورود به پنل مدیریت'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-bold text-slate-800 mb-1 text-right">ثبت نام مدیر کلینیک</h2>
              <p className="text-sm text-slate-500 mb-4 text-right">مشخصات کلینیک را وارد کنید</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleClinicOwnerRegister} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">نام کلینیک</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={clinicName}
                      onChange={e => setClinicName(e.target.value)}
                      placeholder="نام کلینیک"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">نام کاربری</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={ownerUsername}
                      onChange={e => setOwnerUsername(e.target.value)}
                      placeholder="نام کاربری"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-left"
                      dir="ltr"
                    />
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">رمز عبور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={ownerPassword}
                      onChange={e => setOwnerPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                    <Lock size={16} className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5 text-right">تکرار رمز عبور</label>
                  <div className="relative">
                    <input
                      type={showRepeatPassword ? 'text' : 'password'}
                      value={ownerRepeatPassword}
                      onChange={e => setOwnerRepeatPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                    <Lock size={16} className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRepeatPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !clinicName || !ownerUsername || !ownerPassword || !ownerRepeatPassword}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    loading || !clinicName || !ownerUsername || !ownerPassword || !ownerRepeatPassword
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      در حال ثبت نام...
                    </span>
                  ) : 'ثبت نام کلینیک'}
                </button>
              </form>
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
          <p className="text-xs text-amber-700 font-medium mb-1">اطلاعات دموی ورود</p>
          <p className="text-xs text-amber-600">نام کاربری: admin / رمز: admin123</p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-slate-400">
          <Shield size={12} className="text-emerald-500" />
          ارتباط امن رمزنگاری شده
        </div>
      </div>
    </div>
  );
}