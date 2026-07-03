const db = require('../config/db');
const ApiError = require('../utils/ApiError');

/** POST /leaves - employee applies for leave */
function createLeave(req, res, next) {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user.id;

    const { lastInsertRowid } = db.run(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [employeeId, leaveType, startDate, endDate, reason]
    );

    const leave = db.get('SELECT * FROM leaves WHERE id = ?', [lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Leave request submitted.', data: leave });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /leaves
 * Employees see only their own leaves. Managers can see all (used alongside /pending-leaves).
 * Supports ?status=&type=&search= (search matches reason)
 */
function getLeaves(req, res, next) {
  try {
    const { status, type, search, employeeId } = req.query;
    const params = [];
    let sql = `SELECT leaves.*, employees.name AS employee_name
               FROM leaves JOIN employees ON employees.id = leaves.employee_id
               WHERE 1 = 1`;

    if (req.user.role === 'employee') {
      sql += ' AND leaves.employee_id = ?';
      params.push(req.user.id);
    } else if (employeeId) {
      // Manager viewing one specific employee's history
      sql += ' AND leaves.employee_id = ?';
      params.push(employeeId);
    }
    if (status) {
      sql += ' AND leaves.status = ?';
      params.push(status);
    }
    if (type) {
      sql += ' AND leaves.leave_type = ?';
      params.push(type);
    }
    if (search) {
      sql += ' AND leaves.reason LIKE ?';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY leaves.created_at DESC';

    const leaves = db.all(sql, params);
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
}

/** GET /leaves/:id */
function getLeaveById(req, res, next) {
  try {
    const leave = db.get(
      `SELECT leaves.*, employees.name AS employee_name
       FROM leaves JOIN employees ON employees.id = leaves.employee_id
       WHERE leaves.id = ?`,
      [req.params.id]
    );
    if (!leave) return next(new ApiError(404, 'Leave request not found.'));

    if (req.user.role === 'employee' && leave.employee_id !== req.user.id) {
      return next(new ApiError(403, 'You do not have access to this leave request.'));
    }

    res.status(200).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
}

/** PUT /leaves/:id - employee edits their OWN leave, only while Pending */
function updateLeave(req, res, next) {
  try {
    const leave = db.get('SELECT * FROM leaves WHERE id = ?', [req.params.id]);
    if (!leave) return next(new ApiError(404, 'Leave request not found.'));
    if (leave.employee_id !== req.user.id) {
      return next(new ApiError(403, 'You can only edit your own leave requests.'));
    }
    if (leave.status !== 'Pending') {
      return next(new ApiError(400, 'Only pending leave requests can be edited.'));
    }

    const fields = req.body;
    const updates = [];
    const params = [];
    const map = { leaveType: 'leave_type', startDate: 'start_date', endDate: 'end_date', reason: 'reason' };

    Object.entries(map).forEach(([bodyKey, column]) => {
      if (fields[bodyKey] !== undefined) {
        updates.push(`${column} = ?`);
        params.push(fields[bodyKey]);
      }
    });

    if (updates.length === 0) {
      return next(new ApiError(400, 'No valid fields provided to update.'));
    }

    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    db.run(`UPDATE leaves SET ${updates.join(', ')} WHERE id = ?`, params);
    const updated = db.get('SELECT * FROM leaves WHERE id = ?', [req.params.id]);
    res.status(200).json({ success: true, message: 'Leave request updated.', data: updated });
  } catch (err) {
    next(err);
  }
}

/** DELETE /leaves/:id - employee cancels their OWN pending leave */
function deleteLeave(req, res, next) {
  try {
    const leave = db.get('SELECT * FROM leaves WHERE id = ?', [req.params.id]);
    if (!leave) return next(new ApiError(404, 'Leave request not found.'));
    if (leave.employee_id !== req.user.id) {
      return next(new ApiError(403, 'You can only cancel your own leave requests.'));
    }
    if (leave.status !== 'Pending') {
      return next(new ApiError(400, 'Only pending leave requests can be cancelled.'));
    }

    db.run("UPDATE leaves SET status = 'Cancelled', updated_at = datetime('now') WHERE id = ?", [req.params.id]);
    res.status(200).json({ success: true, message: 'Leave request cancelled.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createLeave, getLeaves, getLeaveById, updateLeave, deleteLeave };
