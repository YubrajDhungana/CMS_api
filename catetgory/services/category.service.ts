import {AppDataSource} from '../../configs/data-source'
import { Category } from '../../entities/category.entity'
import { paginate,Pagination,IPaginationOptions } from 'nestjs-typeorm-paginate';
import {Like } from 'typeorm'

const categoryRepository=AppDataSource.getRepository(Category);

export const CategoryService={
    async create(name:string,user_id:number,description?:string){
        const existing = await categoryRepository.findOneBy({name});
        if(existing) throw new Error('Category already exists');
    
        const category = categoryRepository.create({
            name,user_id,description
        })
    
        return await categoryRepository.save(category);
    },
    async getAll (filterOptions: {
        page?: number;
        limit?: number;
        name?: string;
        userId?: number;
    } = {}){
        const { 
            page=1,
            limit=10,
            name, 
            userId
        } = filterOptions;
        console.log("page",page);
        console.log("limit",limit);

        const where: any = {};
        
        if (name) {
            where.name = Like(`%${name}%`);
        }

         if (userId) {
            where.user_id = userId;
        }

      //create pagination options
      const options:IPaginationOptions={
        page,
        limit
      }

         // Create query builder
        const queryBuilder = categoryRepository.createQueryBuilder('category')
            .where(where)
            .andWhere('category.deleted_at IS NULL')
            .orderBy('category.created_at', 'DESC');

          // Use nestjs-typeorm-paginate
          return paginate<Category>(queryBuilder, options);
    },
    async update(id:number,name:string,description?:string){
        const category = await categoryRepository.findOneBy({id});
        if(!category) throw new Error('Category not found');
    
        if(name !==category.name){
            const existing = await categoryRepository.findOneBy({name});
             if(existing)throw new Error('Category already exists');
        }
    
        category.name=name;
        category.description=description;
        return await categoryRepository.save(category);
    
    },
    async delete(id:number){
        const category = await categoryRepository.findOne({
            where:{id},
            relations:['cards']
    
        });
        
        if(!category) throw new Error('Category not found');
        if(category.cards.length>0) throw new Error('Category having cards cannot be deleted');

        //set deleted_at to current data
        category.deleted_at= new Date();
        return await categoryRepository.save(category);
    }
}



