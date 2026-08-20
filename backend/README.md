# ⚙️ SuperMarket App — Backend API

An enterprise-ready **ASP.NET Core 8 Web API** powering the SuperMarket application with Entity Framework Core, SQLite / PostgreSQL, JWT Authentication (Email/Password & Google OAuth), and Razorpay Payment Gateway integration.

---

## 🛠️ Tech Stack & Prerequisites

- **Framework**: .NET 8 SDK (ASP.NET Core Web API)
- **Database**: SQLite (`supermarket.db`) / PostgreSQL (Neon)
- **ORM**: Entity Framework Core 8
- **Authentication**: JWT Bearer Authentication (Email/Password & Google OAuth)
- **Payments**: Razorpay .NET SDK
- **API Documentation**: OpenAPI / Swagger UI

---

## ⚡ Quick Start

### 1. Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- EF Core CLI Tools: `dotnet tool install --global dotnet-ef`

### 2. Run Database Migrations & Start Server
```powershell
cd SuperMarketAPI
dotnet restore
dotnet ef database update
dotnet run
```

- **Base URL**: `http://localhost:5000`
- **Swagger Documentation UI**: `http://localhost:5000/swagger`

---

## ⚙️ Configuration (`appsettings.json`)

Configure parameters in `appsettings.json` or system environment variables:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=supermarket.db"
  },
  "Jwt": {
    "Key": "SuperMarketAppSecretKeyForJWTAuth2026!",
    "Issuer": "SuperMarketAPI",
    "Audience": "SuperMarketApp"
  },
  "Razorpay": {
    "KeyId": "rzp_test_YOUR_KEY_ID",
    "KeySecret": "YOUR_KEY_SECRET"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"]
  }
}
```

---

## 📡 API Endpoint Reference

| Controller | Method | Endpoint | Auth Required | Description |
| --- | --- | --- | --- | --- |
| **Auth** | `POST` | `/api/auth/register` | ❌ No | Register new user with Email, Password & Name |
| **Auth** | `POST` | `/api/auth/login` | ❌ No | Authenticate user with Email & Password → JWT token |
| **Auth** | `POST` | `/api/auth/google` | ❌ No | Authenticate user with Google ID token → JWT token |
| **Auth** | `GET` | `/api/auth/me` | ✅ Yes | Get authenticated user profile |
| **Auth** | `PATCH`| `/api/auth/me` | ✅ Yes | Update user profile details |
| **Products** | `GET` | `/api/products` | ❌ No | Get product list with search/filter/sort |
| **Products** | `GET` | `/api/products/{id}` | ❌ No | Get single product by ID |
| **Categories**| `GET` | `/api/categories` | ❌ No | Get all product categories |
| **Cart** | `GET` | `/api/cart` | ✅ Yes | Fetch user's persistent cart |
| **Cart** | `POST` | `/api/cart/sync` | ✅ Yes | Synchronize cart items from client |
| **Addresses** | `GET` | `/api/addresses` | ✅ Yes | List saved delivery addresses |
| **Addresses** | `POST` | `/api/addresses` | ✅ Yes | Save new delivery address |
| **Orders** | `POST` | `/api/orders` | ✅ Yes | Place a new grocery order |
| **Orders** | `GET` | `/api/orders` | ✅ Yes | Get order history for user |
| **Orders** | `GET` | `/api/orders/{id}` | ✅ Yes | Get order details by ID |
| **Payments** | `POST` | `/api/payments/create-order`| ✅ Yes | Create Razorpay order ID |
| **Payments** | `POST` | `/api/payments/verify` | ✅ Yes | Verify Razorpay payment signature |
| **Coupons** | `POST` | `/api/coupons/validate` | ❌ No | Validate coupon code & calculate discount |
| **Wishlist** | `GET` | `/api/wishlist` | ✅ Yes | Get saved wishlist items |
| **Wishlist** | `POST` | `/api/wishlist/{id}` | ✅ Yes | Toggle item in user's wishlist |

---

## 🧪 Testing Credentials & Authentication

- **Demo Customer**: `user@example.com` / `password123`
- **Demo Admin**: `admin@example.com` / `admin123`
- **Google Sign-In**: Send Google ID Token payload to `/api/auth/google`

---

## 🐳 Docker Support

To build and run the backend container standalone:

```bash
docker build -t supermarket-backend .
docker run -p 5000:8080 supermarket-backend
```
