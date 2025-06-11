import express from 'express';
import categoryRoutes from './catetgory/routes/category.routes';
import dotenv from 'dotenv';
import { AppDataSource } from './configs/data-source';
dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/category', categoryRoutes);
AppDataSource.initialize()
.then(()=>{
    console.log('Database connected');
    app.listen(process.env.PORT,()=>console.log(`Server is running on port ${process.env.PORT}`));
})
.catch(error => console.error("DB connection error:", error));

