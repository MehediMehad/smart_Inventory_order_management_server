# Authentication API Endpoints

**Base Path:** `/api/v1/auth`  
**Version:** 1.0  
**Authentication:**

- Public endpoints: no auth
- Protected endpoints: `Authorization: Bearer`
- Token type: JWT (HS256)
- Access Token lifetime: \~15m (recommended)
- Refresh Token lifetime: \~30d (recommended)
- Email verification: mandatory after registration (OTP)
- Password: bcrypt hashed

### Important Security Notes

- All sensitive operations use **transaction** blocks
- OTPs are single-use & time-bound (10 minutes)
- Refresh token verification happens against DB user existence
- No user enumeration in forgot-password (but your code throws NOT_FOUND — consider softening for production)

---

## Endpoints

### 1\. Register User

**POST** `/register`

Creates user + sends verification OTP to email. Account starts as `DEACTIVATE`.

**Request Body** (JSON or multipart/form-data if uploading image)

```json
{
  "name": "Mehedi Hasan",
  "email": "mehedi@example.com",
  "phone": "017xxxxxxxx",
  "password": "P@ssw0rdStrong123",
  "image": "https://cdn.example.com/avatar.jpg", // image: file
  "role": "USER", // optional, default USER
  "fcmToken": "firebase-device-token" // optional
}
```

**Success Response** · 201 Created

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxxxx",
    "name": "Mehedi Hasan",
    "image": "https://...",
    "email": "mehedi@example.com",
    "phone": "017xxxxxxxx",
    "role": "USER",
    "isVerified": false,
    "status": "DEACTIVATE",
    "createdAt": "2026-01-25T01:15:00.000Z"
  }
}
```

**Errors**

- 400 – User already exists / Validation error

---

### 2\. Verify Email / OTP

**POST** `/verify`

Supports multiple types (`VERIFY_EMAIL`, `RESET_PASSWORD`, etc.)  
After successful verification → returns **fresh access + refresh tokens**

**Request Body**

```json
{
  "email": "mehedi@example.com",
  "code": "483920",
  "type": "VERIFY_EMAIL" // or "RESET_PASSWORD" etc.
}
```

**Success Response** · 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "reset_password verified successfully",
  "data": {
    "id": "clxxxxxxxxxxxxxxxxxxxx",
    "name": "Mehedi Hasan",
    "image": "https://...",
    "email": "mehedi@example.com",
    "role": "USER",
    "isVerified": true,
    "accessToken": "eyJhbGciOiJIUzI1....",
    "refreshToken": "eyJhbGciOiJIUzI....."
  }
}
```

**Errors**

- 400 – Invalid or expired code
- 404 – User not found

---

### 3\. Login

**POST** `/login`

**Request Body**

```json
{
  "email": "mehedi@example.com",
  "password": "P@ssw0rdStrong123",
  "fcmToken": "new-device-token" // optional – updates if provided
}
```

**Success Response** · 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "login successful",
  "data": {
    "id": "69757fe0a705712781d734ec",
    "name": "Mehedi Hasan",
    "image": "https://...",
    "email": "mehedi@example.com",
    "phone": "01712345678",
    "role": "USER",
    "status": "ACTIVE",
    "isVerified": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors**

- 401 – Invalid password
- 403 – Please verify your email
- 403 – Account deactivated / blocked / not verified
- 404 – User not found

---

### 4\. Refresh Access Token

**POST** `/refresh-token`

**Auth:** Bearer

**Success Response** · 200 OK

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "new-short-lived-token"
  }
}
```

**Errors**

- 401 – Invalid / expired refresh token

---

### 5\. Forgot Password

**POST** `/forgot-password`

Sends 6-digit OTP for password reset.

**Request Body**

```json
{
  "email": "mehedi@example.com"
}
```

**Success Response** · 200 OK

```json
{
  "success": true,
  "message": "Reset password code has been sent to your email"
}
```

**Note:** In production, even if email doesn't exist → same message return করা ভালো (anti-enumeration)

---

### 6\. Reset Password

**POST** `/reset-password`

**Request Body**

```json
{
  "token": "726491", // OTP code
  "newPassword": "NewP@ssw0rdStrong456"
}
```

**Success Response** · 200 OK

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### 7\. Change Password (Authenticated)

**POST** `/change-password`  
**Auth:** Bearer Token required

**Request Body**

```json
{
  "oldPassword": "CurrentP@ss123",
  "newPassword": "NewStrongP@ss456"
}
```

**Success Response** · 200 OK

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Recommended .env Configuration

```bash
JWT_ACCESS_SECRET=very-long-random-string-32-chars+
JWT_REFRESH_SECRET=another-very-long-random-string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

<!-- ### Next Suggested Improvements (Security / UX)

- `/resend-otp` endpoint (with rate limit: max 3 per 15 min)
- Blacklist refresh tokens on logout
- Rate limit on login + forgot-password
- HttpOnly + Secure cookie for refresh token (instead of body)
- Add `lastLogin` field in User model -->
