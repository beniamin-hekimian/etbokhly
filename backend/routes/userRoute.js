import express from 'express'
import * as authController from '../controllers/authController'
import * as userController from '../controllers/userController'
const router = express.Router()
//auth rooutes
router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgetpassword',authController.forgetPassword);
router.patch('/resetpassword/:token',authController.resetPassword);
router.patch('/updatepassword',authController.protect,authController.updatePassword)
//to all users
router.use(authController.protect);
router.route('/:id').get(userController.getUser)
.patch(userController.updateUser)
//only admins
router.use(authController.restrictToAdmin);
router.get('/',userController.getAllUsers)
router.route('/:id').delete(userController.deleteUser)
export default router;
