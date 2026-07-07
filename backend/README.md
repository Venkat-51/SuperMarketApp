
SuperMarket APP — Backend API
==============================

Technology: ASP.NET Core 8 Web API + Entity Framework Core + SQLite

## Quick Start

### Prerequisites
- .NET 8 SDK

### Run the backend
```powershell
cd "backend\SuperMarketAPI"
dotnet restore
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
```

The API starts at: http://localhost:5000
Swagger UI at:    http://localhost:5000/swagger

### Environment
Edit `appsettings.json` to configure:
- `Jwt:Key`              — Change this in production!
- `Razorpay:KeyId`       — Your Razorpay key_id
- `Razorpay:KeySecret`   — Your Razorpay key_secret
- `Cors:AllowedOrigins`  — Frontend URLs

## API Summary

| Route                           | Auth | Description                      |
|---------------------------------|------|----------------------------------|
| POST /api/auth/send-otp         | No   | Get OTP (returns otp in dev)     |
| POST /api/auth/verify-otp       | No   | Verify OTP → JWT token           |
| GET  /api/auth/me               | Yes  | Current user                     |
| GET  /api/products              | No   | List products (filter + search)  |
| GET  /api/products/{id}         | No   | Product detail                   |
| GET  /api/categories            | No   | All categories                   |
| POST /api/orders                | Yes  | Place order                      |
| GET  /api/orders                | Yes  | My order history                 |
| GET  /api/orders/{id}           | Yes  | Order detail                     |
| POST /api/payments/create-order | Yes  | Create Razorpay order            |
| POST /api/payments/verify       | Yes  | Verify Razorpay signature        |
| GET  /api/cart                  | Yes  | Get saved cart                   |
| POST /api/cart/sync             | Yes  | Sync cart from frontend          |
| GET  /api/addresses             | Yes  | My addresses                     |
| POST /api/addresses             | Yes  | Add address                      |
| POST /api/coupons/validate      | No   | Validate coupon code             |
| GET  /api/wishlist              | Yes  | Get wishlist                     |
| POST /api/wishlist/{id}         | Yes  | Add to wishlist                  |

## Demo Credentials
- Phone: any 10-digit number
- OTP:   123456 (fixed in dev mode)

## Sample Coupons
| Code     | Discount            | Min Order |
|----------|---------------------|-----------|
| SAVE50   | ₹50 flat            | ₹299      |
| FLAT100  | ₹100 flat           | ₹599      |
| FIRST20  | 20% (max ₹150)      | ₹199      |
| SAISALE  | 15% (max ₹200)      | ₹499      |

## Frontend API Client
Located at: frontend/src/lib/api.ts
Provides typed wrappers for every endpoint.
