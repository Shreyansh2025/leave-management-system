const ApiError = require('../utils/ApiError');

/**
 * Wraps a Zod schema and validates req.body against it.
 * On failure, returns a 400 with field-level error details.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return next(new ApiError(400, 'Validation failed.', details));
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
