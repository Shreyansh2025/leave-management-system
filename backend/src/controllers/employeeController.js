const db = require('../config/db');
const ApiError = require('../utils/ApiError');

/** GET /employees - manager only, supports ?search=&department= */
function getEmployees(req, res, next) {
  try {
    const { search, department } = req.query;
    let sql = "SELECT id, name, email, department, role, created_at FROM employees WHERE role = 'employee'";
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }
    sql += ' ORDER BY name ASC';

    const employees = db.all(sql, params);
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
}

/** GET /employees/:id */
function getEmployeeById(req, res, next) {
  try {
    const { id } = req.params;

    // Employees may only view their own profile; managers can view anyone.
    if (req.user.role === 'employee' && Number(id) !== req.user.id) {
      return next(new ApiError(403, 'You can only view your own profile.'));
    }

    const employee = db.get(
      'SELECT id, name, email, department, role, manager_id, created_at, updated_at FROM employees WHERE id = ?',
      [id]
    );
    if (!employee) return next(new ApiError(404, 'Employee not found.'));

    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

/** GET /dashboard/employee - stats for the logged-in employee */
function getEmployeeDashboard(req, res, next) {
  try {
    const employeeId = req.user.id;

    const totals = db.get(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected
       FROM leaves WHERE employee_id = ?`,
      [employeeId]
    );

    const recent = db.all(
      'SELECT * FROM leaves WHERE employee_id = ? ORDER BY created_at DESC LIMIT 5',
      [employeeId]
    );

    res.status(200).json({
      success: true,
      data: {
        totalLeaveRequests: totals.total || 0,
        approved: totals.approved || 0,
        pending: totals.pending || 0,
        rejected: totals.rejected || 0,
        recentActivity: recent,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /dashboard/manager - org-wide stats for managers */
function getManagerDashboard(req, res, next) {
  try {
    const totalEmployees = db.get("SELECT COUNT(*) AS count FROM employees WHERE role = 'employee'");
    const totals = db.get(
      `SELECT
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected
       FROM leaves`
    );
    const recent = db.all(
      `SELECT leaves.*, employees.name AS employee_name
       FROM leaves JOIN employees ON employees.id = leaves.employee_id
       ORDER BY leaves.updated_at DESC LIMIT 5`
    );

    res.status(200).json({
      success: true,
      data: {
        totalEmployees: totalEmployees.count || 0,
        pendingApprovals: totals.pending || 0,
        approved: totals.approved || 0,
        rejected: totals.rejected || 0,
        recentActivity: recent,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEmployees, getEmployeeById, getEmployeeDashboard, getManagerDashboard };
