# GridWatch — Secure Role-Based Authentication & Predictive Maintenance System

> **"Detect Early. Dispatch Instantly. Prevent Failures."**
> GridWatch is an industrial-grade, AI-powered predictive maintenance platform engineered to detect anomalies in electrical transformers, monitor high-voltage substation telemetry, and prevent critical equipment failures across power transmission grids.

---

## ⚡ Key Highlights & Architecture

### 1. Three Core Login Roles & Backend Role Enforcement
The login interface features **strictly three main roles**, each tied to server-side authorization:
1. **Admin** (`admin`) — System security governance, user account provisioning, role assignment, lockout mitigation, and immutable audit logs.
2. **Control Room** (`control_room`) — Interconnected grid dispatch, fleet-wide transformer health tracking, real-time AI anomaly alerts, and emergency field dispatch.
3. **Substation Team** (`substation_team`) — On-site station operations and mobile field engineering.

> **CRITICAL SECURITY REQUIREMENT:** The selected role portal is strictly verified against the authenticated user's actual database role on the server. If an account registered under *Substation Team* attempts to log in selecting the *Admin* portal, the server rejects the request with a `403 RoleMismatch` and records an audit security alert.

### 2. Field Engineer Integrated Within Substation Team
As specified in architectural requirements:
- **Field Engineer is NOT a 4th top-level role.**
- Instead, **Field Engineer** and **Station Operator** are internal job functions within the **Substation Team**:
  - `station_operator` — Diagnoses local substation bays, monitors oil/winding temperatures and dissolved gas (DGA) levels, and exercises supervisory control over high-voltage circuit breakers.
  - `field_engineer` — Responsive mobile/tablet-optimized terminal for work order dispatch tickets, step-by-step diagnostic verification checklists, sensor calibration, and anomaly resolution.

### 3. Authentication & Security Engine
- **Password Hashing:** Passwords hashed with `bcryptjs` (salt rounds: 10). Passwords are never stored in plain text.
- **Brute-Force & Lockout Protection:** Accounts are automatically locked for 15 minutes after 5 consecutive failed login attempts (`423 AccountLocked`). Administrators can manually unlock accounts at any time.
- **Session Revocation:** Signed JWTs are mapped to active database sessions in SQLite. Explicit logout revokes the session on the backend immediately.
- **Security Audit Logging:** All authentication events (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `ROLE_MISMATCH`, `ACCOUNT_LOCKED`, `LOGOUT`, `PASSWORD_RESET`) are recorded in an audit table with IP addresses, user agents, and timestamps without sensitive credentials.
- **Password Recovery Workflow:** Functional recovery workflow generating secure, time-limited reset tokens with an in-app interactive modal.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js (v18+ or v20+ / v24+)
- npm (v9+)

### Installation
```bash
# 1. Clone or navigate to the project directory
cd "Grid Hunter"

# 2. Install dependencies
npm install

# 3. Seed database with demo accounts, substations, and transformer telemetry
npm run seed

# 4. Start the application
npm start
```
The server will start at: **`http://localhost:7120`**

---

## 🔑 Pre-Configured Demo Accounts

For evaluation and demonstration convenience, the login page includes a **1-Click Quick-Fill Toolbar** with the following accounts:

| Role Portal | Username | Password | Account Holder & Function | Assigned Substation |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin.gridwatch` | `Admin@GridWatch2026!` | Elena Rostova (Chief Security Officer) | Central Governance |
| **Control Room** | `cr.operator` | `Control@GridWatch2026!` | Marcus Vance (Grid Dispatch Commander) | Grid Transmission |
| **Substation Team** | `operator.sub12` | `Station@GridWatch2026!` | Sarah Chen (**Station Operator**) | Cascade North 11A |
| **Substation Team** | `engineer.field` | `Field@GridWatch2026!` | Devon Reed (**Field Engineer**) | Cascade North 11A |
| **Substation Team** | `engineer.metro` | `Field@Metro2026!` | Amina Al-Mansoor (**Field Engineer**) | Metro Central 69kV |
| **Security Test (Locked)** | `locked.user` | `Locked@Demo2026!` | Security Demo (Locked Account) | N/A (5 Failed Attempts) |

### Testing Role Mismatch Rejection
1. Select the **Admin** portal.
2. Enter `operator.sub12` with password `Station@GridWatch2026!`.
3. Click **Authenticate Credentials**.
4. The server rejects the login with `403 RoleMismatch` and displays the exact reason: *"Access Denied: Account 'operator.sub12' is not authorized for the 'Admin' portal. Your account is registered under 'Substation Team'."*

---

## 📂 Project Structure

```
Grid Hunter/
├── server/
│   ├── config.js              # Environment settings, JWT secret, lockout limits
│   ├── server.js              # Express 5 server, middleware, static hosting, SPA routing
│   ├── test_api.js            # Automated backend security test suite
│   ├── db/
│   │   ├── database.js        # SQLite connection (WAL mode) and schema definitions
│   │   └── seed.js            # Database seeder with accounts, substations, telemetry
│   ├── middleware/
│   │   ├── auth.js            # JWT verification, requireRole, requireJobFunction
│   │   └── audit.js           # Security audit event logging
│   └── routes/
│       ├── authRoutes.js      # Login, logout, me, forgot/reset password
│       ├── adminRoutes.js     # User management, unlock account, audit trail
│       ├── controlRoomRoutes.js # Grid telemetry, anomaly alerts, FE dispatch
│       └── substationRoutes.js  # Station Operator SCADA & Field Engineer work orders
├── public/
│   ├── index.html             # HTML5 app shell with SEO tags and scripts
│   ├── assets/
│   │   └── logo.svg           # High-tech GridWatch transformer logo
│   ├── css/
│   │   ├── base.css           # Industrial dark navy palette, typography, tokens
│   │   ├── grid-effects.css   # Ambient electrical power-grid lines and scanlines
│   │   ├── login.css          # Role selector tabs, login card, alerts, demo bar
│   │   ├── dashboards.css     # Shared navbar, telemetry cards, data tables
│   │   └── components.css     # Modals, toasts, empty states
│   └── js/
│       ├── api.js             # Fetch wrapper with JWT headers and 401 handling
│       ├── auth.js            # Authentication state manager
│       ├── app.js             # Route coordinator with role-based route guards
│       ├── components/
│       │   ├── toast.js       # Toast notifications (success, error, warning, info)
│       │   └── demoBar.js     # 1-click quick-fill demo credentials bar
│       └── views/
│           ├── loginView.js   # 3-role login portal and password recovery
│           ├── adminView.js   # Admin user management & audit logs
│           ├── controlRoomView.js # Control Room telemetry & dispatch
│           ├── stationOperatorView.js # Station Operator local bay telemetry & breakers
│           └── fieldEngineerView.js # Field Engineer diagnostic protocol & checklist
├── .env                       # Environment variables
├── .env.example               # Example configuration
└── package.json               # Node.js project definitions and scripts
```

---

## 🔒 Security Best Practices Implemented
1. **Zero Client-Side Trust:** Client-side role selection is treated as an intent only; authorization is enforced via the database user record and signed JWT claims.
2. **Rate Limiting & Lockout:** Prevents credential stuffing and dictionary attacks by enforcing a 15-minute lock after 5 consecutive failed attempts.
3. **Safe Error Messages:** Unrecognized identifiers return generic error messages to prevent username harvesting.
4. **Active Session Revocation:** All active user tokens can be invalidated in the database upon password reset or account deactivation.
5. **No Production Secrets in Frontend:** API keys, database hashes, and JWT secrets reside exclusively in backend environment variables.
