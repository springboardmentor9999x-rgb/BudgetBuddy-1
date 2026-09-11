# 💰 BudgetBuddy

> A clean, easy-to-use personal finance manager that helps you take control of your money without the complicated accounting jargon.

---

## 📌 Table of Contents

- [What is BudgetBuddy?](#-what-is-budgetbuddy)
- [Why BudgetBuddy?](#-why-budgetbuddy)
- [Key Features](#-key-features)
- [How It Works (Tech Stack)](#-how-it-works-tech-stack)
- [Project Structure](#-project-structure)
- [How to Run (Step-by-Step Guide)](#-how-to-run-step-by-step-guide)
  - [Prerequisites](#prerequisites)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [API Documentation](#-api-documentation)
- [Contributing & License](#-contributing--license)

---

## 💡 What is BudgetBuddy?

**BudgetBuddy** is a full-stack web application designed to help everyday people track, organize, and understand their personal finances.

Instead of wrestling with messy spreadsheets or deciphering complex accounting software, BudgetBuddy gives you a clear and intuitive dashboard where you can see your total income, daily expenses, savings goals, and budget limits all in one place.

---

## 🎯 Why BudgetBuddy?

Managing personal finances is often frustrating:
- **Spreadsheets get messy** and require constant manual formulas.
- **Traditional accounting tools are packed with jargon** like double-entry ledgers, reconciliation rules, and tax codes that most people don't need for everyday budgeting.
- **It is easy to lose track** of small daily expenses, recurring subscriptions, and whether you're saving enough for your future goals.

**BudgetBuddy solves this by focusing on three simple principles:**
1. **Clarity**: Immediately see where your money comes from and where it goes.
2. **Control**: Set limits on spending categories (e.g., dining, shopping) to catch overspending before it happens.
3. **Simplicity**: No confusing financial terms—just straightforward numbers, friendly charts, and clear progress bars.

---

## ✨ Key Features

- **💵 Income & Expense Tracking**: Quickly log daily earnings and expenses with custom categories, dates, and account tags.
- **🏦 Multiple Accounts**: Manage money across different accounts (e.g., Cash, Bank, Savings, Credit Card) with real-time balance tracking.
- **📊 Monthly Budgets**: Set spending limits per category and track your remaining balance with visual progress indicators.
- **🎯 Savings Goals**: Define financial milestones (e.g., Vacation Fund, Emergency Savings) and watch your progress update as you save.
- **🔁 Recurring Subscriptions**: Track recurring monthly and annual charges (streaming services, gym memberships, utilities) so you never get hit by surprise bills.
- **📈 Visual Analytics & Reports**: Interactive charts and breakdown reports to visualize your spending habits over time.
- **🔒 Secure Authentication**: Protected by secure JWT authentication with refresh tokens and HTTP-only cookies.
- **🛡️ Admin Panel**: Dedicated administration portal with system analytics, user management, and audit logs.

---

## 🛠️ How It Works (Tech Stack)

BudgetBuddy is built as a modern, decoupled web application:

### **Frontend**
- **React 19 & TypeScript**: Component-driven user interface with type safety.
- **Vite**: Ultra-fast build tool and local development server.
- **Tailwind CSS (v4)**: Modern, responsive design system.
- **Chart.js & React-Chartjs-2**: Clean, interactive data visualizations.
- **Zustand**: Fast and lightweight state management.
- **React Router**: Seamless client-side routing with protected user and admin routes.

### **Backend**
- **FastAPI (Python)**: High-performance, modern REST API with automatic interactive documentation.
- **SQLAlchemy**: Powerful Object Relational Mapper (ORM) for database interactions.
- **PostgreSQL**: Reliable relational database storing users, transactions, budgets, and goals.
- **Alembic**: Database migrations management.
- **Passlib & Python-Jose**: Secure password hashing (bcrypt) and JWT token generation.
- **WebSockets**: Real-time notifications and live updates.

---

## 📂 Project Structure

```text
BudgetBuddy-1/
├── backend/                  # FastAPI Python backend
│   ├── alembic/              # Database migration scripts
│   ├── app/
│   │   ├── configs/          # Environment & app configuration
│   │   ├── crud/             # Database queries and data access layer
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── routers/          # API route handlers (auth, expenses, budgets, etc.)
│   │   ├── schemas/          # Pydantic schemas (data validation)
│   │   ├── services/         # Business logic and helper services
│   │   ├── database.py       # Database connection setup
│   │   └── main.py           # FastAPI application entry point
│   ├── tests/                # Automated backend test suite
│   ├── requirements.txt      # Python dependencies
│   └── pyproject.toml        # Project metadata & dependencies (uv/pip)
│
├── frontend/                 # React + TypeScript + Vite frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── api/              # Axios HTTP client configuration
│   │   ├── components/       # Shared UI components
│   │   ├── features/         # Feature-based pages (dashboard, income, expense, etc.)
│   │   ├── routes/           # Protected & admin route guards
│   │   ├── App.tsx           # Root React component
│   │   ├── Routes.tsx        # Application routing definitions
│   │   └── main.tsx          # Frontend entry point
│   └── package.json          # Node dependencies and scripts
│
└── README.md                 # Project documentation
```

---

## 🚀 How to Run (Step-by-Step Guide)

Follow these instructions to set up and run BudgetBuddy locally on your machine.

### Prerequisites

Make sure you have the following installed:
- **Python** (version 3.11 or higher)
- **Node.js** (version 18 or higher) or **Bun**
- **PostgreSQL** database server installed and running

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/BudgetBuddy-1.git
cd BudgetBuddy-1
```

---

### 2. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**

   *Using standard Python:*
   ```bash
   python -m venv .venv
   source .venv/bin/activate      # On Linux / macOS
   # .venv\Scripts\activate       # On Windows (Command Prompt / PowerShell)
   ```

   *Or using `uv` (recommended):*
   ```bash
   uv sync
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Copy the provided `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your details (especially your PostgreSQL database connection URL and JWT secret keys):
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/budgetbuddy
   ALGORITHM=HS256
   SECRET_KEY=your_random_secret_key_here
   REFRESH_TOKEN_SECRET_KEY=your_random_refresh_secret_key_here
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ```

5. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will start at: `http://localhost:8000`

---

### 3. Frontend Setup

1. **Open a new terminal window and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   # or if using bun:
   # bun install
   ```

3. **Configure environment variables (optional):**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *(By default, it connects to `http://localhost:8000/api/v1`)*

4. **Start the development server:**
   ```bash
   npm run dev
   # or if using bun:
   # bun dev
   ```

5. **Open BudgetBuddy in your browser:**
   Navigate to: **`http://localhost:5173`**

---

## 📖 API Documentation

FastAPI automatically generates interactive API documentation for BudgetBuddy:

- **Swagger UI (Interactive)**: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- **ReDoc UI (Alternative)**: [`http://localhost:8000/redoc`](http://localhost:8000/redoc)

You can use the Swagger UI to explore endpoints, inspect request and response schemas, and test API calls directly in your browser.

---

## 🧪 Running Tests

To run the backend test suite:

```bash
cd backend
pytest
```

---

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m "Add some AmazingFeature"`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is created for educational and personal finance tracking purposes under the **Infosys Springboard** initiative.
