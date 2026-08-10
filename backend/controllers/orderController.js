import { prisma } from '../lib/prisma';
import catchAsync from '../utils/catchAsync.js';
import appError from '../utils/appError.js';

const getOrderScope = (req) =>
    req.user?.role === 'ADMIN' ? {} : { userId: req.user.id };

export const getAllOrders = catchAsync(async (req, res, next) =>
{
    const orders = await prisma.order.findMany({
        where: getOrderScope(req),
        include: { items: true },
        orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders,
    });
});

export const getMyOrders = catchAsync(async (req, res, next) =>
{
    const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders,
    });
});

export const getChefOrders = catchAsync(async (req, res, next) =>
{
    if (req.user.role !== 'CHEF')
        return next(new appError('Only chefs can access this route.', 403));

    const chefMeals = await prisma.meal.findMany({
        where: { user_id: req.user.id },
        select: { id: true },
    });

    const mealIds = chefMeals.map((meal) => meal.id);

    const orders = await prisma.order.findMany({
        where: {
            items: {
                some: {
                    mealId: { in: mealIds },
                },
            },
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders,
    });
});

export const getOrder = catchAsync(async (req, res, next) =>
{
    const { id } = req.params;

    if (!id)
        return next(new appError('Please provide an order id!', 400));

    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
    });

    if (!order)
        return next(new appError('Order not found!', 404));

    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id)
        return next(new appError('You are not allowed to access this order.', 403));

    res.status(200).json({
        status: 'success',
        data: order,
    });
});

export const createOrder = catchAsync(async (req, res, next) =>
{
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0)
        return next(new appError('Please provide at least one order item.', 400));

    const normalizedItems = items.map((item) => ({
        mealId: item.mealId ?? item.meal_id,
        quantity: Number(item.quantity ?? 1),
    }));

    if (normalizedItems.some((item) => !item.mealId || item.quantity < 1))
        return next(new appError('Each item must include a valid mealId and quantity.', 400));

    const mealIds = normalizedItems.map((item) => item.mealId);
    const meals = await prisma.meal.findMany({
        where: { id: { in: mealIds } },
    });

    const mealMap = new Map(meals.map((meal) => [meal.id, meal]));

    for (const item of normalizedItems)
    {
        if (!mealMap.has(item.mealId))
            return next(new appError(`Meal ${item.mealId} was not found.`, 404));
    }

    let total = 0;
    const orderItemsData = normalizedItems.map((item) =>
    {
        const meal = mealMap.get(item.mealId);
        const price = Number(meal.price.toString());
        total += price * item.quantity;

        return {
            mealId: item.mealId,
            mealName: meal.title,
            price: Number(price.toFixed(2)),
            quantity: item.quantity,
        };
    });

    const order = await prisma.order.create({
        data: {
            userId: req.user.id,
            total: Number(total.toFixed(2)),
            items: {
                create: orderItemsData,
            },
        },
        include: { items: true },
    });

    res.status(201).json({
        status: 'success',
        data: order,
    });
});

export const updateOrderStatus = catchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const { status } = req.body;

    if (!id)
        return next(new appError('Please provide an order id!', 400));

    if (!status)
        return next(new appError('Please provide a status!', 400));

    if (req.user.role !== 'ADMIN')
        return next(new appError('Only admins can update order status.', 403));

    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status))
        return next(new appError('Invalid order status.', 400));

    const order = await prisma.order.update({
        where: { id },
        data: { status },
        include: { items: true },
    });

    res.status(200).json({
        status: 'success',
        data: order,
    });
});
