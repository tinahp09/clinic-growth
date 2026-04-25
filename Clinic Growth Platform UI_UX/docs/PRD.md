markdown
# 📄 Product Requirement Document (PRD) v4.1

**Project:** Clinic Growth & Booking Platform (SaaS)  
**Status:** Production-Ready Specification  
**Calendar System:** Persian (Jalali) First + Gregorian Storage  
**Last Updated:** 2026-04-23

---

## 1. Overview

### 1.1 Product Name
Clinic Growth Platform

### 1.2 Product Description
A multi-tenant SaaS platform for aesthetic clinics to manage booking, payments, scheduling, and patient media records with a strict, state-driven booking engine, deterministic availability system, and **full Persian (Jalali) calendar support** for the Iranian market.

### 1.3 Core System Design Principles

- **Single Source of Truth:** Booking state is centralized
- **Event-Driven Lifecycle:** Payment, booking, cancellation are events
- **Deterministic Scheduling:** Availability is computed via a central engine
- **Idempotent Payments:** All gateway callbacks are safe to replay
- **Strict Multi-Tenancy:** All queries enforce tenant isolation
- **Concurrency Safe:** No slot can ever be double-booked (atomic operations only)
- **Persian Calendar Native:** All business logic uses Jalali dates; Gregorian for storage only

---

## 2. System State Machines

### 2.1 Booking State Machine
CREATED (user selects slot)
↓
RESERVED (slot locked via atomic DB operation, 15 min TTL)
↓
PENDING_PAYMENT (if Paid mode, payment session initialized)
↓
CONFIRMED (payment success OR free mode)

FROM ANY NON-TERMINAL STATE:
→ FAILED_PAYMENT (gateway failure, refund if charged)
→ CANCELLED (allowed or staff override)
→ EXPIRED (RESERVED TTL exceeded OR payment session timeout)

Terminal States:
CONFIRMED
CANCELLED
FAILED_PAYMENT
EXPIRED

text

**Auto-transition rule:** `CREATED → RESERVED` occurs atomically when user selects a slot.

### 2.2 Payment State Machine
INITIATED → REDIRECTED → PENDING_CALLBACK → VERIFIED
↓
FAILED

FROM ANY STATE:
→ ABANDONED (booking cancelled before payment completion)
→ REFUNDED (from VERIFIED booking after cancellation)

text

**Rules:**
- All payment callbacks are idempotent
- Each `booking_id` = unique idempotency key
- Duplicate callbacks MUST NOT change state
- `FAILED_PAYMENT` allows **one retry** on same RESERVED booking (payment TTL extended by 5 min)

### 2.3 Refund State Machine (P1)
REQUESTED → PROCESSING → SUCCESS
↓
FAILED

text

---

## 3. Booking Engine (Core System)

### 3.1 Availability Engine (Single Source of Truth)
AVAILABLE_SLOTS =
WORKING_HOURS (Persian weekday aware)

PERSIAN_HOLIDAYS (fixed dates like Nowruz)

LUNAR_HOLIDAYS (Tasua, Ashura, Arba'een - pre-calculated)

WEEKLY_OFF (Friday = day 7)

LUNCH_BREAK

EXISTING_BOOKINGS

SERVICE_DURATION

BUFFER_TIME (belongs to previous booking, non-bookable)

STAFF_UNAVAILABILITY (doctor, nurse, etc.)

ROOM_UNAVAILABILITY (laser room, consult room, etc.)

text

**Rules:**
- All scheduling decisions MUST use this engine
- No frontend-based slot calculation allowed
- Staff + Room availability is **AND** condition: both must be free
- Buffer time blocks adjacent slot starts
- Persian weekday numbering: 1=شنبه, 2=یکشنبه, 3=دوشنبه, 4=سه‌شنبه, 5=چهارشنبه, 6=پنجشنبه, 7=جمعه

### 3.2 Concurrency-Safe Slot Locking (Atomic Only)

**Implementation: PostgreSQL (default) or Redis (only if high throughput >1000 req/sec)**

#### PostgreSQL Atomic Reservation:
```sql
UPDATE slots 
SET booking_id = ?, 
    status = 'RESERVED', 
    reserved_until = NOW() + INTERVAL '15 minutes',
    version = version + 1
WHERE id = ? 
  AND status = 'AVAILABLE' 
  AND (reserved_until IS NULL OR reserved_until < NOW())
RETURNING *;
If affected_rows = 0 → slot already taken → reject booking

Redis Alternative (if used):
lua
-- Lua script for atomic reservation
if redis.call('GET', KEYS[1]) == 'AVAILABLE' then
    redis.call('SETEX', KEYS[1], 900, 'RESERVED:'..ARGV[1])
    return 1
else
    return 0
end
Rules:

No "best effort" locking allowed

Double booking = system failure condition (monitored via alert)

Integration test required: two concurrent requests → exactly one success

3.3 Payment After Expiry - Critical Rule
Scenario: Payment callback arrives after RESERVED TTL expired

Handler:

text
IF booking.status = 'EXPIRED' AND payment succeeds:
    1. Create new booking with same slot (if still available)
    2. Transfer payment to new booking_id
    3. Log migration in audit table
    4. Send notification to clinic (manual review recommended)
ELSE IF slot is no longer available:
    1. Auto-refund payment
    2. Set booking → EXPIRED + REFUNDED
    3. Alert operations team
4. Multi-Service Booking Rules
4.1 Duration Calculation
text
TOTAL_DURATION = SUM(service_durations) + (N - 1) × BUFFER_TIME

BUFFER_TIME = 5 minutes (default, clinic-configurable)
Buffer ownership: Buffer belongs to the previous booking and is non-bookable for new slots.

Example:

Service A: 10:00-10:30

Buffer: 10:30-10:35 (owned by Service A)

Service B: can start at 10:35 earliest

4.2 Constraints Engine (Persian Context)
Each service can define:

json
{
  "requires_staff_type": "doctor",
  "requires_staff_id": null,
  "requires_room_type": "laser_room",
  "requires_room_id": null,
  "incompatible_with": ["service_id"],
  "min_gap_between_services": 0,
  "max_daily_bookings_per_staff": 10,
  "block_days_before_holiday": 0,
  "max_advance_booking_days": 30
}
Validation order:

Staff availability (time + daily limit)

Room availability (time + type match)

Service incompatibility (against same-day client bookings)

Gap constraint (against previous service end time)

Holiday proximity (if block_days_before_holiday > 0)

5. Payment System (ZarinPal)
5.1 Payment Modes
Paid Mode:

Slot RESERVED immediately

Payment required to reach CONFIRMED

Payment session TTL: 15 minutes (resets once on retry)

Free Mode:

Direct CREATED → CONFIRMED

No gateway interaction

5.2 Payment Idempotency Rules
booking_id = idempotency key

Gateway callback can be replayed safely

Duplicate callbacks MUST NOT change final state

System returns cached result for duplicate callbacks (200 OK with existing state)

5.3 Payment Timeout & Retry Rules
text
Initial payment session TTL: 15 minutes

IF payment fails (FAILED_PAYMENT):
    IF retry_count < 1:
        Allow new payment session
        Extend RESERVED TTL by +5 minutes
        Increment retry_count
    ELSE:
        Move booking → EXPIRED
        Release slot

IF payment session TTL expires without success:
    booking → EXPIRED
    slot → RELEASED
5.4 Payment Callback Retry Handling
ZarinPal may send duplicate or delayed callbacks. System MUST:

Check booking_id idempotency key

If already processed → return 200 with stored result

If booking EXPIRED → trigger auto-refund workflow

Never change terminal state once set

6. Cancellation System (Deterministic)
6.1 Client Cancellation Rule (Time-based - unaffected by calendar)
python
def can_cancel(booking, now):
    # Staff override bypasses all rules
    if role == 'staff':
        return True
    
    # Rule 1: Too close to appointment (60 minutes before start)
    if booking.appointment_start - now < timedelta(minutes=60):
        return False
    
    # Rule 2: Outside cancellation window (4 hours from creation)
    if now - booking.created_at > timedelta(minutes=240):
        return False
    
    return True
Examples:

Booking created 3h ago, starts in 5h → ✅ ALLOWED

Booking created 5h ago, starts in 6h → ❌ DENIED

Booking starts in 30 min → ❌ DENIED (contact clinic)

6.2 Staff Override
Clinic staff can cancel ANY non-terminal booking

Cancellation always triggers refund evaluation (if paid)

Staff cancellation logged with cancelled_by_staff_id

No time restrictions for staff

7. Working Hours Engine (Persian Calendar)
7.0 Calendar System Architecture
Core Principle:

Storage Layer: Gregorian UTC (ISO 8601) for sorting, comparisons, API stability

Business Logic Layer: Persian (Jalali) calendar for availability, working days, holidays

Presentation Layer: Persian calendar with Persian digits (configurable per tenant)

Conversion Rule:

python
from khayyam import JalaliDatetime
import pytz

def gregorian_to_persian(gregorian_dt, tenant_timezone):
    tz = pytz.timezone(tenant_timezone)
    localized = gregorian_dt.astimezone(tz)
    jalali = JalaliDatetime(localized)
    return {
        "year": jalali.year,
        "month": jalali.month,
        "day": jalali.day,
        "weekday": jalali.weekday(),  # 1-7 (1=Saturday/شنبه, 7=Friday/جمعه)
        "weekday_name": jalali.weekdayname(),  # "شنبه", "یکشنبه", ...
        "persian_date": f"{jalali.year}-{jalali.month:02d}-{jalali.day:02d}"
    }
7.1 Clinic Schedule Model (Persian-First)
json
{
  "calendar_system": "persian",
  "timezone": "Asia/Tehran",
  "working_days": {
    "1": { "name": "شنبه", "name_en": "Saturday", "enabled": true, "order": 1 },
    "2": { "name": "یکشنبه", "name_en": "Sunday", "enabled": true, "order": 2 },
    "3": { "name": "دوشنبه", "name_en": "Monday", "enabled": true, "order": 3 },
    "4": { "name": "سه‌شنبه", "name_en": "Tuesday", "enabled": true, "order": 4 },
    "5": { "name": "چهارشنبه", "name_en": "Wednesday", "enabled": true, "order": 5 },
    "6": { "name": "پنجشنبه", "name_en": "Thursday", "enabled": true, "order": 6 },
    "7": { "name": "جمعه", "name_en": "Friday", "enabled": false, "order": 7 }
  },
  "daily_hours": {
    "start": "09:00",
    "end": "18:00"
  },
  "breaks": [
    { "start": "13:00", "end": "14:00" }
  ],
  "persian_holidays": [
    {
      "month": 1,
      "day": 1,
      "name": "نوروز",
      "yearly": true,
      "lunar_based": false,
      "days_off": 4
    },
    {
      "month": 1,
      "day": 13,
      "name": "سیزده بدر",
      "yearly": true,
      "lunar_based": false,
      "days_off": 1
    }
  ],
  "lunar_holidays": [
    {
      "name": "تاسوعا",
      "lunar_month": 1,
      "lunar_day": 9,
      "days_off": 1
    },
    {
      "name": "عاشورا",
      "lunar_month": 1,
      "lunar_day": 10,
      "days_off": 1
    },
    {
      "name": "اربعین",
      "lunar_month": 1,
      "lunar_day": 20,
      "days_off": 1
    },
    {
      "name": "رحلت پیامبر",
      "lunar_month": 2,
      "lunar_day": 28,
      "days_off": 1
    },
    {
      "name": "شهادت امام رضا",
      "lunar_month": 5,
      "lunar_day": 23,
      "days_off": 1
    },
    {
      "name": "مبعث",
      "lunar_month": 7,
      "lunar_day": 27,
      "days_off": 1
    },
    {
      "name": "ولادت امام زمان",
      "lunar_month": 8,
      "lunar_day": 15,
      "days_off": 1
    }
  ],
  "exceptions": [
    {
      "persian_date": "1404-12-29",
      "gregorian_date": "2026-03-20",
      "is_closed": true,
      "reason": "تحویل سال - روز اول نوروز"
    }
  ]
}
7.2 Lunar Holiday Pre-calculation Engine
Requirement: System MUST pre-calculate lunar-based holidays for next 24 months and store as exceptions.

**Monthly scheduled job (cron: 0 0 1 * ):*

python
def recalculate_lunar_holidays():
    # Calculate next 24 months of Persian dates
    for month_offset in range(1, 25):
        target_date = JalaliDatetime.today() + timedelta(days=month_offset*30)
        for lunar_holiday in LUNAR_HOLIDAYS:
            gregorian_date = lunar_to_gregorian(
                lunar_holiday.lunar_month,
                lunar_holiday.lunar_day,
                target_date.year
            )
            persian_date = gregorian_to_jalali(gregorian_date)
            
            upsert_exception(
                persian_date=persian_date,
                gregorian_date=gregorian_date,
                is_closed=True,
                reason=lunar_holiday.name
            )
7.3 Persian Week Logic
All availability queries MUST use Persian weekday numbering:

sql
-- Get bookings for "next Saturday" (شنبه)
SELECT * FROM bookings 
WHERE tenant_id = ? 
  AND jalali_weekday = 1  -- 1 = Saturday (شنبه)
  AND jalali_date >= CURRENT_PERSIAN_DATE()
ORDER BY jalali_date ASC;
7.4 Timezone Change Rule
CRITICAL: Timezone changes can only be applied if:

No future bookings exist beyond 7 days from changes

OR clinic manually reschedules affected bookings

System prevents timezone change with validation error

All Persian date conversions are recalculated after timezone change

Stored in UTC, displayed in clinic's configured timezone.

8. Staff & Room Availability (Resource Contention Model)
8.1 Staff Unavailability Sources
sql
staff_unavailability = 
    bookings WHERE staff_id = X
    UNION
    staff_time_off (vacation, training, sick leave)
    UNION
    max_daily_booking_limit_reached
8.2 Room Unavailability Sources
sql
room_unavailability = 
    bookings WHERE room_id = X
    UNION
    room_maintenance_schedule
8.3 Slot Availability Check (Must pass all)
sql
SELECT 1 FROM dual WHERE EXISTS (
    slot_is_within_working_hours AND
    slot_not_in_break AND
    slot_not_in_persian_holiday AND
    slot_not_in_lunar_holiday AND
    staff_available_at_time AND
    room_available_at_time AND
    staff_daily_limit_not_exceeded
);
9. Media Vault (P1)
9.1 Access Rules
Client can only view media if ALL true:

Appointment is CONFIRMED

Service was actually performed (attendance logged)

visible_to_client = true

Consent was obtained and still valid (no revocation)

9.2 Compliance Model
Each media record includes:

json
{
  "uploaded_by": "staff_id",
  "uploaded_at": "2026-04-23T10:30:00Z",
  "uploaded_at_persian": "1405-02-03 15:00",
  "consent_obtained": true,
  "consent_signature_id": "ref_to_consent_log",
  "consent_revoked_at": null,
  "audit_log_enabled": true,
  "retention_days": 2555,
  "deleted_at": null
}
9.3 Deletion Rules
Client request: Requires staff approval, creates audit log

Automatic: After retention_days → soft delete → hard delete after +30 days

Staff deletion: Soft delete only, logged permanently

GDPR-style hard delete: Allowed only after no active bookings for 180 days

10. Multi-Tenancy (Strict Isolation)
Enforcement Rules
Every table includes tenant_id (UUID, indexed)

All queries MUST filter by tenant_id

Middleware enforces tenant scope automatically via JWT claim

No cross-tenant joins allowed

Redis keys prefixed with tenant:{tenant_id}:

Database connection pool can optionally use SET app.current_tenant

10.1 Tenant Calendar Configuration
Each tenant can configure:

calendar_system: "persian" (default) or "gregorian"

first_day_of_week: 1 (Saturday for Persian) or 0 (Monday for Gregorian)

date_format: "persian_digits" or "western_digits"

timezone: default "Asia/Tehran"

11. System Boundaries (Enforced)
Backend Owns (Absolute)
Booking validation

Payment state transitions

Availability engine (including staff + room + Persian holidays)

Cancellation rules

Slot locking (atomic operations)

Idempotency enforcement

Calendar conversions (Gregorian ↔ Persian)

Frontend Owns (Only)
UI rendering

Form collection

Displaying data from APIs (with Persian digits/localization)

Loading states and error messages

Date picker (Persian calendar widget only)

Frontend NEVER Does
No scheduling logic

No price/duration calculation

No availability calculation

No state machine transitions

No calendar conversion logic (must call backend API)

Violation detection: CI/CD lint rule rejects frontend PRs containing keywords like calculateAvailableSlots, computePrice, validateBooking, jalaliToGregorian

12. Refund System (P1)
12.1 Trigger Conditions
Refund only triggered from:

CONFIRMED booking that is CANCELLED

FAILED_PAYMENT where payment succeeded but booking expired

12.2 Async Refund Workflow
yaml
1. Refund requested (staff or auto)
2. Refund status → PROCESSING
3. Gateway API call (idempotent, refund_idempotency_key)
4. On success → SUCCESS + booking.refunded_at
5. On failure → FAILED + retry available (max 3 attempts)
6. Manual intervention required after 3 failures
12.3 Refund Tracking
Table refunds:

refund_id (UUID)

booking_id

amount

requested_at (UTC)

requested_at_persian (VARCHAR)

processed_at

status (REQUESTED, PROCESSING, SUCCESS, FAILED)

gateway_response (JSON)

retry_count

13. KPI Metrics (Auto-logged)
Metric    Definition    Alert Threshold
Booking Success Rate    Confirmed / Initiated    < 70%
Payment Failure Rate    Failed / Total Payments    > 15%
No-show Rate    Missed appointments / Confirmed    > 20%
Cancellation Rate    Cancelled / Confirmed    > 30%
Refund Success Rate    Successful refunds / Requested    < 95%
Double-booking Attempts    Count of concurrent failures    > 0 (zero tolerance)
14. Observability & Failure Handling
14.1 Dead Letter Queue (DLQ)
All failed payment callbacks go to DLQ with:

Original payload

Error reason

Retry count

Manual reprocess endpoint

14.2 Alerts (PagerDuty on-call)
yaml
critical:
  - double_booking_attempts > 0
  - payment_callback_dlq_size > 10
  - refund_failed_count > 5 in 1 hour
  - lunar_holiday_calculation_failed

warning:
  - availability_engine_recomputation_time > 500ms
  - booking_success_rate < 70% over 15min
  - slot_lock_contention > 10 per minute
  - persian_date_conversion_error_rate > 1%
14.3 Integration Test Requirement
Mandatory test before deployment:

python
def test_concurrent_booking_prevents_double_booking():
    results = concurrent_execute(book_slot, slot_id, times=2)
    success_count = sum(1 for r in results if r.status == 201)
    assert success_count == 1

def test_persian_holiday_blocking():
    # Try to book on Nowruz (Farvardin 1)
    result = book_slot(persian_date="1405-01-01")
    assert result.status == 400
    assert "holiday" in result.message

def test_persian_weekday_correctness():
    # Saturday (شنبه) should be day 1
    availability = get_availability(persian_weekday=1)
    assert "شنبه" in availability.weekday_name
15. Database Schema Additions (Persian Calendar)
sql
-- Bookings table extensions
ALTER TABLE bookings ADD COLUMN jalali_date VARCHAR(10);  -- 1404-01-01
ALTER TABLE bookings ADD COLUMN jalali_weekday SMALLINT;  -- 1 to 7
ALTER TABLE bookings ADD COLUMN jalali_year SMALLINT;
ALTER TABLE bookings ADD COLUMN jalali_month SMALLINT;
CREATE INDEX idx_bookings_jalali ON bookings(tenant_id, jalali_date, jalali_weekday);
CREATE INDEX idx_bookings_jalali_year_month ON bookings(tenant_id, jalali_year, jalali_month);

-- Holiday exceptions table
CREATE TABLE holiday_exceptions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    persian_date VARCHAR(10) NOT NULL,
    gregorian_date DATE NOT NULL,
    name VARCHAR(255),
    is_closed BOOLEAN DEFAULT true,
    reason TEXT,
    lunar_based BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_holiday_persian_date (tenant_id, persian_date)
);

-- Trigger to auto-populate jalali fields
CREATE OR REPLACE FUNCTION update_jalali_fields()
RETURNS TRIGGER AS $$
BEGIN
    SELECT gregorian_to_jalali(NEW.appointment_start_utc, NEW.timezone)
    INTO NEW.jalali_date, NEW.jalali_weekday, NEW.jalali_year, NEW.jalali_month;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_jalali
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_jalali_fields();
16. API Contract (Persian-Aware)
All date responses MUST include both formats:

json
{
  "booking_id": "uuid",
  "status": "CONFIRMED",
  "appointment_start_utc": "2026-03-20T06:30:00Z",
  "appointment_start_local": "2026-03-20T10:00:00+03:30",
  "appointment_start_persian": "1405-01-01 10:00",
  "persian_weekday": "پنجشنبه",
  "persian_weekday_number": 6,
  "persian_month_name": "فروردین",
  "persian_month_number": 1,
  "persian_year": 1405
}
Request example (frontend → backend):

json
{
  "persian_date": "1405-01-15",
  "time": "14:00",
  "service_ids": ["uuid1", "uuid2"]
}
Backend validates and converts to Gregorian internally.

17. Frontend Requirements (Persian)
17.1 Required Libraries
json
{
  "dependencies": {
    "react-persian-datepicker": "^4.0.0",
    "persian-tools": "^2.0.0",
    "react-number-format": "^5.0.0"
  }
}
17.2 Persian Digits Configuration
javascript
// Global configuration
const persianDigits = {
  toPersian: (num) => num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]),
  toEnglish: (str) => str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
};

// All numeric displays use Persian digits
<PriceDisplay>{persianDigits.toPersian(250000)} تومان</PriceDisplay>
17.3 Date Picker Component
jsx
import { DatePicker } from 'react-persian-datepicker';

<DatePicker
  calendarSystem="persian"
  showWeekdays={['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']}
  inputFormat="YYYY/MM/DD"
  placeholder="انتخاب تاریخ"
  onChange={(persianDate) => handleDateChange(persianDate)}
/>
18. Final Architecture Summary
Core Services
Booking Service (state machine + cancellation)

Payment Service (idempotency + callbacks + retry)

Availability Engine (staff + room + working hours + Persian holidays)

Media Service (compliance + retention)

Tenant Service (isolation + timezone + calendar management)

Calendar Service (Gregorian ↔ Persian conversion, holiday calculation)

Core Guarantees
No booking is valid unless it passes through:

Booking State Machine (atomic transitions)

Availability Engine (staff + room + Persian holiday contention)

Payment Idempotency Layer (callback safety)

Concurrency Lock (PostgreSQL atomic or Redis Lua)

Persian Calendar Validation (holiday + weekday + lunar check)

Appendix A: Persian Month Reference
Number    Name (فارسی)    Name (English)    Days (Normal/Leap)
1    فروردین    Farvardin    31
2    اردیبهشت    Ordibehesht    31
3    خرداد    Khordad    31
4    تیر    Tir    31
5    مرداد    Mordad    31
6    شهریور    Shahrivar    31
7    مهر    Mehr    30
8    آبان    Aban    30
9    آذر    Azar    30
10    دی    Dey    30
11    بهمن    Bahman    30
12    اسفند    Esfand    29/30
