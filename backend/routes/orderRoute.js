import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { protect, restrictToAdmin } from '../controllers/authController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(orderController.getAllOrders)
    .post(orderController.createOrder);

router.get('/cart', orderController.getAllCartOrders);

router.get('/me', orderController.getMyOrders);
router.get('/chef', orderController.getChefOrders);

router.route('/:id')
    .get(orderController.getOrder);

router.patch('/:id/status', restrictToAdmin, orderController.updateOrderStatus);

export default router;
