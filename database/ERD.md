# Database Schema — Entity Relationship

The authoritative DDL lives at `backend/src/models/schema.sql`. This file is a quick visual reference.

```
┌───────────────────────────┐
│        employees          │
├───────────────────────────┤
│ id            PK          │
│ name                      │
│ email         UNIQUE      │
│ password      (bcrypt)    │
│ department                │
│ role          employee|manager │
│ manager_id    FK → employees.id (self-referencing, nullable) │
│ created_at / updated_at   │
└─────────────┬─────────────┘
              │ 1
              │
              │ N
┌─────────────▼─────────────┐
│          leaves            │
├─────────────────────────────┤
│ id              PK          │
│ employee_id     FK → employees.id (CASCADE on delete) │
│ leave_type      enum        │
│ start_date / end_date       │
│ reason                      │
│ status          Pending|Approved|Rejected|Cancelled │
│ manager_comments             │
│ reviewed_by     FK → employees.id (nullable) │
│ created_at / updated_at     │
└──────────────────────────────┘
```

**Relationships**
- One `employee` has many `leaves` (1:N via `leaves.employee_id`).
- One `employee` (a manager) can be the `manager_id` for many other employees — self-referencing FK models the reporting line, even though the MVP's approval logic currently treats "manager" as a single flat role rather than routing by this relationship (see README → Assumptions).
- One `employee` (a manager) can be `reviewed_by` for many `leaves`.

**Normalization**: both tables are in 3NF — no repeating groups, every non-key column depends only on the primary key (e.g. `employee_name` is never stored on `leaves`; it's always joined from `employees`).
