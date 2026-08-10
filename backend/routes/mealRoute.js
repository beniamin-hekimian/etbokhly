import express from 'express'
import * as mealController from '../controllers/mealController.js'
import { restrictToChef } from '../controllers/authController.js'
import { restrictToAdmin } from '../controllers/authController.js'
import { protect } from '../controllers/authController.js'
const router = express.Router()
router.use(protect);
router.use(restrictToChef);
router.route('/')
    .get(mealController.getAllMeals)
    .post(mealController.createMeal)

router.route('/:id')
    .get(mealController.getMeal)
    .patch(mealController.updateMeal)
    .delete(mealController.deleteMeal)

export default router;