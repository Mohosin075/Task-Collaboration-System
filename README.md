# 🚀 Smart Project & Task Collaboration System

An enterprise-grade, real-time full-stack **Smart Project & Task Collaboration System** built with **Next.js 15**, **Express.js (TypeScript)**, **Mongoose**, **Socket.IO**, and **Redux Toolkit (RTK Query)**. Features strict workspace permission logic, real-time activity auditing, robust data schema validations, and advanced SVG charts.

---

## 🏗️ Architecture & Technology Stack

### Backend (Express + TypeScript)
- **Runtime**: Node.js with strict TypeScript compilation.
- **Database**: MongoDB via Mongoose Object Modeling.
- **Real-Time Communication**: Socket.IO for comments and state change broadcasts.
- **Validation**: Zod Schemas for request payload validation.
- **Security**: Cryptographic salting (`bcrypt`) and JSON Web Token (`JWT`) authentication.
- **Testing**: Automated Integration Tests with `Jest` & `Supertest`.

### Frontend (Next.js 15)
- **Framework**: React 19 & Next.js 15 (App Router).
- **State Management**: Redux Toolkit (RTK Query) for API caching and Redux Persist for session caching.
- **Styling**: Modern TailwindCSS with built-in Dark/Light theme toggle persistence.
- **UI Elements**: Lucide React Icons & custom glassmorphic interfaces.
- **Charts**: Recharts SVG engine for analytics rendering.

---

## ✨ Primary Workspace Features

### 🔐 1. Strict Role-Based Access Control (RBAC)
The platform divides permissions into three distinct user roles:
- **Admin**: Full access. Can create/delete projects, manage tasks, comment, and inspect workloads.
- **Project Manager**: Workspace management. Can CRUD projects, assign tasks to members, and participate in discussion threads.
- **Team Member**: Task execution. Restricted to updating the status of tasks assigned to them and posting discussion messages. Attempts to mutate projects are blocked with a `403 Forbidden` error.

### 📅 2. Strict Task Business Validation Rules
- **Past Date Block**: Real-time checking blocks creating or editing tasks with due dates in the past.
- **Duplicate Task Prevention**: Two tasks with the identical title cannot exist simultaneously within the same project.
- **Status Freeze**: A task marked as `Completed` cannot be reassigned to other members unless its status is actively rolled back to pending.

### 📊 3. Interactive Analytical Dashboards
- **Project Completion & Progress Trends**: Area chart calculating the weight of completed tasks per project over time.
- **Priority Distribution**: Vertical bar chart highlighting workload criticality (High, Medium, Low).
- **Task Status Spread**: Interactive donut chart detailing completed vs. pending tasks.
- **Audit Feed**: Real-time scrollable logging showing recent events, backed by Socket.IO.

---

## 📂 Repository Layout

```text
├── backend/                   # Backend Application Directory
│   ├── src/
│   │   ├── app/
│   │   │   ├── config/        # Environment configurations
│   │   │   ├── errors/        # Global API Error handlers
│   │   │   ├── helpers/       # JWT & Socket.IO helpers
│   │   │   ├── middlewares/   # Auth Guard & Zod Request Validator
│   │   │   ├── modules/       # Auth, Project, Task, Comment modules
│   │   │   └── routes/        # Versioned Router mapping
│   │   ├── server.ts          # Server listener entrypoint
│   │   └── tests/             # Jest Integration test suites
│   ├── tsconfig.json          # TypeScript configurations
│   └── package.json
│
├── frontend/                  # Frontend Next.js Client
│   ├── src/
│   │   ├── app/               # Next.js App Router (pages & assets)
│   │   ├── components/        # Layout wrappers & Theme controllers
│   │   └── redux/             # RTK Query slices & Global Redux store
│   ├── tsconfig.json          # TS config for bundler
│   └── package.json
│
└── .gitignore                 # Root level ignore file
```

---

## 🚀 Setup & Installation

### 💻 Prerequisites
Ensure you have **Node.js (v18+)** and a running **MongoDB** instance (local or MongoDB Atlas).

### 1. Configure the Backend
1. Navigate to `/backend`.
2. Create `.env` from `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/smart-collaboration
   JWT_SECRET=supersecrettokenkey123!@#
   JWT_EXPIRES_IN=7d
   ```
3. Install packages & start development server:
   ```bash
   npm install
   npm run dev
   ```

### 2. Run Backend Integration Tests
```bash
cd backend
npm run test
```

### 3. Configure the Frontend
1. Navigate to `/frontend`.
2. Install packages & start Next.js application:
   ```bash
   npm install
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser. Use the **Quick Sign-in** panel to experience the platform with preloaded demo roles!
