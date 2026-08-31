import express from "express";

import * as mealController from "../controllers/mealController.js";
import * as chefController from "../controllers/chefController.js"
import * as followController from "../controllers/followController.js"
import * as authController from '../controllers/authController'
const router = express.Router();

// Public routes - no auth required
router.get("/profile/:id", authController.optionalProtect, chefController.getPublicChefProfile);
router.get("/profile/:id/followers", authController.optionalProtect, followController.getChefFollowers);
router.get("/profile/:id/following", authController.optionalProtect, followController.getChefFollowing);

router.use(authController.protect);

router.use(authController.restrictToChef);

// Upload meal photo
router.post(  "/uploadphoto",chefController.upload.single("photo"),chefController.uploadMealPhoto);
// Submit meal request
router.post("/createmeal",chefController.requestMeal);
router.patch('/:id',chefController.updateMeal)
router.delete('/:id',chefController.deleteMeal)
// Get meal request status
router.get(
  "/getcreatemealstatus",
  chefController.getMealRequestStatus
);

export default router;