import { CategoryService } from "../services/category.service";
import {Request,Response} from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateCategoryDto} from "../../dto/create-category.dto";
import { UpdateCategoryDto } from "../../dto/update-category.dto";

export const CategoryController={
    async create(req:Request,res:Response):Promise<void>{
        try{
            // const {name,user_id,description} = req.body;
            const dto = plainToClass(CreateCategoryDto, req.body);
            const errors = await validate(dto);
             if (errors.length > 0) {
            const errorMessages = errors.map(err => Object.values(err.constraints || {})).flat();
            res.status(400).json({ error: 'Validation failed', details: errorMessages });
            return;
            }
            
            const { name, user_id, description } = dto;
            const result = await CategoryService.create(name,user_id,description);
             res.status(201).json(result);
             return;
        }catch(err:string | any){
             res.status(400).json({error:err.message});
             return
        }
    },
    async list(req:Request,res:Response){
        try{
            // Extract pagination parameters from query
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.per_page as string) || 10;

            // Filter options
            const name = req.query.name as string | undefined;
            const userId = req.query.user_id ? parseInt(req.query.user_id as string) : undefined;

              const result = await CategoryService.getAll({
                page,
                limit,
                name,
                userId
            });

             res.status(200).json({
                 data:result.items,
                 meta:{
                     page:result.meta.currentPage,
                     per_page:result.meta.itemsPerPage,
                     total_pages:result.meta.totalPages,
                     total:result.meta.totalItems,
                 }

             });
             return
        }catch(err:string | any){
            console.log(err);//console log the error
             res.status(400).json({error:err.message});
             return
        }
    },
    async update(req:Request,res:Response){
        try{
            const id = Number(req.params.id);
            if (isNaN(id)) throw new Error('ID must be a number');

            const dto = plainToClass(UpdateCategoryDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                res.status(400).json({ error: 'Validation failed', details: errors });
                return;
            }

            const {name,description}=req.body;
            const result = await CategoryService.update(Number(id),name,description);
            res.status(200).json({message:"Category updated successfully",result});
        }catch(err:string | any){
            if(err.message === 'Category not found'){
                res.status(404).json({error:err.message});
                return 
            }
            if(err.message === 'Category already exists'){
                 res.status(409).json({error:err.message});
                 return
            }
             res.status(400).json({error:err.message});
             return
        }
    },
    async delete(req:Request,res:Response){
        try{
            
            const id = Number(req.params.id);
            if (isNaN(id)) throw new Error('ID must be a number');

            const result = await CategoryService.delete(Number(id));
            res.status(200).json({message:"Category deleted successfully",result});
            return 
        }catch(error:string | any){
            if (error.message === 'Category not found') {
                res.status(404).send({ message: error.message });
                return;
              } else if (error.message === 'Category having cards cannot be deleted') {
                res.status(409).send({ message: error.message });
                return;
              }else if (error.message === 'ID must be a number') {
                res.status(400).send({ message: error.message });
                return;
              } else {
                // Handle other unexpected errors
                console.error(error); // Log the error
                res.status(500).send({ message: 'Internal Server Error' });
                return;
              }
        }
    }
}