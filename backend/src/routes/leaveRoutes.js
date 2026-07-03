const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createLeaveSchema, updateLeaveSchema } = require('../utils/schemas');
const {
  createLeave,
  getLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
} = require('../controllers/leaveController');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('employee'), validate(createLeaveSchema), createLeave);
router.get('/', getLeaves); // employees see own; managers see all
router.get('/:id', getLeaveById);
router.put('/:id', authorize('employee'), validate(updateLeaveSchema), updateLeave);
router.delete('/:id', authorize('employee'), deleteLeave);

module.exports = router;
