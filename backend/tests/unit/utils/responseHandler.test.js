const { successResponse, errorResponse } = require('../../../src/utils/responseHandler');

describe('responseHandler', () => {
  describe('successResponse', () => {
    it('should return a standard success response with data', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const data = { id: 1, name: 'Test' };
      
      successResponse(res, 200, data, 'Operation successful');
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operation successful',
        data
      });
    });

    it('should work without message parameter', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const data = { id: 1 };
      
      successResponse(res, 200, data);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data
      });
    });

    it('should handle pagination metadata', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const data = [{ id: 1 }];
      const meta = { page: 1, total: 100 };
      
      successResponse(res, 200, data, 'Success', meta);
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data,
        meta
      });
    });
  });

  describe('errorResponse', () => {
    it('should return a standard error response', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      errorResponse(res, 400, 'Bad Request', 'Invalid input');
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Bad Request',
        error: 'Invalid input'
      });
    });

    it('should handle error details', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const details = { field: 'email', message: 'Required' };
      
      errorResponse(res, 422, 'Validation Error', 'Invalid email', details);
      
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation Error',
        error: 'Invalid email',
        details
      });
    });

    it('should default to 500 status and generic message', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      errorResponse(res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error',
        error: 'Something went wrong'
      });
    });
  });
});
