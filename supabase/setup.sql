-- ====================================================================
-- LibraX - Complete Database Setup Script
-- Copy and run this ENTIRE script in your Supabase SQL Editor
-- (https://supabase.com/dashboard/project/clzluhnbctyifdmgocgs/sql)
-- ====================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Drop existing tables if re-running (clean slate)
drop table if exists public.borrowings cascade;
drop table if exists public.books cascade;
drop table if exists public.members cascade;
drop table if exists public.profiles cascade;

-- 3. Create PROFILES Table
create table public.profiles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade unique,
    name text not null,
    role text not null default 'librarian' check (role in ('admin', 'librarian')),
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- 4. Create BOOKS Table
create table public.books (
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

-- 5. Create MEMBERS Table
create table public.members (
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

-- 6. Create BORROWINGS Table
create table public.borrowings (
    id uuid default gen_random_uuid() primary key,
    book_id uuid not null references public.books(id) on delete restrict,
    member_id uuid not null references public.members(id) on delete restrict,
    issued_at timestamptz not null default timezone('utc'::text, now()),
    due_date date not null,
    returned_at timestamptz,
    status text not null default 'Active' check (status in ('Active', 'Returned', 'Overdue')),
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- 7. High-Performance Indexes
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

-- 8. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.members enable row level security;
alter table public.borrowings enable row level security;

-- Policies for Authenticated & Public access (Full CRUD access for library system)
create policy "Allow all operations for authenticated on profiles"
    on public.profiles for all to authenticated using (true) with check (true);

create policy "Allow all operations for authenticated on books"
    on public.books for all to authenticated using (true) with check (true);

create policy "Allow all operations for authenticated on members"
    on public.members for all to authenticated using (true) with check (true);

create policy "Allow all operations for authenticated on borrowings"
    on public.borrowings for all to authenticated using (true) with check (true);

-- Allow public fallback reads so dashboard & catalog can be inspected seamlessly
create policy "Allow anon select on books" on public.books for select to anon using (true);
create policy "Allow anon select on members" on public.members for select to anon using (true);
create policy "Allow anon select on borrowings" on public.borrowings for select to anon using (true);

-- 9. Automatic Profile Creation Trigger on Sign-Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'librarian')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================================
-- 10. Sample Seed Data for Hackathon / Viva Demonstration
-- ====================================================================

-- Insert Sample Books
insert into public.books (id, title, author, isbn, category, publisher, publication_year, total_copies, available_copies)
values
  ('b1111111-1111-1111-1111-111111111111', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 'Prentice Hall', 2008, 5, 4),
  ('b2222222-2222-2222-2222-222222222222', 'Introduction to Algorithms, 4th Edition', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262046305', 'Computer Science', 'MIT Press', 2022, 4, 3),
  ('b3333333-3333-3333-3333-333333333333', 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', '978-0201633610', 'Software Engineering', 'Addison-Wesley', 1994, 3, 2),
  ('b4444444-4444-4444-4444-444444444444', 'Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'Data Science & AI', 'O Reilly Media', 2017, 4, 4),
  ('b5555555-5555-5555-5555-555555555555', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', '978-0134610993', 'Data Science & AI', 'Pearson', 2020, 2, 0),
  ('b6666666-6666-6666-6666-666666666666', 'Computer Networking: A Top-Down Approach', 'James Kurose, Keith Ross', '978-0136681557', 'Computer Science', 'Pearson', 2021, 3, 3)
on conflict (isbn) do nothing;

-- Insert Sample Members
insert into public.members (id, member_code, name, email, phone, department, year, status)
values
  ('m1111111-1111-1111-1111-111111111111', 'MEM-2024-001', 'Aarav Sharma', 'aarav.sharma@campus.edu', '+91 98765 43210', 'Computer Science', '3rd Year', 'Active'),
  ('m2222222-2222-2222-2222-222222222222', 'MEM-2024-002', 'Priya Patel', 'priya.patel@campus.edu', '+91 98765 43211', 'Information Technology', '4th Year', 'Active'),
  ('m3333333-3333-3333-3333-333333333333', 'MEM-2024-003', 'Rohan Verma', 'rohan.verma@campus.edu', '+91 98765 43212', 'Electronics & Comm', '2nd Year', 'Active'),
  ('m4444444-4444-4444-4444-444444444444', 'MEM-2024-004', 'Ananya Gupta', 'ananya.gupta@campus.edu', '+91 98765 43213', 'Data Science', '1st Year', 'Inactive')
on conflict (member_code) do nothing;

-- Insert Sample Borrowings
-- 1. Active Loan (Due in 7 days)
insert into public.borrowings (id, book_id, member_id, issued_at, due_date, returned_at, status)
values
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'm1111111-1111-1111-1111-111111111111', now() - interval '7 days', (current_date + interval '7 days')::date, null, 'Active')
on conflict (id) do nothing;

-- 2. Overdue Loan (Issued 20 days ago, due 6 days ago -> Overdue!)
insert into public.borrowings (id, book_id, member_id, issued_at, due_date, returned_at, status)
values
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222', now() - interval '20 days', (current_date - interval '6 days')::date, null, 'Active')
on conflict (id) do nothing;

-- 3. Returned Loan
insert into public.borrowings (id, book_id, member_id, issued_at, due_date, returned_at, status)
values
  ('c3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'm3333333-3333-3333-3333-333333333333', now() - interval '14 days', (current_date - interval '1 day')::date, now() - interval '2 days', 'Returned')
on conflict (id) do nothing;
