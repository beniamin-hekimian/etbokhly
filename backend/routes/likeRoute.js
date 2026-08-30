import express from "express";

import * as likeController from "../controllers/likeController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Get my liked meals
router.get("/", likeController.getMyLikes);

// Like a meal
router.post("/:mealId", likeController.addLike);

// Unlike a meal
router.delete("/:mealId", likeController.removeLike);

export default router;