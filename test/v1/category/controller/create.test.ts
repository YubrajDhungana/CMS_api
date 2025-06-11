import { CategoryController } from '../../../../catetgory/controller/category.controller';
import { CategoryService } from '../../../../catetgory/services/category.service';
import { Request, Response } from 'express';

// Mock the CategoryService
jest.mock('../../../../catetgory/services/category.service');

describe('CategoryController - POST operations', () => {
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
      body: {}
    };
  });

  describe('create method', () => {
    it('should create a category and return status 201', async () => {
      // Mock request data
      mockRequest.body = {
        name: 'New Category',
        user_id: 1,
        description: 'Test Description'
      };
      
      // Mock the expected result
      const expectedResult = {
        id: 1,
        name: 'New Category',
        user_id: 1,
        description: 'Test Description',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Mock the service method
      (CategoryService.create as jest.Mock).mockResolvedValue(expectedResult);
      
      // Call the controller method
      await CategoryController.create(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(CategoryService.create).toHaveBeenCalledWith(
        mockRequest.body.name,
        mockRequest.body.user_id,
        mockRequest.body.description
      );
      expect(responseObject.statusCode).toBe(201);
      expect(responseObject.jsonData).toEqual(expectedResult);
    });

    it('should handle duplicate category error and return 400', async () => {
      // Mock request data
      mockRequest.body = {
        name: 'Existing Category',
        user_id: 1
      };
      
      // Mock the service to throw an error
      const errorMessage = 'Category already exists';
      (CategoryService.create as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Call the controller method
      await CategoryController.create(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(CategoryService.create).toHaveBeenCalledWith(
        mockRequest.body.name,
        mockRequest.body.user_id,
        undefined
      );
      expect(responseObject.statusCode).toBe(400);
      expect(responseObject.jsonData).toEqual({ error: errorMessage });
    });
  });
});