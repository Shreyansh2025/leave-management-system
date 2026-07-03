const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

/** Verifies the Bearer token and attaches the decoded user to req.user */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required. Missing or malformed token.'));
  }

  const token = header.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token.'));
  }
}

/** Restricts a route to one or more roles, e.g. authorize('manager') */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required.'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
