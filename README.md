# 🚀 LeetLab: Premium Competitive Coding Platform


"""

tumhe meine reflab ka ek folder provide kiya hai jaha frontend ka component implemented hia backend ke sath api call krkre data render kr rha ,like for admin create problem , problem page , contest create contest manage , and etc aur jo component nahi banaye hai tumne frontend me wo sare bana ke backend ke sath integrate kro sara chij aur jo jo admin ko ek code leetcode jaise website ko manage krne ke liye cahiye wo sara chij implement kro sara chij dynamic ho koi bhi static na ho sab kuch backend ke sath wired ho data fetch krke render krne ke liye and make sure theme aur sytle sara frontend ke hisab se ho 

"""

![LeetLab](https://img.shields.io/badge/LeetLab-v1.0-blueviolet)
![React](https://img.shields.io/badge/React-19-blue)
![Express](https://img.shields.io/badge/Express-5.1-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791)
![License](https://img.shields.io/badge/License-MIT-green)

**LeetLab** is a modern, high-performance competitive coding platform that enables developers to create, solve, and discuss complex algorithmic problems. Featuring a premium glassmorphism UI, real-time code execution, activity tracking, and community engagement tools.

**Live Demo**: [Coming Soon] | **Documentation**: [Wiki](docs/) | **Report Bug**: [Issues](../../issues)

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-detailed-database-schema)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Frontend Components](#-frontend-components)
- [Setup Instructions](#-setup-instructions)
- [Design Philosophy](#-design-philosophy)
- [Contributing](#-contributing)

---

## ⭐ Key Features

### 🧠 Advanced Problem Solving
- **Split-Pane Editor**: Monaco editor with full-screen coding environment
- **Real-time Test Validation**: Instant feedback on test case execution
- **Multiple Language Support**: Python, JavaScript, Java, C++, C, Go, Ruby, PHP
- **Reference Solutions**: Community and editorial solutions with syntax highlighting

### ⚡ Code Execution
- **Judge0 Integration**: Sandboxed remote code execution
- **Performance Metrics**: Memory usage, execution time tracking
- **Detailed Test Results**: Per-test-case stdout, stderr, compilation output
- **Code Snippets**: Language-specific boilerplate templates for each problem

### 📊 Analytics & Tracking
- **Activity Heatmap**: Year-long heatmap with historical filtering
- **Streak System**: Current and longest problem-solving streaks
- **Progress Analytics**: Difficulty-wise and topic-wise problem breakdown
- **Submission History**: Complete audit trail of all attempts with metadata

### 🎯 Competitive Contests
- **Contest Management**: Create, schedule, and run contests
- **Live Leaderboards**: Real-time standings with rating calculations
- **Participant Tracking**: Registration and performance analytics
- **Rating System**: Elo-based rating with contest multipliers

### 📚 Community Features
- **Problem Discussions**: Per-problem forums for hints and editorials
- **Comment Threading**: Hierarchical discussions with upvote system
- **AI Code Review**: Automated code analysis and optimization suggestions
- **Dynamic Playlists**: Curated problem sets for interview prep and learning

### 👤 User Profiles
- **Rich Profiles**: Bio, social links (GitHub, LinkedIn), skills, location
- **Achievement Badges**: Streak milestones, problem-solving achievements
- **Public Profiles**: Shareable profile URLs with anonymized stats option
- **Network Discovery**: Find and follow other developers

---

## 🛠 Tech Stack

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18 + TypeScript | Component-based UI with type safety |
| **Routing** | React Router v7 | Client-side page navigation |
| **Styling** | Tailwind CSS 4 | Utility-first responsive design |
| **Components** | Shadcn/UI + Radix UI | Accessible, composable UI primitives |
| **Editor** | Monaco Editor | Professional code editing experience |
| **Charts** | Recharts | Data visualization (heatmap, analytics) |
| **Forms** | React Hook Form | Efficient form state management |
| **State** | Zustand + Context API | Global & local state management |
| **Icons** | Lucide React | 500+ SVG icons library |
| **Animations** | Framer Motion | Smooth transitions and micro-interactions |
| **Notifications** | Sonner | Toast notifications |
| **Build** | Vite | Lightning-fast dev server & HMR |

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript server environment |
| **Framework** | Express.js 5.1 | REST API server |
| **Language** | JavaScript (ES Modules) | Dynamic typing for rapid development |
| **ORM** | Prisma 7.8 | Type-safe database queries |
| **Database** | PostgreSQL 15+ | Relational database |
| **Auth** | JWT + HttpOnly Cookies | Secure stateless authentication |
| **Password Security** | bcryptjs | Password hashing with salt rounds |
| **External API** | Judge0 | Remote code execution service |
| **HTTP Client** | Axios | API requests to Judge0 |
| **Middleware** | CORS, Cookie-Parser | Request handling |
| **Environment** | dotenv | Configuration management |

### Infrastructure & DevOps
| Component | Tech | Purpose |
|-----------|------|---------|
| **Database** | PostgreSQL | Data persistence |
| **Code Execution** | Judge0 API | Sandboxed compilation & execution |
| **API Version** | REST (v1) | Versioned API for backwards compatibility |
| **Session** | HttpOnly Cookies | Secure credential storage |
| **Development** | Nodemon | Auto-reload on file changes |

---

## 🏗 System Architecture

### 1️⃣ Complete System Architecture Diagram

```mermaid
graph TB
    subgraph Frontend ["🎨 FRONTEND (React + Vite)"]
        Components["📦 Components<br/>(Problems, Editor)"]
        Routing["🔀 React Router"]
        State["🎯 State Management<br/>(Zustand + Context)"]
        UI["🖼️ UI System<br/>(Shadcn/UI)"]
        Editor["✏️ Monaco Editor"]
    end

    subgraph APIClient ["🌐 API Client Layer"]
        Fetch["Fetch API"]
        Cache["Response Cache"]
        Auth["Auth Handler"]
    end

    subgraph Backend ["⚙️ BACKEND (Express + Node.js)"]
        subgraph Routes ["Routes Layer"]
            AuthR["🔐 auth.routes"]
            ProblemR["📝 problem.routes"]
            SubR["📤 submission.routes"]
            CodeR["💻 execute-code"]
            DiscR["💬 discussion"]
            PlaylistR["🎵 playlist"]
            ContestR["🏆 contests"]
            LeaderR["🏅 leaderboard"]
        end

        subgraph Controllers ["Controllers Layer"]
            AuthC["auth.controller"]
            ProblemC["problem.controller"]
            SubC["submission.controller"]
            CodeC["execute-code.controller"]
        end

        subgraph Libs ["Library Layer"]
            DB["🗄️ db.js<br/>(Prisma ORM)"]
            Judge0Lib["⚖️ judge0.lib.js"]
            ActivityLib["📊 activity.lib.js"]
            AuthMW["🔒 auth.middleware"]
        end
    end

    subgraph External ["🔌 EXTERNAL SERVICES"]
        Postgres[("🗄️ PostgreSQL<br/>Database")]
        Judge0["⚖️ Judge0 API<br/>(Code Execution)"]
    end

    Components --> Routing
    Routing --> State
    State --> Editor
    
    Components --> Fetch
    Fetch --> Cache
    Cache --> Auth
    
    Auth -->|HTTP| AuthR
    Auth -->|HTTP| ProblemR
    Auth -->|HTTP| SubR
    Auth -->|HTTP| CodeR
    Auth -->|HTTP| DiscR
    Auth -->|HTTP| PlaylistR
    
    AuthR --> AuthMW
    AuthMW --> AuthC
    ProblemR --> AuthMW
    AuthMW --> ProblemC
    SubR --> AuthMW
    AuthMW --> SubC
    CodeR --> AuthMW
    AuthMW --> CodeC
    
    AuthC --> DB
    ProblemC --> DB
    SubC --> DB
    CodeC --> Judge0Lib
    Judge0Lib --> Judge0
    
    DB --> Postgres
    Judge0 -->|Results| Judge0Lib
    Judge0Lib --> ActivityLib
    ActivityLib --> DB

    style Frontend fill:#1e40af,stroke:#0284c7,color:#fff,stroke-width:3px
    style Backend fill:#15803d,stroke:#16a34a,color:#fff,stroke-width:3px
    style External fill:#7c2d12,stroke:#ea580c,color:#fff,stroke-width:3px
    style APIClient fill:#6b21a8,stroke:#9333ea,color:#fff,stroke-width:3px
```

### 2️⃣ Code Submission Flow (User Journey)

```mermaid
sequenceDiagram
    participant User as 👤 User (Browser)
    participant Frontend as 🎨 React App
    participant API as 🌐 API Client
    participant Backend as ⚙️ Express Backend
    participant Judge0 as ⚖️ Judge0 Service
    participant Database as 🗄️ PostgreSQL

    User->>Frontend: Clicks "Submit" button
    Note over Frontend: Validates code
    Frontend->>API: POST /api/v1/submissions
    Note over API: Adds JWT auth cookie
    
    API->>Backend: HTTP Request (with auth)
    Backend->>Backend: Verify JWT token
    Backend->>Backend: Validate input
    Backend->>Database: Create Submission record
    Database-->>Backend: Return submission ID
    
    Backend->>Judge0: POST batch submission
    Note over Judge0: Queue for compilation
    Judge0->>Judge0: Compile code
    Judge0->>Judge0: Run all test cases
    Judge0-->>Backend: Return token
    
    Backend->>Judge0: Poll results (token)
    Judge0-->>Backend: Return all results
    
    Backend->>Database: Create TestCaseResult entries
    Backend->>Database: Update ProblemSolved (if accepted)
    Backend->>Database: Update UserActivity (heatmap)
    Backend->>Database: Update streak counters
    
    Backend-->>API: JSON response
    API-->>Frontend: Update state
    Frontend->>Frontend: Render results
    Frontend-->>User: Show "Accepted ✓" or error
    User->>Frontend: Check heatmap (updated)
```

### 3️⃣ User Authentication Flow

```mermaid
graph LR
    A["👤 User<br/>Login Page"] -->|Email/Password| B["🔐 POST /auth/login"]
    B --> C{"✓ Valid<br/>Credentials?"}
    C -->|No| D["❌ Error Response"]
    D --> A
    
    C -->|Yes| E["🔒 Hash comparison<br/>bcryptjs"]
    E --> F["🔑 JWT Sign<br/>7 day expiry"]
    F --> G["🍪 HttpOnly Cookie<br/>Set-Cookie header"]
    G --> H["✅ Auth Success<br/>User object"]
    H --> I["🎨 Frontend<br/>Zustand store"]
    I --> J["🏠 Dashboard<br/>Authenticated"]
    
    J -->|Make API call| K["🔐 Fetch with credentials"]
    K -->|Cookie auto-sent| L["⚙️ Backend"]
    L --> M["🔒 auth.middleware<br/>Verify JWT"]
    M --> N{"🔑 Valid<br/>Token?"}
    N -->|No| O["❌ 401 Unauthorized"]
    N -->|Yes| P["✅ Attach user to req"]
    P --> Q["📝 Controller/Logic"]
    
    style A fill:#1e40af,stroke:#0284c7,color:#fff
    style B fill:#15803d,stroke:#16a34a,color:#fff
    style E fill:#7c2d12,stroke:#ea580c,color:#fff
    style F fill:#6b21a8,stroke:#9333ea,color:#fff
    style J fill:#1e40af,stroke:#0284c7,color:#fff
```

---

## 📊 Detailed Database Schema

### 📋 Complete Entity-Relationship Diagram (ER Model)

```mermaid
erDiagram
    USER ||--o{ PROBLEM : creates
    USER ||--o{ SUBMISSION : makes
    USER ||--o{ PROBLEM_SOLVED : achieves
    USER ||--o{ PLAYLIST : owns
    USER ||--o{ DISCUSSION : posts
    USER ||--o{ COMMENT : writes
    USER ||--o{ USER_ACTIVITY : tracks
    USER ||--o{ CONTEST : creates
    USER ||--o{ CONTEST_PARTICIPANT : joins
    
    PROBLEM ||--o{ SUBMISSION : "has many"
    PROBLEM ||--o{ PROBLEM_SOLVED : "solved by"
    PROBLEM ||--o{ DISCUSSION : "discussed in"
    PROBLEM ||--o{ PROBLEM_IN_PLAYLIST : "added to"
    PROBLEM ||--o{ CONTEST_PROBLEM : "in contests"
    
    SUBMISSION ||--o{ TEST_CASE_RESULT : "has results"
    
    PLAYLIST ||--o{ PROBLEM_IN_PLAYLIST : "contains"
    
    DISCUSSION ||--o{ COMMENT : "has comments"
    
    CONTEST ||--o{ CONTEST_PROBLEM : "has problems"
    CONTEST ||--o{ CONTEST_PARTICIPANT : "has participants"

    USER : uuid id PK
    USER : string name
    USER : string email UK
    USER : string password
    USER : enum role
    USER : string bio
    USER : string location
    USER : string github
    USER : int currentStreak
    USER : int longestStreak
    USER : datetime createdAt

    PROBLEM : uuid id PK
    PROBLEM : string title
    PROBLEM : string description
    PROBLEM : enum difficulty
    PROBLEM : string[] tags
    PROBLEM : json examples
    PROBLEM : string constraints
    PROBLEM : json testcases
    PROBLEM : json codeSnippets
    PROBLEM : uuid userId FK

    SUBMISSION : uuid id PK
    SUBMISSION : uuid userId FK
    SUBMISSION : uuid problemId FK
    SUBMISSION : string language
    SUBMISSION : string status
    SUBMISSION : string memory
    SUBMISSION : string time

    TEST_CASE_RESULT : uuid id PK
    TEST_CASE_RESULT : uuid submissionId FK
    TEST_CASE_RESULT : int testCase
    TEST_CASE_RESULT : boolean passed
    TEST_CASE_RESULT : string status

    PROBLEM_SOLVED : uuid id PK
    PROBLEM_SOLVED : uuid userId FK
    PROBLEM_SOLVED : uuid problemId FK
    PROBLEM_SOLVED : datetime createdAt

    PLAYLIST : uuid id PK
    PLAYLIST : string name
    PLAYLIST : string description
    PLAYLIST : uuid userId FK

    PROBLEM_IN_PLAYLIST : uuid id PK
    PROBLEM_IN_PLAYLIST : uuid playlistId FK
    PROBLEM_IN_PLAYLIST : uuid problemId FK

    DISCUSSION : uuid id PK
    DISCUSSION : string title
    DISCUSSION : string content
    DISCUSSION : int upvotes
    DISCUSSION : uuid userId FK
    DISCUSSION : uuid problemId FK

    COMMENT : uuid id PK
    COMMENT : string content
    COMMENT : uuid userId FK
    COMMENT : uuid discussionId FK

    CONTEST : uuid id PK
    CONTEST : string slug UK
    CONTEST : string name
    CONTEST : string status
    CONTEST : datetime startTime
    CONTEST : datetime endTime
    CONTEST : uuid createdById FK

    CONTEST_PROBLEM : uuid id PK
    CONTEST_PROBLEM : uuid contestId FK
    CONTEST_PROBLEM : uuid problemId FK
    CONTEST_PROBLEM : string label

    CONTEST_PARTICIPANT : uuid id PK
    CONTEST_PARTICIPANT : uuid contestId FK
    CONTEST_PARTICIPANT : uuid userId FK

    USER_ACTIVITY : uuid id PK
    USER_ACTIVITY : uuid userId FK
    USER_ACTIVITY : string dateKey UK
    USER_ACTIVITY : int count
    USER_ACTIVITY : datetime createdAt
```

### 🔗 Detailed Model Relationships Map

```mermaid
graph TB
    subgraph CoreModels["🎯 Core Models"]
        User["👤 User<br/>(Identity & Auth)<br/>18 fields"]
        Problem["📝 Problem<br/>(Problem Definitions)<br/>15 fields"]
        Submission["📤 Submission<br/>(Code Attempts)<br/>12 fields"]
    end

    subgraph TestingModels["🧪 Testing & Results"]
        TestCase["✅ TestCaseResult<br/>(Per-Test Tracking)<br/>10 fields"]
    end

    subgraph TrackingModels["📊 Tracking & Analytics"]
        ProblemSolved["🏆 ProblemSolved<br/>(Achievement Log)<br/>4 fields"]
        UserActivity["📈 UserActivity<br/>(Heatmap Data)<br/>6 fields"]
    end

    subgraph CommunityModels["💬 Community Features"]
        Playlist["🎵 Playlist<br/>(Problem Collections)<br/>5 fields"]
        ProblemInPlaylist["📋 ProblemInPlaylist<br/>(Junction Table)<br/>4 fields"]
        Discussion["💭 Discussion<br/>(Forum Threads)<br/>7 fields"]
        Comment["💬 Comment<br/>(Thread Replies)<br/>5 fields"]
    end

    subgraph ContestModels["🏆 Contests"]
        Contest["🎯 Contest<br/>(Event Management)<br/>11 fields"]
        ContestProblem["📝 ContestProblem<br/>(Problems in Contest)<br/>5 fields"]
        ContestParticipant["👥 ContestParticipant<br/>(Registration Log)<br/>4 fields"]
    end

    User -->|creates| Problem
    User -->|makes| Submission
    User -->|achieves| ProblemSolved
    User -->|owns| Playlist
    User -->|posts| Discussion
    User -->|writes| Comment
    User -->|tracks| UserActivity
    User -->|creates| Contest
    User -->|joins| ContestParticipant

    Problem -->|has many| Submission
    Problem -->|solved by| ProblemSolved
    Problem -->|discussed in| Discussion
    Problem -->|added to| ProblemInPlaylist
    Problem -->|in contests| ContestProblem

    Submission -->|has results| TestCase
    Submission -->|triggers| UserActivity
    Submission -->|marks if success| ProblemSolved

    Playlist -->|contains| ProblemInPlaylist
    ProblemInPlaylist -->|references| Problem

    Discussion -->|has comments| Comment
    
    Contest -->|has problems| ContestProblem
    Contest -->|has participants| ContestParticipant
    ContestProblem -->|references| Problem
    ContestParticipant -->|references| User

    style User fill:#1e40af,stroke:#0284c7,color:#fff,stroke-width:3px
    style Problem fill:#15803d,stroke:#16a34a,color:#fff,stroke-width:3px
    style Submission fill:#7c2d12,stroke:#ea580c,color:#fff,stroke-width:3px
    style TestCase fill:#6b21a8,stroke:#9333ea,color:#fff,stroke-width:2px
    style Contest fill:#dc2626,stroke:#ef4444,color:#fff,stroke-width:2px
```

### Core Models Detailed

#### **1. User Model**
Purpose: Store user identity, authentication, and profile information.

```prisma
model User {
  id                 String              @id @default(uuid())
  name               String?
  email              String              @unique
  image              String?
  role               UserRole            @default(USER)      // ADMIN or USER
  password           String              // bcrypt hashed
  bio                String?             // Profile bio
  location           String?             // City, Country
  github             String?             // GitHub username
  linkedin           String?             // LinkedIn username
  website            String?             // Personal website URL
  skills             String[]            // Array of skill tags
  currentStreak      Int                 @default(0)
  lastSolvedDate     String?             // ISO date of last solve
  longestStreak      Int                 @default(0)
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  // Relations (1-to-Many)
  Problem            Problem[]           // Problems created by user
  Submission         Submission[]        // Code submissions
  ProblemSolved      ProblemSolved[]     // Problems they solved
  Playlist           Playlist[]          // Playlists created
  Discussion         Discussion[]        // Discussion posts
  Comment            Comment[]           // Comments on discussions
  activities         UserActivity[]      // Daily activity tracking
  createdContests    Contest[]           // Contests created
  contestParticipations ContestParticipant[]
}
```

**Key Features**:
- Email uniqueness ensures no duplicate accounts
- Password stored as bcrypt hash (never plain text)
- Streak tracking for gamification
- Profile enrichment with social links
- Skills array for discovery and matching

---

#### **2. Problem Model**
Purpose: Store algorithmic problem definitions and test cases.

```prisma
model Problem {
  id                  String              @id @default(uuid())
  title               String              // Problem title (e.g., "Two Sum")
  description         String              // Full problem statement
  defficulty          defficulty          // EASY | MEDIUM | HARD
  tags                String[]            // Topics (Array, DP, Graph, etc.)
  userId              String              // Creator's ID
  examples            Json                // {input, output, explanation}
  constraints         String              // Problem bounds (1 ≤ n ≤ 10^5)
  hints               String?             // Optional solving hints
  editorial           String?             // Official solution explanation

  testcases           Json                // [{input: string, output: string}]
  codeSnippets        Json                // {language: template_code}
  referenceSolutions  Json                // {language: solution_code}

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  // Relations
  user                User                @relation(fields: [userId])
  submission          Submission[]        // All submissions for this problem
  solvedBy            ProblemSolved[]     // Who solved this problem
  ProblemsPlaylist    ProblemInPlaylist[] // In which playlists
  discussions         Discussion[]        // Discussions about this problem
  contestProblems     ContestProblem[]    // In which contests
}
```

**Test Case Format** (stored as JSON):
```json
[
  {
    "input": "2\n7\n11\n15\n9",
    "output": "0\n1",
    "explanation": "Because nums[0] + nums[1] == 9"
  }
]
```

**Code Snippets Format**:
```json
{
  "python": "def twoSum(nums, target):\n    # Your code here",
  "javascript": "function twoSum(nums, target) {\n    // Your code here\n}",
  "java": "class Solution {\n    public int[] twoSum(...) {...}\n}"
}
```

---

#### **3. Submission Model**
Purpose: Log every code submission with execution results.

```prisma
model Submission {
  id              String              @id @default(uuid())
  userId          String
  problemId       String
  sourceCode      Json                // Code in target language
  language        String              // python, javascript, java, cpp, c, go, rb, php
  stdin           String?             // Standard input
  stdout          String?             // Program output
  stderr          String?             // Error output
  compileOutput   String?             // Compilation errors
  status          String              // "Accepted", "Wrong Answer", "TLE", etc.
  memory          String?             // Peak memory usage (KB)
  time            String?             // Execution time (ms)

  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  // Relations
  user            User                @relation(fields: [userId])
  problem         Problem             @relation(fields: [problemId])
  testCases       TestCaseResult[]    // Individual test case results
}
```

**Status Values**: 
- `"Accepted"` - All tests passed
- `"Wrong Answer"` - Output mismatch
- `"Time Limit Exceeded"` - Too slow
- `"Runtime Error"` - Crash/exception
- `"Compilation Error"` - Syntax error
- `"Memory Limit Exceeded"` - Too much RAM

---

#### **4. TestCaseResult Model**
Purpose: Detailed results for each test case in a submission.

```prisma
model TestCaseResult {
  id              String              @id @default(uuid())
  submissionId    String
  testCase        Int                 // Test case index (1, 2, 3...)
  passed          Boolean
  stdout          String?             // Actual output
  expected        String              // Expected output
  stderr          String?
  compileOutput   String?
  status          String
  memory          String?
  time            String?

  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  submission      Submission          @relation(fields: [submissionId])

  @@index([submissionId])
}
```

---

#### **5. Discussion & Comment Models**
Purpose: Community forum per problem for sharing solutions and hints.

```prisma
model Discussion {
  id            String              @id @default(uuid())
  title         String              // Discussion topic
  content       String              // Initial post
  upvotes       Int                 @default(0)
  userId        String
  problemId     String

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  user          User                @relation(fields: [userId])
  problem       Problem             @relation(fields: [problemId])
  comments      Comment[]

  @@index([problemId, createdAt])
  @@index([userId, createdAt])
}

model Comment {
  id            String              @id @default(uuid())
  discussionId  String
  userId        String
  content       String

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  discussion    Discussion          @relation(fields: [discussionId])
  user          User                @relation(fields: [userId])

  @@index([discussionId, createdAt])
  @@index([userId, createdAt])
}
```

---

#### **6. Playlist Model**
Purpose: User-created problem collections for study paths or interview prep.

```prisma
model Playlist {
  id            String              @id @default(uuid())
  name          String              // "LC 75", "Interview Prep", etc.
  description   String?
  userId        String

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  problems      ProblemInPlaylist[]
  user          User                @relation(fields: [userId])

  @@unique([name, userId])            // Can't have duplicate names per user
}

model ProblemInPlaylist {
  id            String              @id @default(uuid())
  playlistId    String
  problemId     String

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  Playlist      Playlist            @relation(fields: [playlistId])
  problem       Problem             @relation(fields: [problemId])

  @@unique([playlistId, problemId])   // Can't add same problem twice
}
```

---

#### **7. Contest Models**
Purpose: Manage competitive programming contests.

```prisma
model Contest {
  id            String              @id @default(uuid())
  slug          String              @unique            // URL slug
  name          String              // "LC Weekly 421"
  description   String?
  type          String              // "team", "individual"
  status        String              @default("upcoming") // upcoming, live, ended
  startTime     DateTime
  endTime       DateTime
  ratingFloor   Int?                // Min rating to participate
  ratingCeil    Int?                // Max rating
  createdById   String
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  createdBy     User                @relation(fields: [createdById])
  problems      ContestProblem[]
  participants  ContestParticipant[]
}

model ContestProblem {
  id            String              @id @default(uuid())
  contestId     String
  problemId     String
  label         String              // "A", "B", "C", etc.
  points        Int                 @default(100)
  createdAt     DateTime            @default(now())

  contest       Contest             @relation(fields: [contestId])
  problem       Problem             @relation(fields: [problemId])

  @@unique([contestId, problemId])
  @@index([contestId])
}

model ContestParticipant {
  id            String              @id @default(uuid())
  contestId     String
  userId        String
  registeredAt  DateTime            @default(now())

  contest       Contest             @relation(fields: [contestId])
  user          User                @relation(fields: [userId])

  @@unique([contestId, userId])
  @@index([userId])
}
```

---

#### **8. Problem Solved Tracker**
Purpose: Track which problems each user has solved (achievement tracking).

```prisma
model ProblemSolved {
  id            String              @id @default(uuid())
  userId        String
  problemId     String

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  user          User                @relation(fields: [userId])
  problem       Problem             @relation(fields: [problemId])

  @@unique([userId, problemId])  // Each user solves each problem once
}
```

---

#### **9. User Activity (Heatmap)**
Purpose: Track daily activities for the GitHub-style contribution heatmap.

```prisma
model UserActivity {
  id            String              @id @default(uuid())
  userId        String
  dateKey       String              // "2026-04-29" (YYYY-MM-DD)
  count         Int                 @default(1)
  lastSeenAt    DateTime            // Last action timestamp
  createdAt     DateTime            @default(now())

  user          User                @relation(fields: [userId])

  @@unique([userId, dateKey])    // One entry per user per day
  @@index([dateKey])             // Fast filtering by date
}
```

---

### Database Optimization

**Indexes Used**:
- `Discussion`: `(problemId, createdAt)` - Fast retrieval of recent discussions
- `Comment`: `(discussionId, createdAt)` - Thread-ordered comments
- `TestCaseResult`: `(submissionId)` - Quick lookup of test results
- `ContestProblem`: `(contestId)` - All problems in a contest
- `ContestParticipant`: `(userId)` - All contests user joined
- `UserActivity`: `(dateKey)` - Heatmap generation

**Cascade Deletes**:
- Deleting a User cascades to: Problems, Submissions, Discussions, Comments, Playlists, Activities
- Deleting a Problem cascades to: Submissions, TestCaseResults, Discussions, Comments

---

## 📁 Project Structure

```
LeetLab/
│
├── README.md (this file)
│
├── backend/                           # Node.js Express API
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema (9 models)
│   │   └── migrations/                # Database version history
│   │       └── */                     # Each timestamped migration
│   │
│   └── src/
│       ├── index.js                   # Express server entry point
│       │
│       ├── routes/                    # API endpoint definitions
│       │   ├── auth.routes.js         # /api/v1/auth
│       │   ├── problem.routes.js      # /api/v1/problems
│       │   ├── submission.routes.js   # /api/v1/submissions
│       │   ├── execute-code.routes.js # /api/v1/execute-code
│       │   ├── discussion.routes.js   # /api/v1/discuss
│       │   ├── playlist.routes.js     # /api/v1/playlist
│       │   ├── contests.routes.js     # /api/v1/contests
│       │   ├── leaderboard.routes.js  # /api/v1/leaderboard
│       │   └── users.routes.js        # /api/v1/users
│       │
│       ├── controllers/               # Business logic & API handlers
│       │   ├── auth.controller.js     # register, login, logout
│       │   ├── problem.controller.js  # CRUD problems, test case validation
│       │   ├── submission.controller.js # Save & process submissions
│       │   ├── execute-code.controller.js # Judge0 integration
│       │   ├── discussion.controller.js # Forum management
│       │   ├── playlist.controller.js # Playlist operations
│       │   ├── contests.controller.js # Contest management
│       │   ├── leaderboard.controller.js # Rating & rankings
│       │   └── users.controller.js    # User profiles & settings
│       │
│       ├── libs/                      # Shared utilities
│       │   ├── db.js                  # Prisma client instance
│       │   ├── judge0.lib.js          # Judge0 API wrapper
│       │   ├── activity.lib.js        # Heatmap & streak logic
│       │   └── auth.middleware.js     # JWT verification
│       │
│       └── middleware/
│           └── auth.middleware.js     # Protected route middleware
│
├── leetlab-frontend/                  # React + TypeScript frontend
│   ├── package.json
│   ├── vite.config.ts                 # Vite bundler config
│   ├── tsconfig.json
│   ├── index.html
│   │
│   └── src/
│       ├── main.tsx                   # React entry point
│       ├── App.tsx                    # Root component
│       ├── styles.css                 # Global styles
│       │
│       ├── routes/                    # Page components (React Router)
│       │   ├── index.tsx              # Home / Dashboard
│       │   ├── login.tsx              # Auth page
│       │   ├── register.tsx           # Registration page
│       │   ├── problems.tsx           # Problems list
│       │   ├── problems.$problemId.tsx # Problem editor (split-pane)
│       │   ├── submissions.tsx        # Submission history
│       │   ├── discuss.tsx            # Discussions forum
│       │   ├── discuss.new.tsx        # Create discussion
│       │   ├── discuss.$postId.tsx    # Discussion details
│       │   ├── contests.tsx           # Contest list
│       │   ├── contests.$slug.tsx     # Contest details
│       │   ├── leaderboard.tsx        # Global leaderboard
│       │   ├── playlists.tsx          # Playlist browser
│       │   ├── playlists.$id.tsx      # Playlist details
│       │   ├── profile.tsx            # User profile
│       │   ├── u.$username.tsx        # Public profile view
│       │   ├── admin.tsx              # Admin dashboard
│       │   ├── admin.problems.new.tsx # Create problem
│       │   ├── admin.problems.edit.tsx# Edit problem
│       │   ├── admin.contests.new.tsx # Create contest
│       │   ├── admin.contests.tsx     # Manage contests
│       │   └── admin.users.tsx        # User management
│       │
│       ├── components/                # Reusable React components
│       │   ├── site-header.tsx        # Navigation bar
│       │   ├── create-problem-form.tsx# Problem creation form
│       │   ├── add-to-playlist-button.tsx
│       │   ├── profile-heatmap.tsx    # Activity heatmap
│       │   ├── submission-analytics.tsx # Stats charts
│       │   ├── topic-ring-chart.tsx   # Difficulty breakdown
│       │   ├── monthly-streak-tracker.tsx
│       │   ├── ai-code-review-panel.tsx
│       │   ├── difficulty-badge.tsx
│       │   ├── empty-state.tsx
│       │   ├── background-animation.tsx
│       │   └── ui/                    # Shadcn/UI components
│       │       ├── button.tsx
│       │       ├── input.tsx
│       │       ├── select.tsx
│       │       ├── dialog.tsx
│       │       └── ... (30+ Radix UI primitives)
│       │
│       ├── hooks/                     # Custom React hooks
│       │   └── use-mobile.tsx         # Responsive design hook
│       │
│       ├── lib/                       # Utilities & helpers
│       │   ├── api.ts                 # API client (fetch + caching)
│       │   ├── auth-context.tsx       # Auth context provider
│       │   ├── auth-store.ts          # Zustand auth store
│       │   ├── cache.ts               # Response caching logic
│       │   ├── submission-queue.ts    # Offline submission queue
│       │   ├── use-query.ts           # Data fetching hook
│       │   ├── utils.ts               # Helper functions
│       │   ├── communityData.ts       # Seed data
│       │   └── theme-context.tsx      # Dark/light mode
│       │
│       └── stores/                    # Zustand state stores
│           ├── auth.store.ts
│           ├── problem.store.ts
│           └── ... (others)
```

---

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Authenticate user | No |
| POST | `/logout` | Clear session | Yes |
| GET | `/me` | Get current user profile | Yes |

### Problems (`/api/v1/problems`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | List all problems (paginated) | No |
| GET | `/:id` | Get problem details | No |
| POST | `/` | Create new problem | Yes (Admin) |
| PUT | `/:id` | Update problem | Yes (Creator) |
| DELETE | `/:id` | Delete problem | Yes (Creator) |
| GET | `/difficulty/:level` | Filter by difficulty | No |
| GET | `/tags/:tag` | Filter by tag | No |
| POST | `/:id/solve-verify` | Verify test cases | Yes |

### Submissions (`/api/v1/submissions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | Get user's submissions | Yes |
| GET | `/:id` | Get submission details | Yes |
| POST | `/` | Submit solution | Yes |
| GET | `/problem/:id` | Submissions for problem | Yes |
| GET | `/stats` | User submission stats | Yes |

### Code Execution (`/api/v1/execute-code`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/run` | Execute code on test cases | Yes |
| POST | `/batch-submit` | Batch test case execution | Yes |
| POST | `/poll/:token` | Poll execution status | Yes |

### Discussions (`/api/v1/discuss`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | List discussions | No |
| GET | `/problem/:id` | Discussions for problem | No |
| POST | `/` | Create discussion | Yes |
| POST | `/:id/comment` | Add comment | Yes |
| PUT | `/:id` | Edit discussion | Yes (Author) |
| DELETE | `/:id` | Delete discussion | Yes (Author) |
| POST | `/:id/upvote` | Upvote discussion | Yes |

### Playlists (`/api/v1/playlist`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | List user playlists | Yes |
| POST | `/` | Create playlist | Yes |
| GET | `/:id` | Get playlist details | Yes |
| PUT | `/:id` | Update playlist | Yes (Owner) |
| DELETE | `/:id` | Delete playlist | Yes (Owner) |
| POST | `/:id/problem` | Add problem to playlist | Yes (Owner) |
| DELETE | `/:playlistId/problem/:problemId` | Remove problem | Yes (Owner) |

### Contests (`/api/v1/contests`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | List all contests | No |
| GET | `/:slug` | Get contest details | No |
| POST | `/` | Create contest | Yes (Admin) |
| POST | `/:id/register` | Join contest | Yes |
| GET | `/:id/leaderboard` | Contest standings | No |
| GET | `/:id/my-submissions` | User's contest submissions | Yes |

### Leaderboard (`/api/v1/leaderboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/global` | Global leaderboard | No |
| GET | `/global?range=week` | Weekly rankings | No |
| GET | `/global?range=month` | Monthly rankings | No |
| GET | `/contests/:id` | Contest leaderboard | No |
| GET | `/user/:id` | User ranking details | No |

### Users (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/:id` | Get user profile | No |
| GET | `/:username` | Get profile by username | No |
| PUT | `/` | Update profile | Yes |
| GET | `/:id/solved` | Problems solved by user | No |
| GET | `/:id/submissions` | Submissions by user | No |
| GET | `/:id/activity` | User activity heatmap data | No |
| POST | `/follow` | Follow user | Yes |
| DELETE | `/follow/:userId` | Unfollow user | Yes |

---

## 🎨 Frontend Components

### Core Components

| Component | Location | Purpose | Props |
|-----------|----------|---------|-------|
| **SiteHeader** | `/components/site-header.tsx` | Navigation bar | `user`, `onLogout` |
| **ProblemCard** | `/components/problem-card.tsx` | Problem listing item | `problem`, `solved` |
| **CodeEditor** | (Monaco wrapper) | Split-pane editor | `code`, `language`, `onChange` |
| **TestCasePanel** | (Custom) | Test results display | `results`, `loading` |
| **ProfileHeatmap** | `/components/profile-heatmap.tsx` | Activity calendar | `userId`, `year` |
| **SubmissionAnalytics** | `/components/submission-analytics.tsx` | Stats charts | `userId` |
| **TopicRingChart** | `/components/topic-ring-chart.tsx` | Difficulty pie chart | `problems` |
| **DifficultyBadge** | `/components/difficulty-badge.tsx` | Level indicator | `level` |
| **CreateProblemForm** | `/components/CreateProblemForm.tsx` | Problem creation | `onSubmit` |
| **AddToPlaylistButton** | `/components/add-to-playlist-button.tsx` | Playlist action | `problemId` |

### UI System (Shadcn/UI)

30+ reusable Radix UI primitives in `/components/ui/`:
- Buttons, Inputs, Selects, Dialogs, Modals
- Tabs, Dropdowns, Menus, Popovers, Tooltips
- Checkboxes, Radio Groups, Sliders, Toggles
- Cards, Separators, Badges, Alerts

### Page Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | dashboard.tsx | Home/feed |
| `/problems` | problems.tsx | Problem browser |
| `/problems/:id` | problems.$problemId.tsx | Editor (main workspace) |
| `/submissions` | submissions.tsx | Submission history |
| `/discuss` | discuss.tsx | Forum |
| `/discuss/new` | discuss.new.tsx | Create post |
| `/discuss/:id` | discuss.$postId.tsx | Thread view |
| `/contests` | contests.tsx | Contest list |
| `/contests/:slug` | contests.$slug.tsx | Contest page |
| `/leaderboard` | leaderboard.tsx | Global rankings |
| `/playlists` | playlists.tsx | Playlist browser |
| `/playlists/:id` | playlists.$id.tsx | Playlist view |
| `/profile` | profile.tsx | User profile editor |
| `/u/:username` | u.$username.tsx | Public profile |
| `/login` | login.tsx | Authentication |
| `/register` | register.tsx | Sign up |
| `/admin` | admin.tsx | Admin dashboard |
| `/admin/problems` | admin.problems.tsx | Problem management |
| `/admin/problems/new` | admin.problems.new.tsx | Create problem |
| `/admin/problems/:id/edit` | admin.problems.edit.tsx | Edit problem |
| `/admin/contests` | admin.contests.tsx | Contest management |
| `/admin/contests/new` | admin.contests.new.tsx | Create contest |
| `/admin/users` | admin.users.tsx | User management |

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v18 or later
- **npm** v9 or later
- **PostgreSQL** v14 or later
- **Git** for version control
- **Judge0 API Key** (get from [judge0.com](https://judge0.com))

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/leetlab.git
cd leetlab
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/leetlab"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-judge0-api-key"
PORT=3000
NODE_ENV="development"
EOF

# Create database and run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed

# Start backend server
npm run dev
# Server runs on http://localhost:3000
```

### Step 3: Frontend Setup

```bash
cd ../leetlab-frontend

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
VITE_API_URL="http://localhost:3000/api/v1"
EOF

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 4: Verify Installation

1. Open browser to `http://localhost:5173`
2. Navigate to `/register` and create account
3. Create a test problem from `/admin/problems/new`
4. Open the problem and test code submission
5. Check `/leaderboard` for user ranking

### Docker Setup (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Wait for services to start (30-60 seconds)
# Then access frontend on http://localhost:5173
```

---

## 💎 Design Philosophy

### 🎨 **Visual Design: Premium Glassmorphism**

LeetLab employs a sophisticated design language combining transparency, depth, and modern aesthetics:

**Key Design Principles**:

1. **Glassmorphism Elements**
   - `backdrop-blur-md` for depth and layering
   - Semi-transparent backgrounds (`bg-opacity-80`)
   - Subtle border glows using CSS gradients
   - Layered shadow effects for z-depth

2. **Color System**
   - **Dark Mode**: Deep slate (`#0f172a`) with vibrant accent colors
   - **Light Mode**: Soft ivory (`#fafafa`) with muted accents
   - **Accent**: Dynamic oklch colors for theme flexibility
   - **Status Colors**:
     - Green (`#10b981`) - Accepted/Success
     - Red (`#ef4444`) - Wrong/Error
     - Yellow (`#f59e0b`) - Pending/Warning
     - Blue (`#3b82f6`) - Info/Processing

3. **Typography**
   - **Headings**: Geist Sans (system font fallback)
   - **Body**: Inter / system-ui stack
   - **Monospace**: Fira Code / JetBrains Mono for code
   - **Scale**: 12px → 48px (8-step scale)

4. **Spacing System**
   - Tailwind's 4px base unit
   - Consistent padding: `p-4`, `p-6`, `p-8`
   - Gap system: `gap-3`, `gap-4`, `gap-6`

5. **Interactive Micro-interactions**
   ```css
   /* Hover states */
   hover:scale-105 hover:shadow-lg transition-all
   
   /* Focus states */
   focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
   
   /* Active animations */
   group-hover:opacity-100 animate-pulse
   ```

### 🏗️ **System Architecture Principles**

1. **Separation of Concerns**
   - Routes → Controllers → Services → Database
   - Component → Hooks → Store → API
   - Clear responsibility boundaries

2. **Scalability**
   - Stateless backend (horizontal scaling)
   - Database indexing on frequent queries
   - Frontend state caching via React Query patterns
   - Batch submission APIs for Judge0 efficiency

3. **Security**
   - JWT in HttpOnly cookies (CSRF protected)
   - Password hashing with bcryptjs (salt rounds: 10)
   - Request validation on all endpoints
   - CORS with whitelisted origins
   - SQL injection prevention via Prisma ORM

4. **Performance**
   - Lazy loading of routes (React.lazy)
   - Image optimization (responsive imgs)
   - API response caching (stale-while-revalidate)
   - Database query optimization (eager loading)
   - Submission batching to Judge0

5. **User Experience**
   - Real-time feedback on code execution
   - Smooth transitions between problem states
   - Responsive design (mobile-first)
   - Offline support via localStorage queue
   - Dark/Light mode toggle

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-fork/leetlab.git
   cd leetlab
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow existing code style
   - Write meaningful commit messages
   - Add comments for complex logic
   - Test locally before pushing

4. **Submit Pull Request**
   - Describe changes clearly
   - Reference related issues
   - Ensure CI checks pass
   - Request review from maintainers

### Code Style Guidelines

- **Backend**: CommonJS exports, 2-space indent
- **Frontend**: Functional components, TypeScript interfaces
- **Database**: Use Prisma migrations for schema changes
- **Git**: Conventional commits (feat:, fix:, docs:, style:, refactor:, test:)

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for details.

---

## 📞 Support

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: support@leetlab.dev
- **Discord**: [Join Community](https://discord.gg/leetlab)

---

## 🙏 Acknowledgments

- [Judge0](https://judge0.com) - Code execution engine
- [Shadcn/UI](https://shadcn-ui.com) - Component library
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [Prisma](https://www.prisma.io) - Database ORM
- Community contributors and users

---

**Made with ❤️ by the LeetLab Team**

Last Updated: April 29, 2026 | Version: 1.0.0
   npx prisma generate
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd leetlab-frontend
   npm install
   # Create .env with VITE_API_URL
   npm run dev
   ```

---

## 📄 License
LeetLab is open-source software licensed under the [MIT License](LICENSE).
