-- ====================================================================
-- LibraX - Sample Seed Data for Hackathon Demonstration
-- ====================================================================

-- 1. Insert Initial Books
insert into public.books (id, title, author, isbn, category, publisher, publication_year, total_copies, available_copies)
values
  ('b1111111-1111-1111-1111-111111111111', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 'Prentice Hall', 2008, 5, 4),
  ('b2222222-2222-2222-2222-222222222222', 'Introduction to Algorithms, 4th Edition', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262046305', 'Computer Science', 'MIT Press', 2022, 4, 3),
  ('b3333333-3333-3333-3333-333333333333', 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', '978-0201633610', 'Software Engineering', 'Addison-Wesley', 1994, 3, 2),
  ('b4444444-4444-4444-4444-444444444444', 'Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'Data Science & AI', 'O Reilly Media', 2017, 4, 4),
  ('b5555555-5555-5555-5555-555555555555', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', '978-0134610993', 'Data Science & AI', 'Pearson', 2020, 2, 0),
  ('b6666666-6666-6666-6666-666666666666', 'Computer Networking: A Top-Down Approach', 'James Kurose, Keith Ross', '978-0136681557', 'Computer Science', 'Pearson', 2021, 3, 3)
on conflict (isbn) do nothing;

-- 2. Insert Initial Members
insert into public.members (id, member_code, name, email, phone, department, year, status)
values
  ('m1111111-1111-1111-1111-111111111111', 'MEM-2024-001', 'Aarav Sharma', 'aarav.sharma@campus.edu', '+91 98765 43210', 'Computer Science', '3rd Year', 'Active'),
  ('m2222222-2222-2222-2222-222222222222', 'MEM-2024-002', 'Priya Patel', 'priya.patel@campus.edu', '+91 98765 43211', 'Information Technology', '4th Year', 'Active'),
  ('m3333333-3333-3333-3333-333333333333', 'MEM-2024-003', 'Rohan Verma', 'rohan.verma@campus.edu', '+91 98765 43212', 'Electronics & Comm', '2nd Year', 'Active'),
  ('m4444444-4444-4444-4444-444444444444', 'MEM-2024-004', 'Ananya Gupta', 'ananya.gupta@campus.edu', '+91 98765 43213', 'Data Science', '1st Year', 'Inactive')
on conflict (member_code) do nothing;

-- 3. Insert Initial Borrowing Transactions
-- Record 1: Active Loan (Due in 7 days)
insert into public.borrowings (id, book_id, member_id, issued_at, due_date, returned_at, status)
values
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'm1111111-1111-1111-1111-111111111111', now() - interval '7 days', (current_date + interval '7 days')::date, null, 'Active')
on conflict (id) do nothing;

-- Record 2: Overdue Loan (Issued 20 days ago, due 6 days ago -> Overdue!)
insert into public.borrowings (id, book_id, member_id, issued_at, due_date, returned_at, status)
values
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222', now() - interval '20 days', (current_date - interval '6 days')::date, null, 'Active')
on conflict (id) do nothing;

-- Record 3: Successfully Returned Loan
insert into public.borrowings (id, book_id, member_id, issued_at, due_date, returned_at, status)
values
  ('c3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'm3333333-3333-3333-3333-333333333333', now() - interval '14 days', (current_date - interval '1 day')::date, now() - interval '2 days', 'Returned')
on conflict (id) do nothing;
