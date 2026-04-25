import jalaali from 'jalaali-js';

// Persian digit conversion
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersian(n: number | string): string {
  return String(n).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export function toWestern(n: string): string {
  return n.replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)));
}

export function formatPrice(amount: number): string {
  return toPersian(amount.toLocaleString('fa-IR')) + ' تومان';
}

export function formatPricePlain(amount: number): string {
  return toPersian(amount.toLocaleString()) + ' تومان';
}

// Jalali month names
export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند',
];

// Jalali weekday names (Saturday first - Iran standard)
export const JALALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
export const JALALI_WEEKDAYS_FULL = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه',
  'چهارشنبه', 'پنجشنبه', 'جمعه',
];

// Convert Gregorian to Jalali
export function toJalali(date: Date): { jy: number; jm: number; jd: number } {
  const { jy, jm, jd } = jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return { jy, jm, jd };
}

// Convert Jalali to Gregorian
export function fromJalali(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

// Format Jalali date as string
export function formatJalali(date: Date, format: 'full' | 'short' | 'date' | 'time' = 'full'): string {
  const { jy, jm, jd } = toJalali(date);
  const weekDay = JALALI_WEEKDAYS_FULL[getJalaliWeekDay(date)];
  const month = JALALI_MONTHS[jm - 1];

  switch (format) {
    case 'full':
      return `${weekDay}، ${toPersian(jd)} ${month} ${toPersian(jy)}`;
    case 'short':
      return `${toPersian(jd)} ${month}`;
    case 'date':
      return `${toPersian(jd)}/${toPersian(jm)}/${toPersian(jy)}`;
    case 'time':
      const h = toPersian(String(date.getHours()).padStart(2, '0'));
      const min = toPersian(String(date.getMinutes()).padStart(2, '0'));
      return `${h}:${min}`;
    default:
      return `${toPersian(jd)} ${month} ${toPersian(jy)}`;
  }
}

// Get Jalali weekday (0=Saturday, 6=Friday)
export function getJalaliWeekDay(date: Date): number {
  const jsDay = date.getDay(); // 0=Sunday, 6=Saturday
  // Convert: Saturday=0, Sunday=1, ..., Friday=6
  return (jsDay + 1) % 7;
}

// Get days in a Jalali month
export function getJalaliMonthLength(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm);
}

// Get all days of a Jalali month
export function getJalaliMonthDays(jy: number, jm: number): Array<{
  jy: number; jm: number; jd: number;
  date: Date; weekDay: number; isCurrentMonth: boolean;
}> {
  const days: Array<{
    jy: number; jm: number; jd: number;
    date: Date; weekDay: number; isCurrentMonth: boolean;
  }> = [];

  const firstDay = fromJalali(jy, jm, 1);
  const firstWeekDay = getJalaliWeekDay(firstDay);
  const monthLength = getJalaliMonthLength(jy, jm);

  // Add previous month days
  for (let i = firstWeekDay - 1; i >= 0; i--) {
    const d = new Date(firstDay);
    d.setDate(d.getDate() - (i + 1));
    const j = toJalali(d);
    days.push({ ...j, date: d, weekDay: getJalaliWeekDay(d), isCurrentMonth: false });
  }

  // Add current month days
  for (let d = 1; d <= monthLength; d++) {
    const date = fromJalali(jy, jm, d);
    days.push({ jy, jm, jd: d, date, weekDay: getJalaliWeekDay(date), isCurrentMonth: true });
  }

  // Fill remaining cells
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const lastDay = days[days.length - 1].date;
    const d = new Date(lastDay);
    d.setDate(d.getDate() + 1);
    const j = toJalali(d);
    days.push({ ...j, date: d, weekDay: getJalaliWeekDay(d), isCurrentMonth: false });
  }

  return days;
}

// Get today in Jalali
export function todayJalali(): { jy: number; jm: number; jd: number } {
  return toJalali(new Date());
}

// Format time
export function formatTime(hour: number, minute: number = 0): string {
  const h = toPersian(String(hour).padStart(2, '0'));
  const m = toPersian(String(minute).padStart(2, '0'));
  return `${h}:${m}`;
}

// Is Jalali date in past
export function isJalaliPast(jy: number, jm: number, jd: number): boolean {
  const date = fromJalali(jy, jm, jd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

// Is Jalali date today
export function isJalaliToday(jy: number, jm: number, jd: number): boolean {
  const today = todayJalali();
  return today.jy === jy && today.jm === jm && today.jd === jd;
}

// Format duration in Persian
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${toPersian(minutes)} دقیقه`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${toPersian(h)} ساعت`;
  return `${toPersian(h)} ساعت و ${toPersian(m)} دقیقه`;
}

// Persian holidays (sample - approximate 1404)
export const PERSIAN_HOLIDAYS_1404: string[] = [
  '1404/1/1', '1404/1/2', '1404/1/3', '1404/1/4', '1404/1/12', '1404/1/13',
  '1404/2/14', '1404/3/14', '1404/3/15', '1404/4/14', '1404/6/31',
  '1404/7/1', '1404/7/22', '1404/8/4', '1404/9/9', '1404/10/1',
  '1404/11/22', '1404/12/29',
];

export function isHoliday(jy: number, jm: number, jd: number): boolean {
  const key = `${jy}/${jm}/${jd}`;
  return PERSIAN_HOLIDAYS_1404.includes(key);
}

// Countdown format
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${toPersian(String(m).padStart(2, '0'))}:${toPersian(String(s).padStart(2, '0'))}`;
}
