# RouteMate — Peer-to-Peer Travel-Based Product Delivery Platform

> *"Your Journey. Their Need. Your Reward."*  
> *"Anything from Anywhere. Delivered By Someone Already Travelling."*

---

## 1. Executive Summary

**RouteMate** is a production-oriented, full-stack peer-to-peer travel-based delivery platform. Rather than relying on traditional courier trucks, rigid warehouses, or registered e-commerce catalogs, RouteMate connects requesters who need legal products from any city with commuters, travellers, students, and professionals already traveling along those exact geographical corridors.

A requester in **Hyderabad** needing a specialty handicraft from **Warangal** can match with a traveller departing from Warangal to Hyderabad. The traveller collects the item, transports it during their journey, confirms delivery handover via a secure **6-digit OTP**, and receives instant escrow settlement.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3.4 (Emerald `#10b981` & Deep Charcoal `#080B10`), React Router 6, Axios, Framer Motion, HTML5 Canvas scroll scrubbers.
- **Backend**: Python 3.14 / 3.12, Django 6.1 / 5.2, Django REST Framework, Simple JWT, dj-database-url, Uvicorn ASGI.
- **Database**: PostgreSQL (configured via `DATABASE_URL` with SQLite portable zero-dependency development fallback).
- **Security & Integrity**: Role-isolated dashboards, atomic database transactions (`select_for_update`), server-side OTP generation and verification, payment signature validation.
- **Animations**: Custom HTML5 Canvas scroll animation system rendering 55 hero frames, 9 delivery sequence frames, and 9 Shopify-style product unboxing/exploration frames in WebP and JPG formats.
- **Deployment**: Docker, Docker Compose, Multi-stage builds, Nginx reverse proxy.

---

## 3. Project Directory Structure

```
RouteMate/
│
├── important/                   # 55 Original Hero Animation Frames (preserved)
├── product_delivery/            # 9 Original Delivery Sequence Frames (preserved)
├── product_details/             # 9 Original Product Unboxing Frames (preserved)
├── main.jpeg                    # Delivery Concept Visual Reference
│
├── frontend/
│   ├── public/assets/
│   │   ├── frames/hero/         # Optimized WebP & original JPG copies (hero_000 - hero_054)
│   │   ├── frames/delivery/     # Optimized WebP & original JPG copies (delivery_000 - delivery_008)
│   │   └── frames/product/      # Optimized WebP & original JPG copies (product_000 - product_008)
│   │
│   ├── src/
│   │   ├── animations/
│   │   │   ├── animationConfig.js   # Central frame counts, speeds, scroll heights & metadata
│   │   │   └── ScrollCanvas.jsx      # High-performance HTML Canvas requestAnimationFrame scrubber
│   │   ├── components/
│   │   │   ├── Header.jsx           # Glassmorphic header & responsive mobile navigation
│   │   │   ├── Footer.jsx           # Brand footer with legal guidelines & trust seals
│   │   │   └── ProtectedRoute.jsx   # Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT auth state, login/register/logout & redirects
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Cinematic landing page featuring all 3 frame animations
│   │   │   ├── HowItWorks.jsx       # Step-by-step breakdown & permitted items policy
│   │   │   ├── ExploreProducts.jsx  # Live marketplace of open requests
│   │   │   ├── ProductDetails.jsx   # Shopify-style 360 unboxing & specs cinema
│   │   │   ├── BecomeTraveller.jsx  # Earning potential & luggage calculator
│   │   │   ├── AboutUs.jsx          # Mission, community values & ethics
│   │   │   ├── Contact.jsx          # Customer helpline & dispute channels
│   │   │   ├── Login.jsx            # JWT Login with 1-click test credentials
│   │   │   └── Register.jsx         # Role-based onboarding (Requester vs Traveller)
│   │   ├── dashboards/
│   │   │   ├── requester/           # 9-stage tracker, create request, matches, OTP reveal
│   │   │   ├── traveller/           # Publish journey, route matches, verify OTP, earnings
│   │   │   └── admin/               # Overview, user suspensions, verifications, analytics
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with JWT interceptor & auto-refresh
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
│
├── backend/
│   ├── config/
│   │   ├── settings.py          # Dual PostgreSQL / SQLite, Simple JWT, CORS & throttle rules
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── apps/
│   │   ├── accounts/            # Custom User model, JWT views, role sanitization
│   │   ├── profiles/            # User profile, KYC identity documents
│   │   ├── requests_app/        # Product requests, city corridors, budget & reward
│   │   ├── journeys/            # Journey publishing, departure, capacity & stops
│   │   ├── matching/            # Smart Route Matching Engine & scoring algorithms
│   │   ├── deliveries/          # 9-stage order pipeline, atomic acceptance, OTP system
│   │   ├── payments/            # Escrow management, Razorpay order/verify, withdrawals
│   │   ├── notifications/       # Multi-channel alerts (Match, Status, Payment, Security)
│   │   ├── reviews/             # Dual-sided feedback & rating aggregation
│   │   ├── support/             # Complaints, incident reporting & admin audit logging
│   │   └── analytics/           # Super-admin metrics, trends & route telemetry
│   ├── seed_demo_data.py        # Realistic development demonstration records
│   ├── test_suite.py            # Comprehensive automated test suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml           # Production multi-container orchestration
├── .env.example                 # Environment configuration template
└── prepare_frames.py            # Automated WebP frame optimizer & manifest generator
```

---

## 4. Animation Rendering Architecture (`ScrollCanvas.jsx`)

The frame animation engine utilizes native **HTML Canvas 2D contexts** scrubbed via scroll positions:
1. **Preloading & Decoding**: All frames are preloaded into memory using `new Image()` and `image.decode()` where supported, eliminating frame stutter and layout shifts.
2. **Standardization & WebP Optimization**: The `prepare_frames.py` script sorted all frames in natural numerical order, preserved all original JPG files, and generated modern `.webp` copies with automatic fallback.
3. **High-DPI Support**: Uses `window.devicePixelRatio` capped at 2.0 to ensure crisp rendering on Retina screens without excess memory consumption.
4. **Bidirectional Scrubbing**: Full mathematical support for forward and reverse scrubbing via `requestAnimationFrame`.
5. **Animation Config (`animationConfig.js`)**:
   - `hero`: 55 frames (`hero_000.webp` to `hero_054.webp`), 260vh scroll height.
   - `delivery`: 9 frames (`delivery_000.webp` to `delivery_008.webp`), 200vh scroll height.
   - `product`: 9 frames (`product_000.webp` to `product_008.webp`), 220vh scroll height, with automatic box opening, 360-degree rotation, and component reveal.

---

## 5. Smart Route Matching Engine

Located in `backend/apps/matching/engine.py`:
- Evaluates geographical alignment between traveller journeys and open product requests.
- Factors:
  - **Pickup Compatibility**: Exact origin match (+45 pts), intermediate scheduled stop (+35 pts), or haversine proximity radius within 30 km.
  - **Destination Compatibility**: Exact destination match (+45 pts), intermediate scheduled stop (+35 pts), or destination vicinity radius.
  - **Schedule Alignment**: Traveller arrival date on or before requester's required delivery deadline (+10 pts).
  - **Capacity Check**: Traveller available luggage capacity compared to parcel weight.
- Returns:
  - `match_score` (0% to 100%)
  - `estimated_detour_km`
  - `estimated_travel_time_hours`
  - `pickup_compatibility` & `destination_compatibility`
  - Human-readable factor breakdown

---

## 6. Delivery Lifecycle & Security

```
[OPEN] ➔ [MATCHED] ➔ [ACCEPTED] ➔ [COLLECTED] ➔ [IN_TRANSIT] ➔ [ARRIVED] ➔ [READY_FOR_HANDOVER] ➔ [DELIVERED]
```

1. **Race Condition Prevention**: Request acceptance utilizes `transaction.atomic()` and `select_for_update()` to ensure two travellers cannot accept the same request simultaneously.
2. **Cryptographic Handover OTP**:
   - A random 6-digit numeric OTP is generated when a delivery order is created.
   - **Privacy Isolation**: The OTP is strictly exposed *only* to the requester on their private dashboard.
   - The traveller never sees the OTP in public or private APIs.
   - When handing over the physical package, the requester verbally provides the OTP. The traveller inputs the code, which verifies expiry, attempt limits (max 5), sets the delivery to `DELIVERED`, and triggers payment reward credit.

---

## 7. Demo Accounts & Testing Credentials

Pre-seeded via `backend/seed_demo_data.py`:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Requester** | `requester_demo` | `Requester@12345` | Post requests, view matches, manage escrows, view OTP |
| **Traveller** | `traveller_demo` | `Traveller@12345` | Publish journeys, accept deliveries, input OTP, withdraw |
| **Administrator** | `admin` | `Admin@12345` | Full telemetry, verify users, audit logs, dispute control |

*(The login screen also provides 1-click helper buttons to automatically fill these credentials for rapid evaluation).*

---

## 8. Quickstart & Local Execution

### Backend Setup:
```powershell
# From the project root
python backend/manage.py migrate
python backend/seed_demo_data.py
python backend/manage.py test test_suite
python backend/manage.py runserver 8000
```

### Frontend Setup:
```powershell
cd frontend
npm run build
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 9. Docker Deployment

Deploy the entire full-stack application (PostgreSQL + Django ASGI + React Nginx) with one command:

```bash
docker compose up --build -d
```
- Frontend: `http://localhost` (Port 80)
- Backend APIs: `http://localhost:8000/api/`
- PostgreSQL: `localhost:5432`

