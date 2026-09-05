# Medicine Substitution Assistant

A full-stack healthcare platform and clinical bioequivalence intelligence engine designed to help patients, doctors, and pharmacists find chemically equivalent generic medicines and save up to 70% on prescriptions.

---

## 🌟 Key Highlights & Features

1. **Intelligent Generic Substitution Engine**:
   - Matches active pharmaceutical ingredients, exact dosage strengths, and bio-delivery forms.
   - Calculates percentage and rupee savings per strip.
   - Displays compliance notices: *"Medicine substitutions should be confirmed by a qualified doctor or pharmacist before use."*
2. **Comprehensive Medicine Catalog**:
   - 40+ seeded medicines across 8+ therapeutic categories (Cardiovascular, Diabetes, Antibiotics, Gastrointestinal, Respiratory, etc.).
   - Live search, multi-filtering (category, dosage form, in-stock status, Rx requirement), and sorting.
3. **Shopping Cart & Medical Checkout**:
   - Home Delivery (₹30 standard fee) vs In-Store Pharmacy Pickup (₹0 fee).
   - Real **Razorpay Online Gateway** integration (UPI, GPay, PhonePe, Cards, Net Banking) with backend HMAC-SHA256 signature verification.
   - **Cash on Delivery (COD)** support.
4. **Automated Tax Invoice Generation (PDF)**:
   - Built using **ReportLab** with official branding, itemized breakdowns, GST calculations, and statutory medical notices.
5. **Multilingual Interface (i18n)**:
   - Full support for 6 Indian regional languages: **English**, **Tamil (தமிழ்)**, **Hindi (हिन्दी)**, **Telugu (తెలుగు)**, **Malayalam (മലയാളം)**, and **Kannada (ಕನ್ನಡ)**.
6. **Executive Admin Management Suite**:
   - Complete inventory CRUD (Add, Edit, Delete medicines).
   - **Bulk CSV Importer** with validation, duplicate resolution, and error reporting.
   - Live Order Management (Placed → Confirmed → Shipped → Delivered).
   - User account role delegation (Patient vs Admin).
7. **Healthcare Analytics Dashboard**:
   - Powered by **Recharts** displaying most searched medicines, order volume trends, and disease class distributions.
8. **Dark / Light Theme**:
   - Persistent theme mode with smooth transition.

---

## 🏗️ Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons, Recharts
* **Backend**: Python 3.10+, Django 5.x, Django REST Framework, SimpleJWT
* **Database**: MySQL (with zero-configuration SQLite fallback)
* **Invoice Engine**: ReportLab PDF Generator
* **Payments**: Razorpay API + HMAC-SHA256 Signature Verification
* **Languages Supported**: English, Tamil, Hindi, Telugu, Malayalam, Kannada

---

## 📁 Project Directory Structure

```text
medicine-substitution-assistant/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   ├── core/                      # Django project settings & main router
│   ├── users/                     # Custom User, SimpleJWT Auth, Profiles, Roles
│   ├── medicines/                 # Medicine model, Search, Substitute finder, CSV import
│   │   └── management/commands/   # seed_medicines.py & seed_demo.py
│   ├── orders/                    # Cart validation, Orders, Item snapshots
│   ├── payments/                  # Razorpay service, Signature verification, COD
│   ├── invoices/                  # ReportLab PDF invoice generator
│   └── analytics/                 # Aggregated analytics endpoints
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/            # Navbar, Footer, MedicineCard, SubstituteModal, etc.
│   │   ├── context/               # Auth, Cart, Language, Theme, Toast
│   │   ├── i18n/                  # Multi-language translations (EN, TA, HI, TE, ML, KN)
│   │   ├── pages/                 # Home, Medicines, SubstituteFinder, Cart, Checkout, etc.
│   │   ├── pages/admin/           # AdminDashboard, AdminMedicines, AdminOrders, CSVImport, etc.
│   │   └── services/              # Axios API service clients
├── database/
│   ├── schema.sql                 # MySQL schema dump
│   ├── sample_data.csv            # Bulk CSV import template
│   └── seed_data.sql              # MySQL seed data
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Step-by-Step Setup Guide (Windows / Mac / Linux)

### Prerequisites
- Python 3.10 or higher
- Node.js v18 or higher & npm
- (Optional) MySQL Server 8.0+ if using MySQL directly

---

### Step 1: Backend Setup & Virtual Environment

1. Navigate to the `backend` directory:
   ```powershell
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   # Windows (PowerShell)
   py -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS / Git Bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install all dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```powershell
   # Windows PowerShell
   Copy-Item .env.example .env
   ```
   *Note: By default, `DB_ENGINE=sqlite` is configured so you can run the project immediately without configuring a MySQL server. To use MySQL, set `DB_ENGINE=mysql` and provide your MySQL credentials in `.env`.*

5. Run database migrations:
   ```powershell
   python manage.py makemigrations users medicines orders payments
   python manage.py migrate
   ```

6. Seed complete demo data (medicines, admin, users, orders):
   ```powershell
   python manage.py seed_demo
   ```
   *Or seed medicines only:*
   ```powershell
   python manage.py seed_medicines
   ```

7. Start the Django Development Server:
   ```powershell
   python manage.py runserver 8000
   ```
   *The backend will be live at `http://localhost:8000/`.*

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```powershell
   cd frontend
   ```

2. Install npm packages:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   *The application will open at `http://localhost:5173/`.*

---

## 🔑 Pre-Configured Demo Credentials

For quick evaluation, single-click login buttons are provided on the Login page, or you can enter:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Healthcare Administrator** | `admin@medassist.com` | `adminpassword123` | Full Admin Portal, Inventory CRUD, Orders, CSV Import, Users |
| **Patient / User** | `patient@example.com` | `userpassword123` | Medicine Search, Substitute Finder, Cart, Checkout, Order Tracking |

---

## 💳 Razorpay Payment & Checkout Flow

1. User adds medicines / generic substitutes to the cart.
2. At checkout, user selects **Home Delivery** or **In-Store Pharmacy Pickup**.
3. When **Online Payment (Razorpay)** is selected:
   - Backend creates an internal order and calls `/api/payments/razorpay/create/` to generate a Razorpay order.
   - The official Razorpay checkout modal opens.
   - Upon payment completion, Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
   - The frontend sends these to `/api/payments/razorpay/verify/` where Django cryptographically verifies the HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`.
   - The transaction is recorded in the database, the order is marked as `PAID`, and a ReportLab PDF invoice is automatically generated.
4. When **Cash on Delivery (COD)** is selected:
   - The order is placed and marked as `CONFIRMED` with payment status `PENDING`.

---

## 📑 Core REST API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login/` | `POST` | User & Admin JWT Login |
| `/api/auth/register/` | `POST` | Patient Account Registration |
| `/api/auth/profile/` | `GET`, `PATCH` | Retrieve & Update User Profile |
| `/api/medicines/` | `GET`, `POST` | Search & Filter Catalog (Admin Create) |
| `/api/medicines/{id}/` | `GET`, `PUT`, `DELETE` | Medicine Details & Admin CRUD |
| `/api/medicines/{id}/substitutes/` | `GET` | Bioequivalent Substitute Engine |
| `/api/medicines/import-csv/` | `POST` | Bulk CSV Medicine Import (Admin) |
| `/api/orders/` | `GET`, `POST` | User Orders & Order Placement |
| `/api/orders/{id}/` | `GET`, `PATCH` | Order Detail & Admin Status Update |
| `/api/orders/cart/validate/` | `POST` | Validate Stock & Expiry before Checkout |
| `/api/payments/razorpay/create/` | `POST` | Create Razorpay Order |
| `/api/payments/razorpay/verify/` | `POST` | Verify HMAC-SHA256 Payment Signature |
| `/api/payments/cod/` | `POST` | Confirm Cash on Delivery Order |
| `/api/invoices/{order_id}/pdf/` | `GET` | Download ReportLab Tax Invoice PDF |
| `/api/analytics/` | `GET` | Public Analytics for Recharts |
| `/api/analytics/admin-deep/` | `GET` | Deep Inventory Risk & Expiry Analytics |

---

## ⚖️ Statutory Medical Disclaimer

> **"Medicine substitutions should be confirmed by a qualified doctor or pharmacist before use."**
> 
> *The Medicine Substitution Assistant utilizes pharmaceutical composition, bio-delivery routes and dosage strengths to identify potential generic equivalents. Patients must verify any change in prescription with a licensed physician or pharmacist before administration.*

---

## 📦 Packaging & GitHub Delivery

The entire repository is structured for clean GitHub pushes and also bundled as `medicine-substitution-assistant.zip`.
