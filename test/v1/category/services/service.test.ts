// First, mock the dependencies before importing anything that uses them
jest.mock('../../../../configs/data-source', () => {
  return {
    AppDataSource: {
      getRepository: jest.fn().mockReturnValue({
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn()
      })
    }
  };
});

// Mock the paginate function
jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn()
}));

// Now import the modules that use the mocked dependencies
import { CategoryService } from '../../../../catetgory/services/category.service';
import { AppDataSource } from '../../../../configs/data-source';
import { Category } from '../../../../entities/category.entity';
import { Like } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';

// Get the mocked repository from AppDataSource
const categoryRepository = AppDataSource.getRepository(Category);

describe('CategoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create method', () => {
    it('should create a new category when it does not exist', async () => {
      // Mock repository methods
      (categoryRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      (categoryRepository.create as jest.Mock).mockReturnValue({
        name: 'Test Category',
        user_id: 1,
        description: 'Test Description'
      });
      (categoryRepository.save as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category',
        user_id: 1,
        description: 'Test Description',
        created_at: new Date(),
        updated_at: new Date()
      });

      // Call the service method
      const result = await CategoryService.create('Test Category', 1, 'Test Description');

      // Assertions
      expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ name: 'Test Category' });
      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: 'Test Category',
        user_id: 1,
        description: 'Test Description'
      });
      expect(categoryRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Test Category');
    });

    it('should throw an error if category already exists', async () => {
      // Mock repository to return an existing category
      (categoryRepository.findOneBy as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Test Category'
      });

      // Call the service method and expect it to throw
      await expect(CategoryService.create('Test Category', 1))
        .rejects.toThrow('Category already exists');

      // Verify repository was called but not save
      expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ name: 'Test Category' });
      expect(categoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getAll method', () => {
    it('should return paginated categories', async () => {
      // Mock query builder
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis()
      };
      
      (categoryRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);
      
      // Mock paginate function
      const expectedResult = {
        items: [
          { id: 1, name: 'Category 1' },
          { id: 2, name: 'Category 2' }
        ],
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1
        }
      };
      
      (paginate as jest.Mock).mockResolvedValue(expectedResult);

      // Call the service method
      const result = await CategoryService.getAll({ page: 1, limit: 10, name: 'test' });

      // Assertions
      expect(categoryRepository.createQueryBuilder).toHaveBeenCalledWith('category');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ name: Like('%test%') });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('category.created_at', 'DESC');
      expect(paginate).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update method', () => {
    it('should update a category when it exists', async () => {
      // Mock repository methods
      const existingCategory = {
        id: 1,
        name: 'Old Name',
        description: 'Old Description'
      };
      
      (categoryRepository.findOneBy as jest.Mock).mockResolvedValueOnce(existingCategory);
      (categoryRepository.findOneBy as jest.Mock).mockResolvedValueOnce(null); // No duplicate name
      (categoryRepository.save as jest.Mock).mockResolvedValue({
        ...existingCategory,
        name: 'New Name',
        description: 'New Description'
      });

      // Call the service method
      const result = await CategoryService.update(1, 'New Name', 'New Description');

      // Assertions
      expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(categoryRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('New Name');
      expect(result.description).toBe('New Description');
    });

    it('should throw an error if category does not exist', async () => {
      // Mock repository to return null (category not found)
      (categoryRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(CategoryService.update(999, 'New Name'))
        .rejects.toThrow('Category not found');

      // Verify repository was called
      expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(categoryRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if new name already exists', async () => {
      // Mock repository methods
      const existingCategory = {
        id: 1,
        name: 'Old Name',
        description: 'Old Description'
      };
      
      const duplicateCategory = {
        id: 2,
        name: 'New Name'
      };
      
      (categoryRepository.findOneBy as jest.Mock).mockResolvedValueOnce(existingCategory);
      (categoryRepository.findOneBy as jest.Mock).mockResolvedValueOnce(duplicateCategory);

      // Call the service method and expect it to throw
      await expect(CategoryService.update(1, 'New Name'))
        .rejects.toThrow('Category already exists');

      // Verify repository was called
      expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ name: 'New Name' });
      expect(categoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete method', () => {
    it('should delete a category when it exists and has no cards', async () => {
      // Mock repository methods
      const existingCategory = {
        id: 1,
        name: 'Test Category',
        cards: [],
        deleted_at: null
      };
      
      (categoryRepository.findOne as jest.Mock).mockResolvedValue(existingCategory);
      (categoryRepository.save as jest.Mock).mockResolvedValue(existingCategory);

      // Call the service method
      const result = await CategoryService.delete(1);

      // Assertions
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['cards']
      });
      expect(categoryRepository.save).toHaveBeenCalledWith(existingCategory);
      expect(result).toEqual(existingCategory);
    });

    it('should throw an error if category does not exist', async () => {
      // Mock repository to return null (category not found)
      (categoryRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(CategoryService.delete(999))
        .rejects.toThrow('Category not found');

      // Verify repository was called
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['cards']
      });
      expect(categoryRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if category has cards', async () => {
      // Mock repository to return category with cards
      const categoryWithCards = {
        id: 1,
        name: 'Test Category',
        cards: [{ id: 1, title: 'Card 1' }]
      };
      
      (categoryRepository.findOne as jest.Mock).mockResolvedValue(categoryWithCards);

      // Call the service method and expect it to throw
      await expect(CategoryService.delete(1))
        .rejects.toThrow('Category having cards cannot be deleted');

      // Verify repository was called
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['cards']
      });
      expect(categoryRepository.save).not.toHaveBeenCalled();
    });
  });
});