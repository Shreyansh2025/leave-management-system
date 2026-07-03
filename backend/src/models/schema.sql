-- =========================================================
-- Leave Management System - Database Schema
-- Engine target: SQLite (sql.js) for local/dev.
-- Fully portable to PostgreSQL/MySQL with minor type tweaks
-- (see README "Database Setup" notes on swapping engines).
-- =========================================================

CREATE TABLE IF NOT EXISTS employees (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT    NOT NULL,
  email          TEXT    NOT NULL UNIQUE,
  password       TEXT    NOT NULL,               -- bcrypt hash, never plain text
  department     TEXT    NOT NULL DEFAULT 'General',
  role           TEXT    NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager')),
  manager_id     INTEGER,                         -- self-referencing FK: which manager this employee reports to
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS leaves (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id       INTEGER NOT NULL,
  leave_type        TEXT    NOT NULL CHECK (leave_type IN ('Sick', 'Casual', 'Earned', 'Unpaid', 'Maternity', 'Paternity')),
  start_date        TEXT    NOT NULL,             -- ISO date (YYYY-MM-DD)
  end_date          TEXT    NOT NULL,
  reason            TEXT    NOT NULL,
  status            TEXT    NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
  manager_comments  TEXT,
  reviewed_by       INTEGER,                      -- manager who approved/rejected
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL,
  CHECK (date(end_date) >= date(start_date))
);

-- Indexing strategy:
-- - employee_id: every leave-history / pending-approvals query filters by this
-- - status: manager's "pending approvals" and employee's "filter by status" both hit this
-- - (employee_id, status): common combined filter (an employee's pending leaves)
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_employee_status ON leaves(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
