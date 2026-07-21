import express from 'express'
import * as mealController from '../controllers/mealController.js'
const router = express.Router()

router.route('/')
    .get(mealController.getAllMeals)
    .post(mealController.createMeal)

router.route('/:id')
    .get(mealController.getMeal)
    .patch(mealController.updateMeal)
    .delete(mealController.deleteMeal)

export default router;