import express from 'express'
import * as authController from '../controllers/authController'
import * as userController from '../controllers/userController'
const router = express.Router()

router.get('/',userController.getAllUsers)
router.route('/:id').get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

//auth rooutes
router.post('/signup',authController.signup);
router.post('/login',authController.login)
export default router;