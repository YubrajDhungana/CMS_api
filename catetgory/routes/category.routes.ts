import Router from 'express';
import { CategoryController } from '../controller/category.controller';

const router = Router();

router.post('/',CategoryController.create);
router.get('/',CategoryController.list);
router.put('/:id',CategoryController.update);
router.delete('/:id',CategoryController.delete);

export default router;