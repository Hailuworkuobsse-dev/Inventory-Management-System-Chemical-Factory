const AppError = require('../../../src/utils/appError');

describe('AppError', () => {
  it('should create an error with message, statusCode, and isOperational flag', () => {
    const error = new AppError('Resource not found', 404);
    
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
    expect(error.status).toBe('fail');
  });

  it('should set status to "fail" for 4xx errors', () => {
    const error = new AppError('Bad request', 400);
    expect(error.status).toBe('fail');
  });

  it('should set status to "error" for 5xx errors', () => {
    const error = new AppError('Internal server error', 500);
    expect(error.status).toBe('error');
  });

  it('should default to 500 if no statusCode provided', () => {
    const error = new AppError('Something went wrong');
    expect(error.statusCode).toBe(500);
  });

  it('should include stack trace in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const error = new AppError('Test error', 400);
    expect(error.stack).toBeDefined();
    
    process.env.NODE_ENV = originalEnv;
  });
});
