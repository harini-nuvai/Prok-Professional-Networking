# Postman / curl Examples — Auth API

Base URL: `http://localhost:5000`

---

## 1. POST /api/signup

**Request**
```
POST http://localhost:5000/api/signup
Content-Type: application/json

{
  "username": "alice42",
  "email": "alice@example.com",
  "password": "SecurePass1"
}
```

**Success (201)**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "data": {
    "user": {
      "id": 1,
      "username": "alice42",
      "email": "alice@example.com",
      "created_at": "2024-01-15T10:30:00"
    }
  }
}
```

**Validation error (400)**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "password": "Password must contain at least one uppercase letter."
  }
}
```

**Duplicate username (409)**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "username": "Username is already taken."
  }
}
```

---

## 2. POST /api/login

Accepts `username_or_email`, `email`, or `username` as the identifier field.

**Request (using email)**
```
POST http://localhost:5000/api/login
Content-Type: application/json

{
  "username_or_email": "alice@example.com",
  "password": "SecurePass1"
}
```

**Request (using username)**
```json
{
  "username_or_email": "alice42",
  "password": "SecurePass1"
}
```

**Success (200)**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "alice42",
      "email": "alice@example.com",
      "created_at": "2024-01-15T10:30:00"
    }
  }
}
```

**Wrong credentials (401)**
```json
{
  "success": false,
  "message": "Invalid credentials."
}
```

---

## 3. GET /api/me  (protected)

Copy the `access_token` from the login response.

**Request**
```
GET http://localhost:5000/api/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success (200)**
```json
{
  "success": true,
  "message": "User fetched.",
  "data": {
    "user": {
      "id": 1,
      "username": "alice42",
      "email": "alice@example.com",
      "created_at": "2024-01-15T10:30:00"
    }
  }
}
```

**Missing / expired token (401)**
```json
{
  "msg": "Missing Authorization Header"
}
```

---

## curl equivalents

```bash
# Signup
curl -s -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice42","email":"alice@example.com","password":"SecurePass1"}' | jq

# Login
curl -s -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"alice42","password":"SecurePass1"}' | jq

# Me (replace TOKEN below)
curl -s http://localhost:5000/api/me \
  -H "Authorization: Bearer TOKEN" | jq
```
