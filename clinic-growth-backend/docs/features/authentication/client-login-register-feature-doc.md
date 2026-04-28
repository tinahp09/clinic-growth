# Client (Patient) Login and Register Backend Feature Document

## Overview
This document defines the backend requirements for the **Client (Patient) Login** and **Client Registration** screens in the mobile app. The flow includes:
- Client registration with full name + mobile → OTP verification code → register successfully
- Client login with mobile → OTP code → login successfully

This is a simplified OTP-based authentication flow for patients/clients of the clinic.

## Scope
This backend feature covers:
- Client registration with full name and mobile number.
- OTP code generation and sending (simulated for now).
- OTP verification and account creation.
- Login with mobile + OTP verification.
- Token issuance after successful authentication.

This backend feature does not cover:
- Real SMS gateway integration (ZarinPal/SMS.ir).
- Email verification.
- Password-based login for clients.
- Social login.
- Multi-device sessions.

## Functional Requirements

### Registration
The system must allow a new client to register using their full name and mobile number.

Requirements:
- `fullName` is required (client's name).
- `mobile` is required and must be a valid Iranian mobile number (09xxxxxxxxx).
- First, generate and send OTP code (simulated - returns in response).
- Client must verify with the OTP code to complete registration.
- Mobile number must be unique in the system.
- On successful registration, create a patient record.

### Login
The system must authenticate an existing client using mobile number and OTP code.

Requirements:
- Login with mobile number to receive OTP code.
- Verify with OTP code to complete login.
- Only verified clients can login.
- On success, return authentication token.

### OTP Flow
1. Client requests OTP (registration or login).
2. Backend generates 6-digit OTP code.
3. Backend stores OTP with expiration (5 minutes).
4. Backend "sends" OTP (simulated - returns in debug mode).
5. Client submits OTP.
6. Backend verifies OTP and issues token.
7. OTP is invalidated after use or expiration.

## API Design

Base path:
```
/api/v1/auth/client
```

### 1) Request OTP for Registration
**POST** `/api/v1/auth/client/register/otp`

Request:
```json
{
  "fullName": "فاطمه حسینی",
  "mobile": "09123456789"
}
```

Success response `200 OK`:
```json
{
  "status": 200,
  "message": "OTP sent successfully",
  "debugOtp": "123456",
  "expiresIn": 300
}
```

Validation error `400 Bad Request`:
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "fullName": ["Full name is required"],
    "mobile": ["Invalid mobile number format"]
  }
}
```

Conflict error `409 Conflict`:
```json
{
  "status": 409,
  "message": "Mobile number already registered"
}
```

### 2) Verify OTP and Register
**POST** `/api/v1/auth/client/register/verify`

Request:
```json
{
  "fullName": "فاطمه حسینی",
  "mobile": "09123456789",
  "otp": "123456"
}
```

Success response `201 Created`:
```json
{
  "status": 201,
  "message": "Registration successful",
  "patient": {
    "id": "uuid",
    "fullName": "فاطمه حسینی",
    "mobile": "09123456789"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

Error `400 Bad Request`:
```json
{
  "status": 400,
  "message": "Invalid or expired OTP"
}
```

### 3) Request OTP for Login
**POST** `/api/v1/auth/client/login/otp`

Request:
```json
{
  "mobile": "09123456789"
}
```

Success response `200 OK`:
```json
{
  "status": 200,
  "message": "OTP sent successfully",
  "debugOtp": "123456",
  "expiresIn": 300
}
```

Error `404 Not Found`:
```json
{
  "status": 404,
  "message": "Mobile number not registered"
}
```

### 4) Verify OTP and Login
**POST** `/api/v1/auth/client/login/verify`

Request:
```json
{
  "mobile": "09123456789",
  "otp": "123456"
}
```

Success response `200 OK`:
```json
{
  "status": 200,
  "message": "Login successful",
  "patient": {
    "id": "uuid",
    "fullName": "فاطمه حسینی",
    "mobile": "09123456789"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

Error `400 Bad Request`:
```json
{
  "status": 400,
  "message": "Invalid or expired OTP"
}
```

### 5) Refresh Token
**POST** `/api/v1/auth/client/refresh`

Request:
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Success response:
```json
{
  "status": 200,
  "accessToken": "new-access-token"
}
```

### 6) Logout
**POST** `/api/v1/auth/client/logout`

Request:
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Success response:
```json
{
  "status": 200,
  "message": "Logged out successfully"
}
```

## Database Schema

### patients (already exists)
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| tenant_id | uuid | FK to tenants |
| full_name | varchar(100) | Client full name |
| mobile | varchar(20) | Unique mobile number |
| email | varchar(100) | Optional email |
| is_verified | boolean | Default false |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### otp_codes (temporary table)
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| mobile | varchar(20) | Target mobile |
| code | varchar(6) | OTP code |
| purpose | varchar(20) | 'register' or 'login' |
| expires_at | timestamp | Expiration time |
| used_at | timestamp | When used (null if not used) |
| created_at | timestamp | Creation time |

## Validation Rules

### fullName
- Required.
- Minimum 3 characters.
- Maximum 100 characters.
- Persian and English characters allowed.

### mobile
- Required.
- Must be valid Iranian mobile format: `09xxxxxxxxx`
- 11 characters starting with 09.

Regex:
```txt
^09[0-9]{9}$
```

### otp
- Required.
- Must be 6 digits.
- Must match stored OTP.
- Must not be expired.

## Backend Flow

### Registration Flow
1. Client submits fullName and mobile.
2. Validate inputs.
3. Check if mobile already registered.
4. Generate 6-digit OTP.
5. Store OTP with 5-minute expiration.
6. Return OTP (simulated - in debug mode).
7. Client submits OTP.
8. Verify OTP matches and not expired.
9. Create patient record with is_verified = true.
10. Generate access and refresh tokens.
11. Return tokens and patient data.

### Login Flow
1. Client submits mobile.
2. Validate mobile format.
3. Check if mobile registered.
4. Generate 6-digit OTP.
5. Store OTP with 5-minute expiration.
6. Return OTP (simulated - in debug mode).
7. Client submits OTP.
8. Verify OTP matches and not expired.
9. Generate access and refresh tokens.
10. Return tokens and patient data.

## Security Requirements
- OTP codes expire after 5 minutes.
- OTP codes can only be used once.
- Rate limit OTP requests (max 5 per mobile per hour).
- Don't reveal if mobile is registered ( prevention for enumeration).
- Use HTTPS in production.
- Store OTP codes hashed or in encrypted form.
- Implement account lockout after multiple failed OTP attempts.

## Error Messages

| Scenario | HTTP | Message |
|---|---:|---|
| Missing full name | 400 | Full name is required |
| Invalid mobile format | 400 | Invalid mobile number format |
| Mobile already registered | 409 | Mobile number already registered |
| Mobile not registered | 404 | Mobile number not registered |
| Invalid OTP | 400 | Invalid or expired OTP |
| OTP already used | 400 | OTP already used |
| Too many requests | 429 | Too many OTP requests, try again later |

## Definition of Done
Backend implementation is complete when:
- [ ] Registration OTP API works and returns OTP.
- [ ] Registration verify API creates patient and returns tokens.
- [ ] Login OTP API works and returns OTP.
- [ ] Login verify API returns tokens for verified patients.
- [ ] OTP expiration works (5 minutes).
- [ ] OTP single-use enforcement works.
- [ ] Mobile uniqueness is enforced.
- [ ] Token refresh works.
- [ ] Logout works.
- [ ] Error responses are consistent.