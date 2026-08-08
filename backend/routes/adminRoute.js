import express from 'express'
import * as authController from '../controllers/authController'
import * as adminController from '../controllers/adminController'
const router = express.Router()
router.use(authController.protect)
router.use(authController.restrictToAdmin)
router.get("/chefs",adminController.getChefRequests)
router.patch( "/chefs/:id/approve", adminController.approveChefRequest);
router.patch( "/chefs/:id/reject", adminController.rejectChefRequest);
export default router;