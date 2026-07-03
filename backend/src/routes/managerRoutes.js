const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { reviewLeaveSchema } = require('../utils/schemas');
const { getPendingLeaves, approveLeave, rejectLeave } = require('../controllers/managerController');

const router = express.Router();

router.use(authenticate, authorize('manager'));

router.get('/pending-leaves', getPendingLeaves);
router.put('/leaves/:id/approve', validate(reviewLeaveSchema), approveLeave);
router.put('/leaves/:id/reject', validate(reviewLeaveSchema), rejectLeave);

module.exports = router;
