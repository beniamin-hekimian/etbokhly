/*import express from 'express'
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
//router.route('/createmeal').post(mealController.requestMeal)
router.post( "/uploadphoto", upload.single("photo"), mealController.uploadMealPhoto );
router.post("/createmeal", mealController.requestMeal);

router.route('/getcreatemealstatus').get(mealController.getMealRequestStatus)
router.route('/:id')
    .get(mealController.getMeal)
    .patch(mealController.updateMeal)
    .delete(mealController.deleteMeal)

export default router;*/

import express from "express";

import * as mealController from "../controllers/mealController.js";

import {
  protect,
  restrictToChef,
} from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

router.use(restrictToChef);


// Get all meals
router.route("/").get(mealController.getAllMeals);


// Upload meal photo
router.post(  "/uploadphoto",mealController.upload.single("photo"),mealController.uploadMealPhoto);


// Submit meal request
router.post("/createmeal",mealController.requestMeal);

router.delete('/:id',mealController.deleteMeal)
// Get meal request status
router.get(
  "/getcreatemealstatus",
  mealController.getMealRequestStatus
);

// Meal by ID
router
  .route("/:id")
  .get(mealController.getMeal)

export default router;
