import { CategoryController } from '../../../../catetgory/controller/category.controller';
import { CategoryService } from '../../../../catetgory/services/category.service';
import { Request, Response } from 'express';

// Mock the CategoryService
jest.mock('../../../../catetgory/services/category.service');

describe('CategoryController - GET operations', () => {
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

    // Mock request with query parameters
    mockRequest = {
      query: {
        page: '1',
        limit: '10',
        name: 'test'
      }
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
    
  });

  describe('list method', () => {
    it('should return all categories with status 200', async () => {
      // Mock data
      const expectedCategories = [
        { 
          id: 1, 
          name: 'Category 1', 
          description: 'Description 1', 
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          cards: []
        },
        { 
          id: 2, 
          name: 'Category 2', 
          description: 'Description 2',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          cards: []
        }
      ];
      
      // Mock the service method
      (CategoryService.getAll as jest.Mock).mockResolvedValue({
        items: expectedCategories,
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 2,
          totalPages: 1
        }

      });
      
      // Call the controller method
      await CategoryController.list(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      expect(CategoryService.getAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        name: 'test',
        userId: undefined
      });
      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonData).toEqual({
        data:expectedCategories,
        meta: {
          page: 1,
          per_page: 10,
          total_pages: 1,
          total: 2
        }

      });
    });

    it('should handle errors and return status 400', async () => {
      // Mock the service to throw an error
      const errorMessage = 'Database error';
      (CategoryService.getAll as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Call the controller method
      await CategoryController.list(mockRequest as Request, mockResponse as Response);
      
      // Assertions
      // Assertions
      expect(CategoryService.getAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        name: 'test',
        userId: undefined
      });
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(responseObject.statusCode).toBe(400);
      expect(responseObject.jsonData).toEqual({ error: errorMessage });
      
      // Restore console.log
      consoleLogSpy.mockRestore();
    });
  });
});