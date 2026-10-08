/**
 * LibraX Centralized Configuration Constants
 * 
 * Keep business constants centralized for quick on-the-spot 
 * code modifications during viva evaluations.
 */

// Default loan duration in days (configurable on the spot)
export const BORROWING_PERIOD = 14;

// Fine per day overdue (configurable on the spot)
export const FINE_PER_DAY = 5;

// Member Statuses
export const MEMBER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
};

// Book Statuses
export const BOOK_STATUS = {
  AVAILABLE: 'Available',
  BORROWED: 'Borrowed'
};

// Borrowing / Transaction Statuses
export const BORROWING_STATUS = {
  ACTIVE: 'Active',
  RETURNED: 'Returned',
  OVERDUE: 'Overdue'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian'
};

// Common Book Categories
export const BOOK_CATEGORIES = [
  'Computer Science',
  'Software Engineering',
  'Data Science & AI',
  'Mathematics',
  'Physics',
  'Electronics',
  'Business & Management',
  'Literature',
  'General Reference'
];
