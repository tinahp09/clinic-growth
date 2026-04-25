import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { toPersian, formatCountdown } from '../../utils/persian';

interface CountdownTimerProps {
  expiresAt: string; // ISO string
  onExpire?: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const expires = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setSecondsLeft(diff);
      if (diff === 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isUrgent = secondsLeft <= 120; // last 2 minutes
  const progress = Math.max(0, (secondsLeft / 900) * 100); // 15 min = 900s

  return (
    <div className={`rounded-xl p-4 border transition-all ${
      isUrgent
        ? 'bg-red-50 border-red-200'
        : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        {isUrgent ? (
          <AlertTriangle size={16} className="text-red-500 animate-pulse" />
        ) : (
          <Clock size={16} className="text-amber-600" />
        )}
        <span className={`text-sm font-medium ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
          {isUrgent ? 'زمان در حال اتمام است!' : 'رزرو موقت شما'}
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
          تا پایان رزرو
        </span>
        <span className={`text-2xl font-bold ltr ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
          {formatCountdown(secondsLeft)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent ? 'bg-red-500' : 'bg-amber-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className={`text-xs mt-2 ${isUrgent ? 'text-red-500' : 'text-amber-600'}`}>
        برای تایید نهایی، پرداخت را در این مدت کامل کنید
      </p>
    </div>
  );
}
