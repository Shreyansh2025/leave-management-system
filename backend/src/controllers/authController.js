const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const employee = db.get('SELECT * FROM employees WHERE email = ?', [email]);
    if (!employee) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    const token = signToken({ id: employee.id, email: employee.email, role: employee.role });

    const { password: _pw, ...safeEmployee } = employee;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { token, user: safeEmployee },
    });
  } catch (err) {
    next(err);
  }
}

// JWTs are stateless, so "logout" is handled client-side by discarding the token.
// This endpoint exists for API completeness / future blacklist-based invalidation.
function logout(req, res) {
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

module.exports = { login, logout };
