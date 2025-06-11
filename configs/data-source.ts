import {DataSource} from 'typeorm'
import {Category} from '../entities/category.entity';
import dotenv from 'dotenv';
import { Card } from '../entities/card.entity';

dotenv.config();

export const AppDataSource = new DataSource({
    type:'mysql',
    host:process.env.DB_HOST,
    port:Number(process.env.DB_PORT),
    username:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    synchronize:true,
    logging:true,
    entities:[Category,Card],
    migrations:[]
})


