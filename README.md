# 🚀 SmartComply Transaction Monitoring Platform

A production-ready transaction monitoring system built with **Django + React + Redis Streams**. Features a dynamic rule engine, event-driven processing, and a beautiful responsive dashboard.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Design Decisions](#design-decisions)
- [Trade-offs](#trade-offs)
- [Assumptions](#assumptions)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## 📌 Overview

SmartComply is a **Transaction Monitoring Platform** designed to detect suspicious financial activities in real-time. It combines:

- ✅ **JWT Authentication** – Secure user access
- ✅ **Rule Engine** – 4 built-in rules (High Amount, Frequent Transactions, Blacklisted Country, High-Risk Customer)
- ✅ **Event-Driven Processing** – Asynchronous transaction evaluation using Redis Streams
- ✅ **React Dashboard** – Beautiful, responsive UI with real-time data

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Docker Compose Environment                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Frontend   │    │   Backend    │    │   Consumer   │          │
│  │   React + TS │───▶│ Django + DRF │───▶│   (Worker)   │          │
│  │   Port: 80   │    │   Port: 8000 │    │   (Async)    │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                              │                │                     │
│                              ▼                ▼                     │
│                    ┌──────────────────────────────────┐             │
│                    │     PostgreSQL (Database)        │             │
│                    │          Port: 5432              │             │
│                    └──────────────────────────────────┘             │
│                              ▲                                     │
│                              │                                     │
│                    ┌──────────────────────────────────┐             │
│                    │     Redis (Event Streams)        │             │
│                    │          Port: 6379              │             │
│                    └──────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### Flow:
1. **User creates a transaction** via API or frontend
2. **Event published** to Redis Streams
3. **Consumer picks up event** asynchronously
4. **Rule Engine evaluates** the transaction
5. **Risk score updated** in database
6. **Alerts & Audit logs** created
7. **Frontend updates** in real-time

---

## ✨ Features

### Backend API (Django + DRF)
| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ |
| Create/List Customers | ✅ |
| Create/List Transactions | ✅ |
| Transaction Details | ✅ |
| Update Transaction Status | ✅ |
| Pagination, Filtering, Searching, Sorting | ✅ |
| OpenAPI/Swagger Documentation | ✅ |

### Rule Engine
| Rule | Score |
|------|-------|
| High Amount (> $10,000) | +50 |
| Frequent Transactions (> 5 in 1 hour) | +30 |
| Blacklisted Country | +70 |
| High-Risk Customer | +40 |
| **Maximum Possible** | **100%** |

### Frontend Dashboard (React + TypeScript)
- ✅ Login Page with glassmorphism
- ✅ Transaction Table (search, filter, paginate)
- ✅ Customer Table (search, filter, paginate)
- ✅ Transaction Details Page (alerts, audit logs, status update)
- ✅ Customer Details Page (profile + transaction history)
- ✅ Alert List
- ✅ Responsive Mobile Design
- ✅ Loading & Error States
- ✅ Add Customer/Transaction Modals
- ✅ Delete with Confirmation

### Event Processing
- ✅ Redis Streams for event queue
- ✅ Asynchronous consumer (separate container)
- ✅ Risk score updates
- ✅ Audit log creation

### DevOps & Production Readiness
- ✅ Docker & Docker Compose
- ✅ Environment configuration (`.env`)
- ✅ Database migrations (auto-run)
- ✅ Seed data (demo customer)
- ✅ Structured logging (JSON)
- ✅ Health endpoint (`/health/`)
- ✅ Metrics endpoint (`/metrics/`)
- ✅ Database indexing
- ✅ Rate limiting
- ✅ Exception handling

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.10, Django 4.2, Django REST Framework |
| **Authentication** | JWT (SimpleJWT) |
| **Database** | PostgreSQL 14 |
| **Event Queue** | Redis 7 (Streams) |
| **Frontend** | React 18, TypeScript, Vite |
| **UI Library** | Material-UI (DataGrid) |
| **Styling** | Pure CSS (No Tailwind) |
| **Animations** | Framer Motion |
| **Containerization** | Docker, Docker Compose |
| **API Documentation** | drf-spectacular (Swagger) |
| **Testing** | Django Test Framework, pytest |

---

## 🚀 Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Git

### Quick Start (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/emmaoluga-sketch/transaction-monitor.git
cd transaction-monitor

# 2. Create environment file
cp .env.example .env

# 3. Start the application
docker compose up --build
```

### Access the app:
| Service | URL |
|---------|-----|
| Frontend (Docker) | http://localhost |
| Frontend (local dev) | http://localhost:3000 or 3001 |
| Backend API | http://localhost:8000/api/v1/ |
| API Docs (Swagger) | http://localhost:8000/api/v1/docs/ |
| Health Check | http://localhost:8000/health/ |
| Metrics | http://localhost:8000/metrics/ |

### Create Admin User
```bash
docker compose exec backend python manage.py createsuperuser
```

Follow the prompts:
- **Username:** `admin`
- **Email:** `admin@example.com`
- **Password:** `admin123`

---

## 📚 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/token/` | Obtain JWT token |
| POST | `/api/v1/token/refresh/` | Refresh JWT token |

### Customer Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customers/` | List customers (paginated) |
| POST | `/api/v1/customers/` | Create customer |
| GET | `/api/v1/customers/{id}/` | Retrieve customer |
| PUT | `/api/v1/customers/{id}/` | Update customer |
| DELETE | `/api/v1/customers/{id}/` | Delete customer |

### Transaction Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions/` | List transactions (paginated) |
| POST | `/api/v1/transactions/` | Create transaction |
| GET | `/api/v1/transactions/{id}/` | Retrieve transaction |
| PATCH | `/api/v1/transactions/{id}/status/` | Update transaction status |
| DELETE | `/api/v1/transactions/{id}/` | Delete transaction |

### Alert Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/alerts/` | List alerts (paginated) |

### Audit Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audits/` | List audit logs (paginated) |

### Filtering & Searching Examples
```bash
# Search transactions by reference or customer name
GET /api/v1/transactions/?search=john

# Filter by status
GET /api/v1/transactions/?status=COMPLETED

# Filter by transaction type
GET /api/v1/transactions/?transaction_type=DEPOSIT

# Sort by risk score (descending)
GET /api/v1/transactions/?ordering=-risk_score

# Pagination
GET /api/v1/transactions/?page=2&page_size=10

# Filter alerts by transaction
GET /api/v1/alerts/?transaction=1
```

---

## 🧪 Testing

### Run All Tests (Recommended)
```bash
docker compose exec backend python manage.py test apps.customers.tests apps.transactions.tests apps.rules.tests apps.users.tests
```

### Run Specific Test Suite
```bash
docker compose exec backend python manage.py test apps.customers.tests
docker compose exec backend python manage.py test apps.transactions.tests
docker compose exec backend python manage.py test apps.rules.tests
```

### Alternative: Use Python unittest
```bash
docker compose exec backend python -m unittest discover -s apps -p "tests.py" -v
```

### Test Coverage (Approximate)
- ✅ API Endpoints: 85%
- ✅ Rule Engine: 95%
- ✅ Authentication: 100%
- ✅ Transaction Processing: 80%

---

## 🧠 Design Decisions

| Decision | Reasoning |
|----------|-----------|
| **Redis Streams over Kafka** | Lighter weight, simpler setup, perfect for this scale |
| **Django + DRF** | Rapid development, built-in admin, robust ORM |
| **React + TypeScript** | Type safety, better maintainability, modern UI |
| **Material-UI DataGrid** | Professional tables with built-in pagination/filtering |
| **Pure CSS (No Tailwind)** | Avoided Tailwind complexity, cleaner separation |
| **Separate Consumer Container** | Decouples event processing from API for scalability |

---

## ⚖️ Trade-offs

| Trade-off | Impact |
|-----------|--------|
| **Redis vs Kafka** | Simpler setup but less durable; fine for demo |
| **Polling-based consumer** | Not real-time but sufficient for this scale |
| **Local storage for JWT** | Less secure than HttpOnly cookies but simpler |
| **No WebSocket** | Real-time updates not critical for assessment |
| **Single database** | Vertical scaling only; horizontal not supported |

---

## 📝 Assumptions

- **Single-user demo** – No multi-tenancy or complex RBAC
- **Local development only** – Not deployed to production
- **Demo data is pre-populated** – Initial customer and admin user
- **All currency in USD** – Simplified for demo
- **No external APIs** – All data is self-contained
- **Rules are static** – No dynamic rule creation via UI (but can be added to code)

---

## 📁 Project Structure

```
transaction-monitor/
├── backend/
│   ├── apps/
│   │   ├── customers/       # Customer CRUD
│   │   ├── transactions/    # Transaction CRUD + status
│   │   ├── rules/           # Rule engine
│   │   ├── alerts/          # Alert storage
│   │   ├── audits/          # Audit logs
│   │   ├── events/          # Publisher + Consumer
│   │   └── common/          # Shared utilities
│   ├── config/
│   │   ├── settings.py      # Django settings
│   │   └── urls.py          # Root URL config
│   ├── fixtures/
│   │   └── initial_data.json # Seed data
│   ├── Dockerfile
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Login
│   │   │   ├── customers/   # Customer table + details + modals
│   │   │   ├── transactions/# Transaction table + details + modals
│   │   │   └── alerts/      # Alert list
│   │   ├── context/         # Auth context
│   │   ├── App.tsx          # Main app
│   │   └── index.css        # Global styles
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Check what's using port 8000 or 3000
lsof -i :8000
# Change ports in docker-compose.yml if needed
```

**2. Database connection error**
```bash
# Ensure PostgreSQL is running
docker compose ps db
# Check logs
docker compose logs db
```

**3. Consumer not processing events**
```bash
# Check consumer logs
docker compose logs consumer
# Restart consumer
docker compose up -d consumer
```

**4. Frontend not loading styles**
```bash
# Hard refresh browser
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

**5. Transactions show 0% risk score**
```bash
# Manually process all pending transactions
docker compose exec backend python manage.py shell -c "
from transactions.models import Transaction
from rules.engine import RuleEngine
from alerts.models import Alert
from audits.models import AuditLog

for t in Transaction.objects.filter(risk_score=0):
    risk, alerts = RuleEngine.evaluate(t)
    t.risk_score = min(100, t.risk_score + risk)
    t.save()
    AuditLog.objects.create(
        transaction=t,
        action='MANUAL_PROCESSING',
        details={
            'risk_increment': risk,
            'alerts_created': [{'id': a.id, 'rule': a.rule_name} for a in alerts],
        },
        user=None,
    )
    print(f'✅ {t.reference}: Risk={t.risk_score}, Alerts={len(alerts)}')
"
```

**6. Login fails with "Invalid username or password"**
```bash
# Create a superuser
docker compose exec backend python manage.py createsuperuser
```

**7. CORS errors (frontend cannot reach backend)**

Ensure `VITE_API_URL` in `frontend/.env` is correct:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

If you're running frontend on a different port (e.g., 3001), add it to `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost",
]
```

Then restart the backend:
```bash
docker compose restart backend
```

---

## 📞 Support

For issues, questions, or contributions:
- **Email:** abayo172000@gmail.com
- **GitHub Issues:** https://github.com/emmaoluga-sketch/transaction-monitor/issues

---

## 📄 License

This project is created for assessment purposes only. All rights reserved.

---

**Built with ❤️ by Emmanuel Abayomi Oluga**

**Last Updated: July 2026**