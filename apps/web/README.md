# Web Frontend (Next.js)

Modern Next.js 14 frontend for the Professional Internship Management Platform.

## 📋 Overview

This is a role-based web application connecting students, teachers, companies, and administrators in the internship management ecosystem. Each user role has specialized views and workflows tailored to their responsibilities.

## ✨ Features

- 🔐 **User Authentication** - JWT-based login/register with role-based access
- 📊 **Role-Based Dashboards** - Different interfaces for each user type
- 📝 **Practice Directory** - Browse available internship offerings
- 📋 **Application Management** - Apply for practices and track status
- 📍 **Placement Management** - Track assigned internships and supervisors
- ⏱️ **Hour Logging** - Log work hours with dual approval workflow
- 👤 **Profile Management** - View and edit user information
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Clean UI** - Minimal, intuitive design

## 👥 User Roles & Workflows

### 👨‍🎓 Student
**What they can do:**
- Browse all available practices/internship offerings
- Apply for practices they're interested in
- View their applications and their statuses
- Once approved → view their placements (assigned internships)
- Log hours worked each day
- View pending approvals on their hour logs
- Update their profile

**Dashboard shows:** Applications, placements, hour logs, profile info

### 👨‍🏫 Professor (Academic Supervisor)
**What they can do:**
- View all students and their placements
- Approve/reject student hour logs
- View hour logging statistics
- Track student progress
- Manage placement assignments

**Dashboard shows:** Student placements, pending hour log approvals, statistics

### 🏢 Company (Internship Provider)
**What they can do:**
- Create/manage internship practices (offerings)
- View applications from students
- Approve/reject applications to create placements
- Assign company supervisors to placements
- Approve/reject student hour logs
- View hour logging statistics
- Manage their practice offerings

**Dashboard shows:** Practices, applications, placements, pending hour log approvals

### 👨‍💼 Admin / Coordinator
**What they can do:**
- Full system access
- Manage all practices, applications, and placements
- Oversee all hour logs and approvals
- View comprehensive reports
- System administration tasks

**Dashboard shows:** All resources, full management capabilities

## 🔌 API Integration

All data flows through the **API Gateway** at `http://localhost:4000/api/v1/`

Connected services:
- **Auth Service** - User authentication
- **Registration Service** - Practices, applications, placements, hour logs
- **User Management Service** - User profiles and roles

## 📱 Pages & Routes

### Public Routes (No Auth Required)
- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/directory` - Browse available practices (public listing)

### Protected Routes (Auth Required)
- `/dashboard` - Role-specific main dashboard
- `/hour-logs` - Hour logging and approval interface
- `/profile` - User profile management

## 🛠️ Tech Stack

- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Fetch API
- **Auth**: JWT tokens (localStorage)

## 📦 Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- API Gateway running on `http://localhost:4000`
- All microservices running (docker compose up -d)

## 🚀 Setup & Development

### 1. Install Dependencies
```bash
pnpm install --filter web
```

### 2. Development Mode
```bash
pnpm --filter web dev
```
Open http://localhost:3000

### 3. Production Build
```bash
pnpm --filter web build
```

### 4. Start Production Server
```bash
pnpm --filter web start
```

## 🔧 Configuration

Environment variables (`.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

The API base URL is automatically prepended to all API calls.

## 📁 Project Structure

```
apps/web/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── dashboard/               # Dashboard (role-specific)
│   │   └── page.tsx
│   ├── directory/               # Practice directory
│   │   └── page.tsx
│   ├── hour-logs/               # Hour logging interface
│   │   └── page.tsx
│   └── profile/                 # User profile
│       └── page.tsx
├── lib/
│   ├── api.ts                   # API client and types
│   ├── auth.ts                  # Auth utilities
│   └── storage.ts               # Token storage
├── components/                  # Reusable components
├── styles/                      # Global styles
└── package.json

```

## 🔑 Key Features by User Type

| Feature | Student | Professor | Company | Admin |
|---------|---------|-----------|---------|-------|
| Browse Practices | ✅ | ❌ | ✅ | ✅ |
| Create Practices | ❌ | ❌ | ✅ | ✅ |
| Apply for Practice | ✅ | ❌ | ❌ | ✅ |
| Approve Applications | ❌ | ❌ | ✅ | ✅ |
| Log Hours | ✅ | ❌ | ❌ | ✅ |
| Approve Hours | ❌ | ✅ | ✅ | ✅ |
| View Analytics | ❌ | ✅ | ✅ | ✅ |
| System Admin | ❌ | ❌ | ❌ | ✅ |

## 🔐 Authentication Flow

1. User registers or logs in
2. API returns JWT token
3. Token stored in localStorage
4. Token included in Authorization header for all requests
5. Logout clears token and redirects to login

## 📝 Hour Log Workflow

```
1. Student logs hours for a placement
   ↓
2. Hour log created with status: PENDING
   ↓
3. Professor receives approval request
4. Company receives approval request
   ↓
5. Professor approves → teacherApprovedBy set
   ↓
6. Company approves → companyApprovedBy set
   ↓
7. Once both approved → Status: APPROVED
   ↓
8. Hours credited to placement total
```

## 🎯 Common Workflows

### Student Workflow
1. Register/Login → Dashboard
2. View available practices in Directory
3. Apply for practice
4. Wait for approval
5. Once approved, view Placement
6. Log hours worked
7. Track hour log approvals

### Company Workflow
1. Register/Login → Dashboard
2. Create practice/internship offering
3. View student applications
4. Approve applications (creates placements)
5. Assign professor and company supervisor
6. Approve student hour logs

### Professor Workflow
1. Login → Dashboard
2. View assigned students
3. Review student placements
4. Approve student hour logs
5. Track student progress

## 🐛 Troubleshooting

**Issue:** Cannot login
- **Solution:** Ensure API Gateway is running on port 4000

**Issue:** Pages show "loading..." indefinitely
- **Solution:** Check browser console for API errors; verify backend services are running

**Issue:** Hour logs not showing
- **Solution:** Ensure you're assigned to a placement; refresh the page

## 📚 Additional Resources

- [Main README](../../README.md) - Overall project documentation
- [Registration Service README](../registration-service/README.md) - API documentation
- [API Gateway Documentation](../api-gateway/README.md) - Gateway configuration

## 📝 License

Part of the Professional Internship Management Platform project.
