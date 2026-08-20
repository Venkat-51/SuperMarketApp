# 📱 SuperMarket App — Frontend Client

A responsive, high-performance web client built with **React 18**, **Vite 6**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm package manager

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.development` or `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Running Development Server
```bash
npm run dev
```
The app will run locally at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
```

---

## 🎨 UI Architecture & Libraries

- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite`
- **UI Components**: Radix UI Primitives, Lucide Icons, Shadcn UI patterns
- **Authentication**: Email/Password login, Sign up form, Google OAuth integration
- **Animations**: Framer Motion (`motion/react`)
- **Notifications**: Sonner Toasts
- **PDF Generation**: `jspdf` + `html2canvas` for order invoice downloads
- **Confetti**: `canvas-confetti` for payment completion celebrate animations

---

## 📂 Directory Structure

```
frontend/
├── public/                 # Static public assets & images
└── src/
    ├── app/
    │   ├── components/     # UI Components (Header, Cart, Product Cards, Modals)
    │   ├── context/        # React Contexts (AuthContext, CartContext, WishlistContext)
    │   ├── data/           # Offline fallback products dataset & categories
    │   ├── screens/        # Screen Views (HomeScreen, ProductDetailScreen, CartScreen, AccountScreen, OrderDetailScreen, LoginModal, etc.)
    │   └── App.tsx         # Main Routing & Application Layout Shell
    ├── lib/
    │   ├── api.ts          # Typed REST API client connecting to backend API
    │   └── utils.ts        # Helper functions & formatters (Currency, Date, Coupon Validator)
    ├── index.css           # Global Tailwind CSS entry
    └── main.tsx            # App bootstrap entry
```

---

## 🔌 API Client Integration (`lib/api.ts`)

The frontend uses a custom, typed API wrapper (`src/lib/api.ts`) that handles:
- Authorization header injection (`Bearer <JWT_TOKEN>`)
- Authentication methods: `api.auth.login()`, `api.auth.register()`, `api.auth.googleLogin()`
- Persistent token storage in `localStorage`
- Error handling & toast notifications
- Automatic cart synchronization upon user login

---

## 📄 Attributions
Original UI design inspired by the Figma [E-commerce Grocery App UI Kit](https://www.figma.com/design/eTVzSbEYlxA8jbUVuCHU5L/E-commerce-Grocery-App-UI-Kit).