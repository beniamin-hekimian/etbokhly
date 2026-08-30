import express from "express";
import * as homeController from "../controllers/homeController.js";
import { optionalProtect } from "../controllers/authController.js";

const router = express.Router();

router.get("/", optionalProtect, homeController.getHomeData);

export default router;
