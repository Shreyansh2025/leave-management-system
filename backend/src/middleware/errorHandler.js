const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || undefined,
    });
  }

  // Unexpected error - log full detail server-side, hide internals from client
  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.',
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
}

module.exports = { errorHandler, notFound };
