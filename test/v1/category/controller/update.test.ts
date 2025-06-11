import { CategoryController } from '../../../../catetgory/controller/category.controller';
import { CategoryService} from '../../../../catetgory/services/category.service';
import { Request, Response } from 'express';

// Mock the CategoryService
jest.mock('../../../../catetgory/services/category.service');

describe('CategoryController - PUT operations', () => {
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
    };
    
    mockRequest = {
      params: {},
      body: {}
    };
  });

  describe('update method', () => {
    it('should update a category and return status 200', async () => {
      // Mock request data
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Updated Category',
        description: 'Updated Description'
      };
      
      // Mock the expected result
      const expectedResult = {
        id: 1,
        name: 'Updated Category',
        description: 'Updated Description',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Mock the service method
      (CategoryService.update as jest.Mock).mockResolvedValue(expectedResult);
      
      // Call the controller method
      await CategoryController.update(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(CategoryService.update).toHaveBeenCalledWith(
        1,
        mockRequest.body.name,
        mockRequest.body.description
      );
      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonData).toEqual({
        message: "Category updated successfully",
        result: expectedResult
      });
    });

    it('should handle category not found error and return 404', async () => {
      // Mock request data
      mockRequest.params = { id: '999' };
      mockRequest.body = {
        name: 'Non-existent Category',
        description: 'Description'
      };
      
      // Mock the service to throw an error
      const errorMessage = 'Category not found';
      (CategoryService.update as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Call the controller method
      await CategoryController.update(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(CategoryService.update).toHaveBeenCalledWith(
        999,
        mockRequest.body.name,
        mockRequest.body.description
      );
      expect(responseObject.statusCode).toBe(404);
      expect(responseObject.jsonData).toEqual({ error: errorMessage });
    });

    it('should handle duplicate category error and return 409', async () => {
      // Mock request data
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Existing Category',
        description: 'Description'
      };
      
      // Mock the service to throw an error
      const errorMessage = 'Category already exists';
      (CategoryService.update as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Call the controller method
      await CategoryController.update(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(CategoryService.update).toHaveBeenCalledWith(
        1,
        mockRequest.body.name,
        mockRequest.body.description
      );
      expect(responseObject.statusCode).toBe(409);
      expect(responseObject.jsonData).toEqual({ error: errorMessage });
    });

    it('should handle other errors and return 400', async () => {
      // Mock request data
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        name: 'Problem Category',
        description: 'Description'
      };
      
      // Mock the service to throw an error
      const errorMessage = 'Some other error';
      (CategoryService.update as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Call the controller method
      await CategoryController.update(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(responseObject.statusCode).toBe(400);
      expect(responseObject.jsonData).toEqual({ error: errorMessage });
    });
  });
});