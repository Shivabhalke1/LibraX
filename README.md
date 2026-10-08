# LibraX — Online Library Management System

![LibraX Banner](public/favicon.svg)

> **Automated, modern, and reliable platform to manage catalog inventory, student/faculty members, book borrowings, returns, and overdue fines.**

Built for academic library administration, hackathon demonstrations, and university viva evaluations.

---

## 🌟 Key Features

1. **Supabase Authentication**: Secure login and role management (Admin / Librarian).
2. **Real-Time System Dashboard**:
   - Total Books (titles & copy volumes)
   - Total Members (active vs. inactive)
   - Available Copies in stock
   - Currently Borrowed Copies
   - Automatically detected Overdue Loans
   - Books Due Today
   - Circulation ratio bar and most popular borrowed titles telemetry
3. **Book Management (CRUD)**:
   - Add new books (initial available copies automatically equals total copies)
   - Edit book metadata and copy capacity
   - Safe deletion protection (cannot delete books with active loans)
   - Real-time search by Title, Author, or ISBN
   - Category and stock availability filters
4. **Member Directory (CRUD)**:
   - Student & faculty patron registry with auto-generated Member IDs (`MEM-YYYY-XXX`)
   - Department, academic year, and status tracking (Active / Inactive)
   - Only **Active** members are permitted to borrow books
5. **Automated Issue Book Workflow**:
   - Validates member is active
   - Validates copies are in stock (`available_copies > 0`)
   - Automatically decrements available copies by 1
   - Calculates default due date based on loan policy (14 days)
6. **Return Book Workflow**:
   - One-click return processing
   - Prevents double-returns
   - Automatically increments book's available copies by 1
   - Computes days late and total penalty fine dynamically
7. **Automated Overdue Detection & Fines**:
   - Identifies active unreturned loans where `current_date > due_date`
   - Dynamically calculates late days: `daysLate = currentDate - dueDate`
   - Dynamically calculates fine: `fine = daysLate × FINE_PER_DAY`
   - Real-time calculation using centralized constants

---

## 🛠️ Locked Technology Stack

- **Frontend**: React (Vite), JavaScript (ES6+), HTML5, Vanilla CSS3 (Custom Design Tokens)
- **Backend / Database / Auth**: Supabase PostgreSQL + Supabase Auth via `@supabase/supabase-js`
- **Deployment**: Vercel ready (`vercel.json` / static build)
- **Version Control**: Git & GitHub

---

## ⚡ On-The-Spot Code Modification (Viva Cheat Sheet)

During the viva or hackathon presentation, examiners frequently ask for immediate business logic modifications. All rules are centralized in **[`src/lib/constants.js`](src/lib/constants.js)**:

```javascript
// src/lib/constants.js

// 1. Change borrowing loan duration from 14 days to 7 days:
export const BORROWING_PERIOD = 7; // was 14

// 2. Change daily overdue fine from ₹5 to ₹10:
export const FINE_PER_DAY = 10; // was 5
```
Saving this file immediately updates all forms, overdue calculations, and return dialogs across the entire application without touching any UI component!

---

## 🗄️ Database Architecture

The PostgreSQL schema and sample test data are stored in the `supabase/` folder:

1. **`public.profiles`**: User role linking to `auth.users(id)`
2. **`public.books`**: Book catalog, ISBN, category, total & available copies
3. **`public.members`**: Member code, contact info, department, status (`Active`/`Inactive`)
4. **`public.borrowings`**: Transaction ledger linking `book_id` and `member_id`, issue date, due date, return timestamp, and loan status

### Business Constraints Implemented in PostgreSQL:
- `available_copies >= 0`
- `available_copies <= total_copies`
- Foreign keys with `ON DELETE RESTRICT` to prevent accidental deletion of books/members tied to active loans
- Row Level Security (RLS) policies configured for authenticated librarians

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd "online lib"
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Setup Supabase Database
1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to the **SQL Editor**
3. Run the SQL script found in `supabase/schema.sql`
4. Run the seed script in `supabase/seed.sql` to populate sample books, members, and transactions (including active and overdue examples)

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
librax/
├── public/
│   └── favicon.svg
├── supabase/
│   ├── schema.sql           # Complete PostgreSQL DDL with RLS policies
│   └── seed.sql             # Test data including active & overdue loans
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar, Navbar, Layout shell
│   │   ├── ui/              # Button, Input, Select, Modal, Badge, StatCard, Table, Loader
│   │   ├── books/           # BookTable, BookForm, BookFilters
│   │   ├── members/         # MemberTable, MemberForm, MemberFilters
│   │   ├── borrowings/      # IssueBook, ReturnBook, BorrowingTable, BorrowingFilters
│   │   └── dashboard/       # StatsCards, RecentTransactions, BorrowingChart
│   ├── pages/               # Login, Dashboard, Books, Members, IssueBook, Returns, Transactions, Overdue
│   ├── services/            # authService, bookService, memberService, borrowingService, dashboardService
│   ├── hooks/               # useAuth, useBooks, useMembers, useBorrowings
│   ├── context/             # AuthContext
│   ├── lib/                 # supabase.js, constants.js, utils.js
│   ├── styles/              # variables.css, global.css, responsive.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── README.md
```

---

## 🎤 Presentation & Viva Flow

1. **Problem Statement**: Libraries struggle with manual bookkeeping, unmonitored overdues, and loss of books due to lack of real-time inventory counts.
2. **Solution**: LibraX provides automated tracking with real-time copy counters, active patron validation, and dynamic penalty calculation.
3. **Live Demonstration**:
   - **Login**: Authenticate with Librarian credentials.
   - **Dashboard**: Showcase real computed values from PostgreSQL (Available Copies, Overdue Books, Due Today).
   - **Issue Book**: Select an active student and an available book. Observe that available copies immediately decrements by 1.
   - **Overdue Detection**: Navigate to Overdue Records to inspect books past their due date and see calculated fines.
   - **Process Return**: Return a book; observe the fine collection prompt and immediate inventory restoration (+1 copy).
   - **Code Walkthrough**: Open `src/lib/constants.js` to demonstrate on-the-spot policy updates (e.g., changing `BORROWING_PERIOD` or `FINE_PER_DAY`).
