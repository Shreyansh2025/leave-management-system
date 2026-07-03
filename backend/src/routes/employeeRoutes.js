const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getEmployees,
  getEmployeeById,
  getEmployeeDashboard,
  getManagerDashboard,
} = require('../controllers/employeeController');

const router = express.Router();

router.use(authenticate);

router.get('/employees', authorize('manager'), getEmployees);
router.get('/employees/:id', getEmployeeById);

router.get('/dashboard/employee', authorize('employee'), getEmployeeDashboard);
router.get('/dashboard/manager', authorize('manager'), getManagerDashboard);

module.exports = router;
