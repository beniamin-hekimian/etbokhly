import express from "express";

import * as followController from "../controllers/followController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Get chefs I follow
router.get("/following", followController.getMyFollowing);

// Follow a chef
router.post("/:chefId", followController.addFollow);

// Unfollow a chef
router.delete("/:chefId", followController.removeFollow);

export default router;