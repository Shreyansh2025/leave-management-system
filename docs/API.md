# API Documentation — Leave Management System

Base URL (local): `http://localhost:5000/api`

All endpoints except `/auth/login` require a header:
`Authorization: Bearer <jwt_token>`

All responses follow the shape:
```json
{ "success": true, "data": {}, "message": "optional" }
{ "success": false, "message": "error text", "details": [] }
```

---

## Auth

### POST /auth/login
Authenticate with email + password, receive a JWT.

**Body**
```json
{ "email": "aarav@company.com", "password": "Password123!" }
```
**200** → `{ success, data: { token, user } }`
**401** → invalid credentials
**400** → validation error (missing/malformed email or password)

### POST /auth/logout
Stateless JWT logout (client discards token). **200** always.

---

## Employees

### GET /employees  *(manager only)*
Query params: `search`, `department`
**200** → array of employees. **403** if called by an employee.

### GET /employees/:id
Employees may only fetch their own record; managers can fetch any.
**200** / **403** / **404**

### GET /dashboard/employee *(employee only)*
Returns `{ totalLeaveRequests, approved, pending, rejected, recentActivity }`

### GET /dashboard/manager *(manager only)*
Returns `{ totalEmployees, pendingApprovals, approved, rejected, recentActivity }`

---

## Leaves

### POST /leaves *(employee only)*
**Body**
```json
{ "leaveType": "Casual", "startDate": "2026-08-15", "endDate": "2026-08-16", "reason": "Personal errand" }
```
`leaveType` ∈ `Sick | Casual | Earned | Unpaid | Maternity | Paternity`
**201** on success. **400** if validation fails (e.g. `endDate` before `startDate`, reason too short).

### GET /leaves
Query params: `status`, `type`, `search`, `employeeId` (manager only, scopes to one employee)
- Employees see only their own leaves.
- Managers see all leaves (or one employee's, via `employeeId`).
**200** → array of leaves.

### GET /leaves/:id
**200** / **403** (not your leave) / **404**

### PUT /leaves/:id *(employee, owner only)*
Editable only while `status = Pending`. Accepts any of `leaveType, startDate, endDate, reason`.
**200** / **400** (not pending, or no valid fields) / **403** (not the owner) / **404**

### DELETE /leaves/:id *(employee, owner only)*
Cancels (soft-deletes) a pending leave — sets `status = Cancelled`.
**200** / **400** (not pending) / **403** / **404**

---

## Manager Operations

### GET /pending-leaves *(manager only)*
All leaves with `status = Pending`, oldest first.

### PUT /leaves/:id/approve *(manager only)*
**Body (optional)**: `{ "comments": "..." }`
**200** / **400** (already reviewed) / **404**

### PUT /leaves/:id/reject *(manager only)*
**Body (optional)**: `{ "comments": "..." }`
**200** / **400** (already reviewed) / **404**

---

## Status codes used throughout
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error / invalid state transition |
| 401 | Missing/invalid/expired token, or bad login credentials |
| 403 | Authenticated but not authorized for this resource |
| 404 | Resource not found |
| 500 | Unexpected server error |

A ready-to-import Postman collection with all of the above requests (and auto-saved token/leaveId variables) is at `/postman/Leave-Management-System.postman_collection.json`.
