# 🚀 Smart Project & Task Collaboration System

An enterprise-grade, real-time full-stack collaborative platform designed to streamline project tracking, task execution, and team resource allocation. Built with a component-first architecture using Next.js 15, Node/Express (TypeScript), Mongoose, Socket.IO, and Redux Toolkit.

---

## 🛠️ Architecture & Technology Stack

| Layer | Technologies & Tools | Key Role / Responsibility |
| :--- | :--- | :--- |
| **Frontend** | React 19, Next.js 15 (App Router), TailwindCSS | Responsive layout, modern aesthetics, state insulation |
| **State Management** | Redux Toolkit (RTK Query), Redux Persist | Global client caching, auto-fetching, and persisted session states |
| **Backend** | Express.js, TypeScript, Node.js | Strict-typed robust RESTful API endpoints and WebSocket gateway |
| **Database** | MongoDB, Mongoose ORM | Strict document schema verification and relational population |
| **Real-Time** | Socket.IO, Socket.IO-Client | Dynamic activity audit streaming and task comment synchronization |
| **Verification & Security** | Zod, BCrypt, JWT | Request body payload validation, pw hashing, auth guards |
| **Testing** | Jest, Supertest | Full backend API route and RBAC integration tests |

---

## 🔑 Role-Based Access Control (RBAC) Matrix

| Feature | Admin | Project Manager | Team Member |
| :--- | :---: | :---: | :---: |
| **Create / Delete Projects** | ✅ Yes | ✅ Yes | ❌ No (403 Forbidden) |
| **Edit Project Metadata** | ✅ Yes | ✅ Yes | ❌ No (403 Forbidden) |
| **Assign Tasks to Members** | ✅ Yes | ✅ Yes | ❌ No (403 Forbidden) |
| **Update Any Task Status** | ✅ Yes | ✅ Yes | ❌ No |
| **Update Assigned Task Status** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Add / Read Task Comments** | ✅ Yes | ✅ Yes | ✅ Yes |
| **View Analytics & Workloads** | ✅ Yes | ✅ Yes | ⚠️ Roster View Only |

---

## ✨ Core Features Checklist

### 🔒 1. Authentication & Security
- [x] **Secure Auth**: JWT token storage with authorization headers and bcrypt credentials security.
- [x] **Nested Auth Layout**: Unified login/signup wrapper styling with smooth glassmorphism.
- [x] **Demo Login Suite**: Single-click logins to test **Admin**, **Project Manager**, and **Member** perspectives instantly.

### 📁 2. Project & Workspace Management
- [x] **Full CRUD operations**: Create, read, update, and delete workspace projects.
- [x] **Resource Allocation**: Assign multiple workspace members to individual projects.
- [x] **Visual Indicators**: Real-time progress percentage bar, dynamic member tags, and deadline markers.

### 📅 3. Task Management & Advanced Workflow Rules
- [x] **Double-Layout Support**: Instantly toggle between **List Grid View** and **Kanban Board** with drag-and-drop status changes.
- [x] **Double-Title Prevention**: Tasks within the same project cannot share identical names.
- [x] **Anti-Past Due Validation**: Task creation or edits with past deadlines are strictly blocked.
- [x] **Task Claiming**: Team Members can quickly self-assign unallocated tasks to themselves.

### 📊 4. Interactive Insights & Analytics
- [x] **KPI Counters**: Highlight Total Projects, Active Tasks, Pending, Completed, and Overdue tasks.
- [x] **Visual Charts**: Interactive Recharts SVG engines including:
  - *Task Status Distribution* (Donut Chart)
  - *Task Count by Priority* (Bar Chart)
  - *Project Progress Trends* (Area Chart)
- [x] **Real-time Audit Logs**: Active notification feed logging user operations via Socket.IO broadcasts.

### 📎 5. Advanced Productivity Add-ons
- [x] **Custom DatePicker**: Polished custom input component replacing stock browser calendar elements.
- [x] **Native File Attachments**: Multi-format attachment uploads powered by custom Multer local disk storage.
- [x] **Dark / Light Mode**: Unified styling with auto-detect and local storage persistent dark theme.

---

## 🧩 Frontend Component-First Design

To optimize code reuse and decrease compilation overhead, the monolithic client page structures were separated into isolated state components in `src/components/`:

*   `Avatar.tsx`: Standardized initials-based profile rendering with user-centric gradients.
*   `TaskCard.tsx` / `TaskKanbanCard.tsx`: Insulates local drag-and-drop actions, status selection, and RBAC actions.
*   `ProjectCard.tsx`: Standardized card representing project metrics and completion weights.
*   `TaskModal.tsx` / `ProjectModal.tsx`: Encapsulates validation states, checklist managers, file upload nodes, and mutations.
*   `TaskDrawer.tsx`: Encapsulates Socket.IO comments subscription, separating live discussion sockets from main page loads.

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
│   │   │   └── (auth)/        # Nested Auth routes & Shared Layout
│   │   ├── components/        # Reusable Modals, Cards, Avatars, Drawers & Layouts
│   │   └── redux/             # RTK Query slices & Global Redux store
│   ├── tsconfig.json          # TS config for bundler
│   └── package.json
│
└── README.md                  # Project Documentation
```

---

## 🚀 Setup & Installation

### 💻 Prerequisites
Ensure you have **Node.js (v18+)** and a running **MongoDB** instance (local or MongoDB Atlas).

### 1. Configure the Backend
1. Navigate to `/backend`.
2. Create `.env` file matching `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/smart-collaboration
   JWT_SECRET=supersecrettokenkey123!@#
   JWT_EXPIRES_IN=7d
   ```
3. Run installation and start service:
   ```bash
   npm install
   npm run dev
   ```

### 2. Run Backend Integration Tests
Validate code business rules, models, and validations:
```bash
cd backend
npm run test
```

### 3. Configure the Frontend
1. Navigate to `/frontend`.
2. Install packages & start development client:
   ```bash
   npm install
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 👥 Preloaded Demo Credentials

Use the **Quick Sign-in** grid buttons on the login page, or manually log in using the credentials below:

| Role | Username / Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `[EMAIL_ADDRESS]` | `admin123` | Full workspace permissions |
| **Project Manager** | `[EMAIL_ADDRESS]` | `pm123` | Create and assign tasks / projects |
| **Team Member** | `[EMAIL_ADDRESS]` | `member123` | Work on assigned tasks and update status |
