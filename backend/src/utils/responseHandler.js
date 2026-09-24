const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    errors: null
  });
};

const errorResponse = (res, message = 'Error', statusCode = 500, code = 'INTERNAL_ERROR', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    errors: errors || [{ code, description: message }]
  });
};

module.exports = {
  successResponse,
  errorResponse
};
