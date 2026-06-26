import express from 'express'
import * as authController from '../controllers/authController'
import * as userController from '../controllers/userController'
const router = express.Router()
//auth rooutes
router.get('/',userController.getAllUsers)
router.route('/:id').get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)


router.post('/signup',authController.signup);

export default router;