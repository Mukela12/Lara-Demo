# LARA Deployment Guide

## What Changed

### Critical Fixes
- **React version**: Downgraded from 19.2.3 to 18.2.0 (fixes Netlify deployment)
- **Import map**: Consolidated to use React 18.2.0 consistently

### New Features
1. **Teacher Authentication**
   - Login/Signup at landing page
   - Data isolated per teacher
   - Session persistence

2. **Task Management**
   - View all tasks (not just most recent)
   - Switch between tasks
   - Task selector dropdown + dedicated "All Tasks" view

3. **Task-Specific Links**
   - Each task gets a unique 6-digit code (e.g., ABC-123)
   - Click to copy shareable link
   - Students join via: `yoursite.com?taskCode=ABC123`

4. **Multi-Teacher Support**
   - Each teacher has isolated data
   - localStorage key: `lara-teacher-{teacherId}`
   - No data leakage between teachers

## How to Deploy

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Production
```bash
npm run build
```

### 3. Deploy to Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- No environment variables required (optional: `VITE_BASE_URL`, `VITE_ANTHROPIC_API_KEY`)

## User Flows

### Teacher Flow
1. Click "Teacher Login" on landing page
2. Sign up or sign in
3. Create tasks → Get unique task codes
4. Share task codes with students
5. Review submissions and approve feedback
6. View all tasks in "All Tasks" tab
7. Switch between tasks using dropdown

### Student Flow
1. Receive task code from teacher (e.g., ABC-123)
2. Visit: `yoursite.com?taskCode=ABC123`
3. Enter name and join
4. Complete assignment
5. Submit for feedback
6. Wait for teacher approval
7. View feedback when ready

## Demo Mode
- Click "Demo Mode" to test without login
- Uses default localStorage: `lara-demo-store-v2`
- Perfect for showing the client

## Technical Notes

### Data Storage
- **Teachers**: `localStorage['lara-teachers']` (credentials)
- **Teacher data**: `localStorage['lara-teacher-{id}']` (tasks, students, submissions)
- **Task codes**: `localStorage['lara-task-codes-{teacherId}']` (code→taskId mapping)
- **Demo mode**: `localStorage['lara-demo-store-v2']`

### Task Codes
- Format: 6 alphanumeric characters (e.g., ABC123)
- Auto-generated when task is created
- Unique per teacher
- Displayed as: ABC-123 (with hyphen for readability)

### URL Parameters
- `?taskCode=ABC123` - Student joins specific task
- `?studentId=uuid` - Legacy: restore student session
- `?taskCode=ABC123&studentId=uuid` - Combined: task + session restore

## What's Working
✅ Netlify deployment (React 18 compatibility)
✅ Teacher authentication
✅ Task history and selection
✅ Task-specific sharing links
✅ Multi-teacher support
✅ Professional branding
✅ Demo mode preserved

## Next Steps for Production
1. Add backend API (optional - currently localStorage only)
2. Implement database for persistence
3. Add email/password recovery
4. Add analytics and reporting
5. Implement real-time updates (WebSockets)
