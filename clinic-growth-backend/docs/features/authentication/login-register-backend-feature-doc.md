# Login and Register Backend Feature Document

## Overview
This document defines the backend requirements for the **Clinic Manager Login** and **Clinic Manager Registration** screens shown in the attached UI. The screens include: clinic registration with **clinic name, username, password, confirm password**, and login with **username and password**. [file:1][file:2]

The goal is to give a developer enough detail to implement the backend APIs, database structure, validation rules, authentication flow, and security requirements for production-ready login and registration. [file:1][file:2]

## Scope
This backend feature covers:
- Clinic manager account registration. [file:1]
- Clinic manager login. [file:2]
- Password hashing and authentication. [file:1][file:2]
- Session or token issuance after login. [file:2]
- Validation and error handling for both forms. [file:1][file:2]

This backend feature does not cover:
- Forgot password flow.
- Email verification.
- SMS OTP / 2FA.
- Multi-role authorization beyond clinic manager.
- Social login.

## UI-Derived Inputs
Based on the provided screens, the backend should support the following inputs.

### Register form
| Field | Type | Required | Notes |
|---|---|---:|---|
| clinicName | string | Yes | Name of clinic entered by user. [file:1] |
| username | string | Yes | Unique login identifier. [file:1] |
| password | string | Yes | Secret password. [file:1] |
| confirmPassword | string | Yes | Must match password. [file:1] |

### Login form
| Field | Type | Required | Notes |
|---|---|---:|---|
| username | string | Yes | Username entered by user. [file:2] |
| password | string | Yes | Password entered by user. [file:2] |

## Functional Requirements

### Registration
The system must allow a new clinic manager to create an account using clinic name, username, and password. [file:1]

Requirements:
- `clinicName` is required.
- `username` is required and must be unique.
- `password` is required.
- `confirmPassword` must match `password`.
- Registration must fail if the username already exists.
- Registration must create a new clinic record and a manager user record, or a single account record if the domain model is simplified.
- Password must never be stored in plain text.
- On successful registration, the API should return either:
  - a success message and require login, or
  - authenticated session/token directly.

Recommended behavior:
- Return the created user profile and auth token directly after successful registration for smoother UX.

### Login
The system must authenticate an existing clinic manager using username and password. [file:2]

Requirements:
- Login fails if username does not exist.
- Login fails if password is incorrect.
- Login succeeds only for active accounts.
- On success, backend returns authenticated user data and access credentials.
- The backend should update `lastLoginAt` after successful login.

### Authentication state
After a successful login or successful register-with-auto-login flow, the backend must issue one of the following:
- JWT access token.
- Refresh token pair.
- Secure server session cookie.

Recommended approach:
- Use **access token + refresh token** if frontend is SPA/mobile.
- Use **HTTP-only secure cookie session** if frontend and backend are same-site web app.

## Suggested Domain Model

### Option A: Separate clinic and user tables
This is the better structure if each clinic may later have multiple users.

#### clinics
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | varchar(150) | Clinic name |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |
| status | varchar(20) | active, suspended, deleted |

#### users
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| clinic_id | uuid | FK to clinics.id |
| username | varchar(50) | Unique |
| password_hash | varchar(255) | Hashed password only |
| role | varchar(30) | `clinic_manager` |
| is_active | boolean | Default true |
| last_login_at | timestamp null | Last successful login |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Option B: Single table
Use this only if the product will always have one manager account per clinic.

#### clinic_managers
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| clinic_name | varchar(150) | Clinic name |
| username | varchar(50) | Unique |
| password_hash | varchar(255) | Hashed password only |
| is_active | boolean | Default true |
| last_login_at | timestamp null | Last successful login |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

## Validation Rules

### clinicName
- Required.
- Trim leading/trailing spaces.
- Minimum 2 characters.
- Maximum 150 characters.

### username
- Required.
- Trim spaces.
- Minimum 3 characters.
- Maximum 50 characters.
- Allow only letters, numbers, underscore, and dot, if desired.
- Must be unique case-insensitively.

Recommended regex:
```txt
^[a-zA-Z0-9._]{3,50}$
```

### password
- Required.
- Minimum 8 characters.
- Maximum 128 characters.
- Should be hashed using Argon2 or bcrypt.

Recommended password policy:
- At least 1 uppercase letter.
- At least 1 lowercase letter.
- At least 1 number.
- At least 1 special character.

Example regex:
```txt
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$
```

### confirmPassword
- Required during registration only.
- Must exactly match `password`.
- Must not be stored in database.

## API Design

Base path example:
```txt
/api/v1/auth
```

### 1) Register
**POST** `/api/v1/auth/register`

Request body:
```json
{
  "clinicName": "CGP Clinic",
  "username": "admin",
  "password": "Admin@123",
  "confirmPassword": "Admin@123"
}
```

Success response `201 Created`:
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "clinicId": "uuid",
    "clinicName": "CGP Clinic",
    "username": "admin",
    "role": "clinic_manager"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

Validation error `400 Bad Request`:
```json
{
  "message": "Validation failed",
  "errors": {
    "clinicName": ["Clinic name is required"],
    "username": ["Username already exists"],
    "password": ["Password is too weak"],
    "confirmPassword": ["Passwords do not match"]
  }
}
```

Conflict error `409 Conflict`:
```json
{
  "message": "Username already exists"
}
```

### 2) Login
**POST** `/api/v1/auth/login`

Request body:
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

Success response `200 OK`:
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "clinicId": "uuid",
    "clinicName": "CGP Clinic",
    "username": "admin",
    "role": "clinic_manager"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

Authentication error `401 Unauthorized`:
```json
{
  "message": "Invalid username or password"
}
```

Inactive account error `403 Forbidden`:
```json
{
  "message": "Account is inactive"
}
```

### 3) Refresh token
**POST** `/api/v1/auth/refresh`

Request body:
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Success response:
```json
{
  "accessToken": "new-access-token"
}
```

### 4) Logout
**POST** `/api/v1/auth/logout`

Purpose:
- Revoke refresh token or destroy session.

## Backend Flow

### Register flow
1. Receive request.
2. Validate all fields.
3. Check if username already exists.
4. Hash password.
5. Start DB transaction.
6. Insert clinic record.
7. Insert user record linked to clinic.
8. Commit transaction.
9. Generate auth token(s) or session.
10. Return success response.

### Login flow
1. Receive request.
2. Validate username and password presence.
3. Find user by username.
4. If no user, return unauthorized.
5. Compare submitted password with stored hash.
6. If mismatch, return unauthorized.
7. Check account is active.
8. Generate token(s) or session.
9. Update `last_login_at`.
10. Return success response.

## Security Requirements
- Hash passwords with **Argon2id** preferred, or **bcrypt** with strong cost factor.
- Never log plain passwords.
- Never return password hash in response.
- Use HTTPS only in production.
- Add rate limiting on login and register endpoints.
- Add brute-force protection for repeated failed logins.
- Use generic login error message like `Invalid username or password`.
- Validate and sanitize all inputs.
- Use secure, HTTP-only cookies if cookie auth is chosen.
- Refresh tokens should be rotatable and revocable.
- Store refresh tokens hashed if persisted in database.

## Business Rules
- One username belongs to one account only.
- A clinic manager can log in only if account status is active.
- Registration creates the first clinic manager for that clinic.
- Username uniqueness should be case-insensitive, so `Admin` and `admin` are treated as the same.

## Error Messages
Recommended API error messages:

| Scenario | HTTP | Message |
|---|---:|---|
| Missing clinic name | 400 | Clinic name is required |
| Missing username | 400 | Username is required |
| Invalid username format | 400 | Username format is invalid |
| Username already exists | 409 | Username already exists |
| Missing password | 400 | Password is required |
| Weak password | 400 | Password does not meet security requirements |
| Password mismatch | 400 | Passwords do not match |
| Invalid login | 401 | Invalid username or password |
| Inactive account | 403 | Account is inactive |
| Too many attempts | 429 | Too many attempts, try again later |

## OpenAPI Example
```yaml
paths:
  /api/v1/auth/register:
    post:
      summary: Register clinic manager
  /api/v1/auth/login:
    post:
      summary: Login clinic manager
  /api/v1/auth/refresh:
    post:
      summary: Refresh access token
  /api/v1/auth/logout:
    post:
      summary: Logout current user
```

## Suggested Tech Choices
- Node.js + Express or NestJS
- PostgreSQL or MySQL
- Prisma / TypeORM / Sequelize
- Argon2 or bcrypt for password hashing
- JWT for token auth
- Redis for refresh token or rate-limit support

## Definition of Done
Backend implementation is complete when:
- Register API works with full validation.
- Login API works with password verification.
- Passwords are hashed securely.
- Username uniqueness is enforced in DB.
- Error responses are consistent.
- Tokens or sessions are issued correctly.
- Rate limiting is enabled.
- Audit fields such as `created_at` and `last_login_at` are stored.
- Frontend can integrate without guessing field names or response shapes.

## Optional Next Step for Developer
A good next implementation package would include:
- database schema / migration,
- auth controller,
- auth service,
- validation DTOs,
- password utility,
- JWT utility,
- middleware / guards,
- Postman or Swagger collection.
