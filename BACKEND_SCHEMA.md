# LARA Backend Architecture & Database Schema

This document outlines the planned backend architecture for the Learning Assessment & Response Assistant (LARA). The system is designed to be scalable, secure, and supportive of real-time formative feedback loops.

## System Overview

- **Runtime:** Node.js (v20+)
- **Framework:** NestJS or Express with TypeScript
- **Database:** PostgreSQL (v15+)
- **ORM:** Prisma ORM
- **Real-time:** Socket.io (for live teacher dashboard updates)
- **AI Integration:** Google Gemini API (via Google GenAI SDK)
- **Authentication:** OAuth 2.0 (Google/Microsoft integration for schools)

---

## Database Schema (ERD Draft)

The schema focuses on the relationship between **Tasks**, **Students**, and the **Feedback Loop**.

### 1. User Management
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  role          UserRole  @default(STUDENT) // TEACHER, STUDENT, ADMIN
  firstName     String
  lastName      String
  schoolId      String
  createdAt     DateTime  @default(now())
  
  // Relations
  classes       Class[]
  submissions   Submission[]
}

enum UserRole {
  STUDENT
  TEACHER
  ADMIN
}
```

### 2. Classroom & Tasks
```prisma
model Class {
  id            String    @id @default(uuid())
  name          String
  teacherId     String
  joinCode      String    @unique
  
  // Relations
  teacher       User      @relation(fields: [teacherId], references: [id])
  students      User[]    // Many-to-many managed via join table
  tasks         Task[]
}

model Task {
  id            String    @id @default(uuid())
  classId       String
  title         String
  prompt        String    @db.Text
  
  // Configuration
  universalExpectations Boolean @default(true)
  successCriteria       String[] // JSON array of criteria strings
  
  createdAt     DateTime  @default(now())
  
  // Relations
  class         Class     @relation(fields: [classId], references: [id])
  submissions   Submission[]
}
```

### 3. Submission & Feedback Loop (The Core)
```prisma
model Submission {
  id            String    @id @default(uuid())
  taskId        String
  studentId     String
  content       String    @db.Text
  version       Int       @default(1)
  status        Status    @default(SUBMITTED)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  task          Task      @relation(fields: [taskId], references: [id])
  student       User      @relation(fields: [studentId], references: [id])
  feedback      FeedbackSession?
}

enum Status {
  DRAFT
  SUBMITTED
  PROCESSING
  FEEDBACK_READY
  REVISING
  COMPLETED
}
```

### 4. Feedback Structure
```prisma
model FeedbackSession {
  id            String    @id @default(uuid())
  submissionId  String    @unique
  
  // The 'Goal' context for this specific feedback
  goalText      String
  
  createdAt     DateTime  @default(now())
  
  // Relations
  submission    Submission @relation(fields: [submissionId], references: [id])
  strengths     FeedbackItem[]
  growthAreas   FeedbackItem[]
  nextSteps     NextStep[]
}

model FeedbackItem {
  id                String        @id @default(uuid())
  sessionId         String
  category          Category      // STRENGTH or GROWTH
  type              FeedbackType  // TASK, PROCESS, SELF_REG
  text              String
  anchors           String[]      // Text quotes from submission
  
  // Relations
  session           FeedbackSession @relation(fields: [sessionId], references: [id])
}

model NextStep {
  id                String    @id @default(uuid())
  sessionId         String
  
  actionVerb        String
  target            String
  successIndicator  String
  ctaText           String
  actionType        ActionType
  
  selectedAt        DateTime? // If null, not selected by student
  completedAt       DateTime?
  
  // Relations
  session           FeedbackSession @relation(fields: [sessionId], references: [id])
}

enum Category {
  STRENGTH
  GROWTH
}

enum FeedbackType {
  TASK
  PROCESS
  SELF_REG
}

enum ActionType {
  REVISE
  IMPROVE_SECTION
  REUPLOAD
  REHEARSE
}
```

---

## API Architecture

### Key Endpoints

#### **POST /api/submissions**
- **Payload:** `{ taskId, content }`
- **Action:** Saves student text, triggers async AI processing job via Redis/BullMQ.
- **Response:** `{ submissionId, status: 'PROCESSING' }`

#### **GET /api/submissions/:id/feedback**
- **Action:** Polling endpoint or WebSocket subscription.
- **Response:** Full `FeedbackSession` object once AI processing is complete.

#### **PATCH /api/feedback/select-step**
- **Payload:** `{ nextStepId }`
- **Action:** Locks in the student's choice, updates teacher dashboard in real-time.

#### **GET /api/teacher/dashboard/:taskId**
- **Action:** Aggregates all student statuses and next step selections for visualization.
- **Optimization:** Uses materialized views or cached counters for high-performance class insights.

---

## AI Processing Pipeline

1.  **Ingestion:** Student submits text.
2.  **Queue:** Job added to 'feedback-generation' queue.
3.  **Worker:**
    *   Fetches Task Context (Success Criteria).
    *   Calls Google Gemini Pro 1.5.
    *   **System Prompt:** Structured to output JSON adhering to `FeedbackSession` schema.
    *   **Validation:** Zod schema validation on AI output.
4.  **Storage:** Parsed JSON stored in PostgreSQL.
5.  **Notification:** Webhook/Socket event sent to client.
