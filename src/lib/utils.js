import { FINE_PER_DAY, BORROWING_STATUS } from './constants';

/**
 * Format ISO or SQL date string to readable user format (e.g. 12 Oct 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Get date string formatted as YYYY-MM-DD for HTML date inputs
 */
export function toInputDateFormat(date = new Date()) {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return [year, month, day].join('-');
}

/**
 * Add days to a given date and return as YYYY-MM-DD string
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days));
  return toInputDateFormat(result);
}

/**
 * Check if an active borrowing record is overdue.
 * A borrowing is overdue if returned_at IS NULL AND current date > due_date (normalized to day boundary)
 */
export function isOverdue(dueDate, returnedAt = null) {
  if (returnedAt) return false;
  if (!dueDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return today.getTime() > due.getTime();
}

/**
 * Calculate the number of days a book is late.
 * If returned, compare returned_at with due_date.
 * If not returned, compare current date with due_date.
 */
export function calculateDaysLate(dueDate, returnedAt = null) {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const referenceDate = returnedAt ? new Date(returnedAt) : new Date();
  referenceDate.setHours(0, 0, 0, 0);

  const diffTime = referenceDate.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Calculate the overdue fine.
 * fine = daysLate * finePerDay
 */
export function calculateFine(dueDate, returnedAt = null, finePerDay = FINE_PER_DAY) {
  const daysLate = calculateDaysLate(dueDate, returnedAt);
  return daysLate * finePerDay;
}

/**
 * Compute the dynamic status of a borrowing record:
 * If returned_at exists -> "Returned"
 * Else if today > due_date -> "Overdue"
 * Else -> "Active"
 */
export function getBorrowingDisplayStatus(borrowing) {
  if (!borrowing) return BORROWING_STATUS.ACTIVE;
  if (borrowing.returned_at) {
    return BORROWING_STATUS.RETURNED;
  }
  if (isOverdue(borrowing.due_date, borrowing.returned_at)) {
    return BORROWING_STATUS.OVERDUE;
  }
  return BORROWING_STATUS.ACTIVE;
}

/**
 * Format currency for fines
 */
export function formatCurrency(amount) {
  return `₹${Number(amount || 0).toFixed(0)}`;
}
