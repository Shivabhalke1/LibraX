-- ====================================================================
-- LibraX - Online Library Management System
-- Database Schema for Supabase PostgreSQL
-- ====================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create PROFILES Table
create table if not exists public.profiles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade unique,
    name text not null,
    role text not null default 'librarian' check (role in ('admin', 'librarian')),
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- 3. Create BOOKS Table
create table if not exists public.books (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    author text not null,
    isbn text not null unique,
    category text not null,
    publisher text,
    publication_year integer check (publication_year > 1000 and publication_year <= extract(year from now()) + 1),
    total_copies integer not null default 1 check (total_copies >= 0),
    available_copies integer not null default 1 check (available_copies >= 0 and available_copies <= total_copies),
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- 4. Create MEMBERS Table
create table if not exists public.members (
    id uuid default gen_random_uuid() primary key,
    member_code text not null unique,
    name text not null,
    email text not null,
    phone text,
    department text,
    year text,
    status text not null default 'Active' check (status in ('Active', 'Inactive')),
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- 5. Create BORROWINGS Table
create table if not exists public.borrowings (
    id uuid default gen_random_uuid() primary key,
    book_id uuid not null references public.books(id) on delete restrict,
    member_id uuid not null references public.members(id) on delete restrict,
    issued_at timestamptz not null default timezone('utc'::text, now()),
    due_date date not null,
    returned_at timestamptz,
    status text not null default 'Active' check (status in ('Active', 'Returned', 'Overdue')),
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- 6. Indexes for High-Performance Searching & Filtering
create index if not exists idx_books_title on public.books(title);
create index if not exists idx_books_author on public.books(author);
create index if not exists idx_books_category on public.books(category);
create index if not exists idx_books_isbn on public.books(isbn);

create index if not exists idx_members_code on public.members(member_code);
create index if not exists idx_members_name on public.members(name);
create index if not exists idx_members_status on public.members(status);

create index if not exists idx_borrowings_book on public.borrowings(book_id);
create index if not exists idx_borrowings_member on public.borrowings(member_id);
create index if not exists idx_borrowings_status on public.borrowings(status);
create index if not exists idx_borrowings_due_date on public.borrowings(due_date);

-- 7. Row Level Security (RLS) Configuration
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.members enable row level security;
alter table public.borrowings enable row level security;

-- Drop existing policies if rerun
drop policy if exists "Authenticated users can view profiles" on public.profiles;
drop policy if exists "Authenticated users can insert profile" on public.profiles;
drop policy if exists "Authenticated users can update their profile" on public.profiles;

drop policy if exists "Authenticated users full access to books" on public.books;
drop policy if exists "Authenticated users full access to members" on public.members;
drop policy if exists "Authenticated users full access to borrowings" on public.borrowings;

-- Policies for Authenticated Librarians/Admins
create policy "Authenticated users can view profiles"
    on public.profiles for select
    to authenticated
    using (true);

create policy "Authenticated users can insert profile"
    on public.profiles for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Authenticated users can update their profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Authenticated users full access to books"
    on public.books for all
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated users full access to members"
    on public.members for all
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated users full access to borrowings"
    on public.borrowings for all
    to authenticated
    using (true)
    with check (true);

-- Optional: Allow public read-only fallback if testing without auth
-- (Can be enabled if public demo mode is desired)
-- create policy "Public read books" on public.books for select to anon using (true);
