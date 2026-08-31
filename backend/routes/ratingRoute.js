import express from "express";

import * as ratingController from "../controllers/ratingController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Set (add or update) a rating for a chef
router.put("/chef/:chefId", ratingController.setChefRating);

// Remove a rating for a chef
router.delete("/chef/:chefId", ratingController.deleteChefRating);

export default router;
