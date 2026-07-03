const db = require('../config/db');
const ApiError = require('../utils/ApiError');

/** GET /pending-leaves - manager only */
function getPendingLeaves(req, res, next) {
  try {
    const leaves = db.all(
      `SELECT leaves.*, employees.name AS employee_name, employees.department
       FROM leaves JOIN employees ON employees.id = leaves.employee_id
       WHERE leaves.status = 'Pending'
       ORDER BY leaves.created_at ASC`
    );
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
}

function reviewLeave(status) {
  return (req, res, next) => {
    try {
      const leave = db.get('SELECT * FROM leaves WHERE id = ?', [req.params.id]);
      if (!leave) return next(new ApiError(404, 'Leave request not found.'));
      if (leave.status !== 'Pending') {
        return next(new ApiError(400, `This request has already been ${leave.status.toLowerCase()}.`));
      }

      const { comments } = req.body;

      db.run(
        `UPDATE leaves
         SET status = ?, manager_comments = ?, reviewed_by = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [status, comments || null, req.user.id, req.params.id]
      );

      const updated = db.get('SELECT * FROM leaves WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: `Leave request ${status.toLowerCase()}.`, data: updated });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  getPendingLeaves,
  approveLeave: reviewLeave('Approved'),
  rejectLeave: reviewLeave('Rejected'),
};
