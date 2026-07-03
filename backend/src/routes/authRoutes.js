const express = require('express');
const { login, logout } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { loginSchema } = require('../utils/schemas');

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

module.exports = router;
