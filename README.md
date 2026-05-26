<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-6366f1?style=for-the-badge" alt="MERN Stack"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
</p>

# Nexus Finance

A modern, full-stack **personal finance dashboard** built on the MERN stack. Track income, manage expenses, set budgets, and visualize your financial journey — all in one place.


---

## Features

| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure dual-token system (access + refresh) with automatic token rotation |
| **Analytics Dashboard** | Real-time charts — 6-month income/expense trend (Line) and category breakdown (Doughnut) |
| **Transaction Management** | Full CRUD with filtering by type and category, sortable date-ordered table |
| **Budget Tracking** | Set monthly spending limits per category with color-coded progress bars |
| **Multi-Currency** | Support for 7 currencies (INR, USD, EUR, GBP, JPY, CAD, AUD) with live preview |
| **Dark / Light Mode** | Seamless theme switching with localStorage persistence |
| **Fully Responsive** | Mobile-first design with collapsible sidebar navigation |
| **Security** | Helmet headers, CORS, bcrypt hashing, rate limiting, input validation |
| **Auto Token Refresh** | Axios interceptors transparently refresh expired tokens without user interruption |
| **Savings Rate** | Automatically calculated monthly savings percentage |

---


## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI library with functional components and hooks |
| **Vite 7** | Lightning-fast build tool with HMR |
| **React Router 7** | Client-side SPA routing |
| **Axios** | HTTP client with request/response interceptors |
| **Bootstrap 5 + React-Bootstrap** | Responsive grid, forms, modals, tables |
| **Chart.js + react-chartjs-2** | Line and Doughnut data visualizations |
| **react-icons** | SVG icon library (Feather + Material Design) |
| **react-toastify** | Toast notification system |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework with async route handlers |
| **Mongoose 9** | MongoDB ODM with schema validation |
| **JWT (jsonwebtoken)** | Dual-token authentication |
| **bcryptjs** | Password hashing (12-round salt) |
| **Helmet** | Security HTTP headers |
| **CORS** | Cross-origin request filtering |
| **dotenv** | Environment variable management |

### Database & Hosting
| Technology | Purpose |
|-----------|---------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Cloudflare Pages** | Frontend hosting with global CDN |
| **Render** | Backend API hosting |

---

## Project Structure

```
Nexus Finance/
├── nexus-finance-client/          # React Frontend (Vite)
│   ├── index.html                 # Single HTML entry point
│   ├── vite.config.js             # Vite configuration
│   ├── package.json               # Frontend dependencies
│   └── src/
│       ├── main.jsx               # React DOM mounting
│       ├── App.jsx                # Routing & provider hierarchy
│       ├── index.css              # Complete design system (884 lines)
│       ├── api/
│       │   └── axios.js           # HTTP client with auto-refresh
│       ├── context/
│       │   ├── AuthContext.jsx    # Auth state management
│       │   └── ThemeContext.jsx   # Dark/light theme state
│       ├── components/
│       │   ├── AppLayout.jsx     # Sidebar + content layout
│       │   ├── PrivateRoute.jsx  # Authentication guard
│       │   └── Sidebar.jsx       # Navigation sidebar
│       └── pages/
│           ├── Dashboard.jsx     # Analytics overview
│           ├── Transactions.jsx  # Transaction CRUD
│           ├── Budgets.jsx       # Budget tracking
│           ├── Login.jsx         # Login form
│           ├── Register.jsx      # Registration form
│           └── Settings.jsx      # Profile & currency settings
│
├── nexus-finance-server/          # Express Backend (Node.js)
│   ├── index.js                   # Server entry point
│   ├── package.json               # Backend dependencies
│   ├── .env                       # Environment variables (not in repo)
│   ├── models/
│   │   ├── User.js               # User schema with password hashing
│   │   ├── Transaction.js        # Transaction schema with indexes
│   │   ├── Budget.js             # Budget schema with unique constraint
│   │   └── Category.js           # Category metadata schema
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (register/login/refresh/logout)
│   │   ├── transactionController.js  # CRUD + aggregation analytics
│   │   └── budgetController.js   # Budget CRUD with spending calculation
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── transactionRoutes.js  # /api/transactions/*
│   │   └── budgetRoutes.js       # /api/budgets/*
│   └── middleware/
│       └── authMiddleware.js     # JWT verification middleware
│            
└── README.md                      # This file
```

---

## Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **bun** package manager
- **MongoDB Atlas** account (or local MongoDB instance)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/nexus-finance.git
cd nexus-finance
```

### 2. Set up the backend
```bash
cd nexus-finance-server
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### 3. Set up the frontend
```bash
cd ../nexus-finance-client
npm install
npm run dev
```

### 4. Open the app
Navigate to `http://localhost:5173` in your browser.

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Create new account |
| POST | `/login` | ❌ | Sign in, receive tokens |
| POST | `/refresh` | ❌ | Refresh access token |
| GET | `/profile` | ✅ | Get user profile |
| PUT | `/profile` | ✅ | Update name/currency |
| POST | `/logout` | ✅ | Invalidate refresh token |

### Transactions (`/api/transactions`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | List (filterable, paginated) |
| POST | `/` | ✅ | Create transaction |
| PUT | `/:id` | ✅ | Update transaction |
| DELETE | `/:id` | ✅ | Delete transaction |
| GET | `/stats` | ✅ | Analytics & aggregations |

### Budgets (`/api/budgets`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | List with spending data |
| POST | `/` | ✅ | Create budget |
| PUT | `/:id` | ✅ | Update budget |
| DELETE | `/:id` | ✅ | Delete budget |

---

## Security

- **Password Hashing** — bcrypt with 12-round salt (plaintext never stored)
- **JWT Dual Tokens** — Short-lived access (15 min) + long-lived refresh (7 days) with rotation
- **Helmet** — Sets Content-Security-Policy, X-Frame-Options, and other security headers
- **CORS** — Restricts API access to authorized frontend origin only
- **Input Validation** — Mongoose schema enforcement + custom validators
- **Sensitive Field Protection** — `select: false` on password and refresh token fields

---

## License

This project was built for educational purposes as part of a Fullstack Web Development course.

---

<p align="center">
  Built using the MERN Stack
</p>
