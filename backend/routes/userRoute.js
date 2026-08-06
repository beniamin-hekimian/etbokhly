import express from 'express'
import * as authController from '../controllers/authController'
import * as userController from '../controllers/userController'
import * as profileController from '../controllers/profileController'
const router = express.Router()

//auth rooutes
router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgetpassword',authController.forgetPassword);
router.patch('/resetpassword/:token',authController.resetPassword);

//protetcetd routes
router.use(authController.protect);
//Profile
router.get('/profile',authController.protect,userController.getMe,userController.getUser);

//User
router.patch('/updatepassword',authController.protect,authController.updatePassword)
router.get('/logout',authController.protect,authController.logout);
router.get('/me', authController.protect,userController.getMe, userController.getUser);
router.route('/:id').get(userController.getUser)
.patch(userController.updateUser)
//only admins
router.use(authController.restrictToAdmin);
router.get('/',userController.getAllUsers)
router.route('/:id').delete(userController.deleteUser)
export default router;
