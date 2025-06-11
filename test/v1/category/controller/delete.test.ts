import { CategoryController } from '../../../../catetgory/controller/category.controller';
import { CategoryService } from '../../../../catetgory/services/category.service';
import { Request, Response } from 'express';

// Mock the CategoryService
jest.mock('../../../../catetgory/services/category.service');

describe('CategoryController - DELETE operations', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup mock response
    responseObject = {
      statusCode: 0,
      jsonData: null,
      sentData: null,
    };
    
    mockResponse = {
      status: jest.fn().mockImplementation((code) => {
        responseObject.statusCode = code;
        return mockResponse;
      }),
      json: jest.fn().mockImplementation((data) => {
        responseObject.jsonData = data;
        return mockResponse;
      }),
      send: jest.fn().mockImplementation((data) => {
        responseObject.sentData = data;
        return mockResponse;
      }),
    };
    
    mockRequest = {
      params: {}
    };
  });

  describe('delete method', () => {
    it('should delete a category and return status 200', async () => {
      // Mock request data
      mockRequest.params = { id: '1' };
      
      // Mock the expected result - typically the deleted category
      const deletedCategory = {
        id: 1,
        name: 'Deleted Category',
        description: 'Description',
        user_id: 1
      };
      
      // Mock the service method
      (CategoryService.delete as jest.Mock).mockResolvedValue(deletedCategory);
      
      // Call the controller method
      await CategoryController.delete(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(CategoryService.delete).toHaveBeenCalledWith(1);
      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonData).toEqual({
        message: "Category deleted successfully",
        result: deletedCategory
      });
    });

    it('should handle category not found error and return 404', async () => {
      // Mock request data
      mockRequest.params = { id: '999' };
      
      // Mock the service to throw an error
      const errorMessage = 'Category not found';
      (CategoryService.delete as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Call the controller method
      await CategoryController.delete(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(CategoryService.delete).toHaveBeenCalledWith(999);
      expect(responseObject.statusCode).toBe(404);
      expect(responseObject.sentData).toEqual({ message: errorMessage });
    });

    it('should handle category with cards error and return 409', async () => {
      // Mock request data
      mockRequest.params = { id: '1' };
      
      // Mock the service to throw an error
      const errorMessage = 'Category having cards cannot be deleted';
      (CategoryService.delete as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Call the controller method
      await CategoryController.delete(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(CategoryService.delete).toHaveBeenCalledWith(1);
      expect(responseObject.statusCode).toBe(409);
      expect(responseObject.sentData).toEqual({ message: errorMessage });
    });

    it('should handle unexpected errors and return 500', async () => {
      // Mock request data
      mockRequest.params = { id: '1' };
      
      // Mock the service to throw an error
      const errorMessage = 'Unexpected database error';
      (CategoryService.delete as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Call the controller method
      await CategoryController.delete(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(CategoryService.delete).toHaveBeenCalledWith(1);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(responseObject.statusCode).toBe(500);
      expect(responseObject.sentData).toEqual({ message: 'Internal Server Error' });
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});