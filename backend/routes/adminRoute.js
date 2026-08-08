import express from 'express'
import * as authController from '../controllers/authController'
import * as adminController from '../controllers/adminController'
const router = express.Router()
router.use(authController.protect)
router.use(authController.restrictToAdmin)
router.get("/chefrequests",adminController.getChefRequests)
router.patch( "/chefrequests/:id/approve", adminController.approveChefRequest);
router.patch( "/chefrequests/:id/reject", adminController.rejectChefRequest);
export default router;