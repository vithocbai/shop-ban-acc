# API-CONTRACT.md

# 🔌 API CONTRACT

Frontend ↔ Backend Communication Standard
Shop bán acc game – Django REST Framework + ReactJS

---

# 1. API Overview

## Base URL

```text id="mhmv9f"
Development:
http://localhost:8000/api

Production:
https://domain.com/api
```

---

# 2. API Standards

## Request Format

### Headers

```http id="u6qvqb"
Content-Type: application/json
Authorization: Bearer <access_token>
```

---

## Response Format

### Success Response

```json id="5lyhvb"
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

### Error Response

```json id="2c5ffx"
{
  "success": false,
  "message": "Validation Error",
  "errors": {}
}
```

---

# 3. Authentication APIs

# AUTH MODULE

## Login

### POST `/auth/login/`

### Request

```json id="x5cwwl"
{
  "email": "user@gmail.com",
  "password": "123456"
}
```

---

### Response

```json id="7tz9vl"
{
  "success": true,
  "message": "Login success",
  "data": {
    "access_token": "",
    "refresh_token": "",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@gmail.com",
      "role": "admin"
    }
  }
}
```

---

## Register

### POST `/auth/register/`

### Request

```json id="duwtq4"
{
  "username": "quang",
  "email": "quang@gmail.com",
  "password": "123456",
  "confirm_password": "123456"
}
```

---

## Refresh Token

### POST `/auth/refresh/`

---

## Logout

### POST `/auth/logout/`

---

# 4. User APIs

# USER MODULE

## Get Profile

### GET `/users/profile/`

---

## Update Profile

### PUT `/users/profile/`

### Request

```json id="yotd9j"
{
  "username": "new_name",
  "phone": "0123456789"
}
```

---

## Change Password

### POST `/users/change-password/`

---

## Purchase History

### GET `/users/orders/`

---

## Deposit History

### GET `/users/transactions/`

---

# 5. Game APIs

# GAME MODULE

## Get All Games

### GET `/games/`

### Response

```json id="im2skz"
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Liên Quân",
      "slug": "lien-quan",
      "icon": "",
      "banner": ""
    }
  ]
}
```

---

## Get Game Detail

### GET `/games/:slug/`

---

# 6. Account APIs

# ACCOUNT MODULE

## Get Account List

### GET `/accounts/`

## Query Params

```text id="3qk3cd"
?page=1
&limit=20
&game=lien-quan
&rank=cao-thu
&price_min=100000
&price_max=500000
&sort=latest
```

---

## Response

```json id="vx6v0i"
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "total": 100
    }
  }
}
```

---

## Get Account Detail

### GET `/accounts/:id/`

### Response

```json id="9w0zwo"
{
  "id": 1,
  "title": "Acc Liên Quân VIP",
  "price": 500000,
  "thumbnail": "",
  "gallery": [],
  "status": "AVAILABLE",
  "description": "",
  "game": {
    "id": 1,
    "name": "Liên Quân"
  },
  "account_data": {
    "rank": "Cao Thủ",
    "skins": 120
  }
}
```

---

## Related Accounts

### GET `/accounts/:id/related/`

---

## Search Accounts

### GET `/accounts/search/`

---

# 7. Cart APIs

# CART MODULE

## Get Cart

### GET `/cart/`

---

## Add To Cart

### POST `/cart/add/`

### Request

```json id="6mkx0m"
{
  "account_id": 15
}
```

---

## Remove Cart Item

### DELETE `/cart/remove/:id/`

---

## Clear Cart

### DELETE `/cart/clear/`

---

# 8. Order APIs

# ORDER MODULE

## Create Order

### POST `/orders/create/`

### Request

```json id="b8h9s8"
{
  "payment_method": "BANKING",
  "items": [
    {
      "account_id": 15
    }
  ]
}
```

---

## Order Detail

### GET `/orders/:id/`

---

## Order History

### GET `/orders/history/`

---

## Order Delivery Info

### GET `/orders/:id/delivery/`

### Response

```json id="yjkz8f"
{
  "account_username": "",
  "account_password": "",
  "email_info": ""
}
```

---

# 9. Payment APIs

# PAYMENT MODULE

## Create Payment

### POST `/payments/create/`

---

## Generate QR

### GET `/payments/:id/qr/`

---

## Verify Payment

### POST `/payments/verify/`

---

## Payment Webhook

### POST `/payments/webhook/`

---

# 10. Transaction APIs

# TRANSACTION MODULE

## Transaction History

### GET `/transactions/`

---

## Deposit Money

### POST `/transactions/deposit/`

---

# 11. News APIs

# NEWS MODULE

## Get News List

### GET `/news/`

---

## Get News Detail

### GET `/news/:slug/`

---

# 12. Banner APIs

# BANNER MODULE

## Homepage Banners

### GET `/banners/home/`

---

## Popup Banner

### GET `/banners/popup/`

---

# 13. Notification APIs

# NOTIFICATION MODULE

## Get Notifications

### GET `/notifications/`

---

## Read Notification

### POST `/notifications/:id/read/`

---

# 14. Upload APIs

# UPLOAD MODULE

## Upload Image

### POST `/uploads/image/`

### FormData

```text id="u08k6v"
file: image
```

---

## Upload Multiple Images

### POST `/uploads/multiple/`

---

# 15. Admin APIs

# ADMIN MODULE

---

# Admin Authentication

## Admin Login

### POST `/admin/auth/login/`

---

# Admin Dashboard

## Dashboard Statistics

### GET `/admin/dashboard/statistics/`

### Response

```json id="s9gtyo"
{
  "total_users": 1000,
  "total_orders": 5000,
  "total_revenue": 100000000
}
```

---

# 16. Admin Game Management

## Get Games

### GET `/admin/games/`

---

## Create Game

### POST `/admin/games/create/`

---

## Update Game

### PUT `/admin/games/:id/`

---

## Delete Game

### DELETE `/admin/games/:id/`

---

# 17. Admin Account Management

## Get Accounts

### GET `/admin/accounts/`

---

## Create Account

### POST `/admin/accounts/create/`

### Request

```json id="jlwmih"
{
  "game_id": 1,
  "title": "Acc VIP",
  "price": 500000,
  "account_data": {
    "rank": "Cao Thủ"
  }
}
```

---

## Update Account

### PUT `/admin/accounts/:id/`

---

## Delete Account

### DELETE `/admin/accounts/:id/`

---

## Lock Account

### POST `/admin/accounts/:id/lock/`

---

# 18. Admin User Management

## User List

### GET `/admin/users/`

---

## User Detail

### GET `/admin/users/:id/`

---

## Ban User

### POST `/admin/users/:id/ban/`

---

## Change User Role

### POST `/admin/users/:id/role/`

---

# 19. Admin Order Management

## Order List

### GET `/admin/orders/`

---

## Order Detail

### GET `/admin/orders/:id/`

---

## Update Order Status

### POST `/admin/orders/:id/status/`

---

# 20. Admin Deposit Management

## Deposit Requests

### GET `/admin/deposits/`

---

## Approve Deposit

### POST `/admin/deposits/:id/approve/`

---

## Reject Deposit

### POST `/admin/deposits/:id/reject/`

---

# 21. Admin News Management

## Create News

### POST `/admin/news/create/`

---

## Update News

### PUT `/admin/news/:id/`

---

## Delete News

### DELETE `/admin/news/:id/`

---

# 22. Admin Banner Management

## Create Banner

### POST `/admin/banners/create/`

---

## Update Banner

### PUT `/admin/banners/:id/`

---

## Delete Banner

### DELETE `/admin/banners/:id/`

---

# 23. Admin Notification Management

## Create System Notification

### POST `/admin/notifications/create/`

---

# 24. Admin Analytics APIs

## Revenue Report

### GET `/admin/analytics/revenue/`

---

## User Statistics

### GET `/admin/analytics/users/`

---

## Best Selling Games

### GET `/admin/analytics/top-games/`

---

# 25. HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Validation Error      |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 500  | Internal Server Error |

---

# 26. Pagination Standard

### Response

```json id="4t7b8l"
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

# 27. Security Standards

## JWT Authentication

* access token
* refresh token

---

## Rate Limiting

* login
* payment
* admin APIs

---

## Validation

* serializer validation
* request sanitization

---

# 28. Naming Convention

## RESTful APIs

```text id="w2q7a2"
GET     /accounts/
GET     /accounts/:id/
POST    /accounts/
PUT     /accounts/:id/
DELETE  /accounts/:id/
```

---

# 29. Future APIs

Hỗ trợ mở rộng:

* vòng quay
* random box
* affiliate
* livestream
* mobile app
* AI recommendation
