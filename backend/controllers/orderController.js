import { prisma } from '../lib/prisma';
import catchAsync from '../utils/catchAsync.js';
import appError from '../utils/appError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const ACTIVE_ORDER_STATUSES = ['pending', 'accepted'];
const PREVIOUS_ORDER_STATUSES = ['rejected', 'delivered'];
const CHEF_ALLOWED_ACTIONS = {
    accept: { from: 'pending', to: 'accepted' },
    reject: { from: 'pending', to: 'rejected' },
    deliver: { from: 'accepted', to: 'delivered' },
};

const orderInclude = {
    user: {
        select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            profile_image: true,
            location: true,
        },
    },
    chef: {
        select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            profile_image: true,
            location: true,
        },
    },
    items: {
        include: {
            meal: {
                select: {
                    id: true,
                    title: true,
                    photo: true,
                    price: true,
                    user_id: true,
                },
            },
        },
    },
};

const toMoney = (value) => Number(Number(value).toFixed(2));

const getOrderTotal = (items) =>
    toMoney(
        items.reduce((sum, item) =>
            sum + Number(item.price.toString()) * item.quantity, 0)
    );

const getCurrentOrderTotal = (items) =>
    toMoney(
        items.reduce((sum, item) =>
            sum + Number(item.meal.price.toString()) * item.quantity, 0)
    );

const getOrdersTotal = (orders, useCurrentMealPrice = false) =>
    toMoney(
        orders.reduce((sum, order) =>
            sum + (useCurrentMealPrice ? getCurrentOrderTotal(order.items) : Number(order.total.toString())), 0)
    );

const normalizeItems = (items) => {
    if (!Array.isArray(items) || items.length === 0)
        throw new appError('Please provide at least one order item.', 400);

    const itemMap = new Map();

    for (const item of items)
    {
        const mealId = item.mealId ?? item.meal_id;
        const quantity = Number(item.quantity ?? 1);

        if (!mealId || !Number.isInteger(quantity) || quantity < 1)
            throw new appError('Each item must include a valid mealId and quantity.', 400);

        itemMap.set(mealId, (itemMap.get(mealId) ?? 0) + quantity);
    }

    return Array.from(itemMap, ([mealId, quantity]) => ({ mealId, quantity }));
};

const getApprovedMealsById = async (items) => {
    const mealIds = items.map((item) => item.mealId);
    const meals = await prisma.meal.findMany({
        where: {
            id: { in: mealIds },
        },
        select: {
            id: true,
            title: true,
            price: true,
            user_id: true,
            mealRequestStatus: true,
        },
    });

    const mealMap = new Map(meals.map((meal) => [meal.id, meal]));

    for (const item of items)
    {
        const meal = mealMap.get(item.mealId);

        if (!meal)
            throw new appError(`Meal ${item.mealId} was not found.`, 404);

        if (meal.mealRequestStatus !== 'APPROVED')
            throw new appError(`Meal ${item.mealId} is not available for orders.`, 400);
    }

    return mealMap;
};

const groupItemsByChef = (items, mealMap) => {
    const groups = new Map();

    for (const item of items)
    {
        const meal = mealMap.get(item.mealId);
        const chefId = meal.user_id;
        const groupItems = groups.get(chefId) ?? [];

        groupItems.push({
            meal,
            quantity: item.quantity,
        });

        groups.set(chefId, groupItems);
    }

    return groups;
};

const getCartOrders = async (userId, tx = prisma) =>
    tx.order.findMany({
        where: {
            userId,
            paymentStatus: 'unpaid',
        },
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
    });

const getPaidOrders = async (where, pagination) => {
    const query = {
        where: { paymentStatus: 'paid', ...where },
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
    };
    if (pagination) {
        query.skip = pagination.skip;
        query.take = pagination.limit;
    }
    const [orders, total] = await Promise.all([
        prisma.order.findMany(query),
        pagination ? prisma.order.count({ where: query.where }) : Promise.resolve(null),
    ]);
    return { orders, total };
};

const ensureChefOwnsPaidOrder = async (req, id, next) => {
    if (req.user.role !== 'CHEF')
        return next(new appError('Only chefs can update this order.', 403));

    const order = await prisma.order.findUnique({
        where: { id },
        include: orderInclude,
    });

    if (!order)
        return next(new appError('Order not found!', 404));

    if (order.chefId !== req.user.id)
        return next(new appError('You are not allowed to update this order.', 403));

    if (order.paymentStatus !== 'paid')
        return next(new appError('You cannot update an unpaid cart order.', 400));

    return order;
};

export const addToCart = catchAsync(async (req, res, next) =>
{
    let normalizedItems;
    let mealMap;

    try
    {
        normalizedItems = normalizeItems(req.body.items);
        mealMap = await getApprovedMealsById(normalizedItems);
    }
    catch (err)
    {
        return next(err);
    }

    const itemsByChef = groupItemsByChef(normalizedItems, mealMap);

    const cartOrders = await prisma.$transaction(async (tx) =>
    {
        for (const [chefId, chefItems] of itemsByChef)
        {
            let order = await tx.order.findFirst({
                where: {
                    userId: req.user.id,
                    chefId,
                    paymentStatus: 'unpaid',
                },
            });

            if (!order)
            {
                order = await tx.order.create({
                    data: {
                        userId: req.user.id,
                        chefId,
                        status: null,
                        paymentStatus: 'unpaid',
                        total: 0,
                    },
                });
            }

            for (const item of chefItems)
            {
                const price = toMoney(item.meal.price.toString());
                const existingItem = await tx.orderItem.findFirst({
                    where: {
                        orderId: order.id,
                        mealId: item.meal.id,
                    },
                });

                if (existingItem)
                {
                    await tx.orderItem.update({
                        where: { id: existingItem.id },
                        data: {
                            mealName: item.meal.title,
                            price,
                            quantity: existingItem.quantity + item.quantity,
                        },
                    });
                }
                else
                {
                    await tx.orderItem.create({
                        data: {
                            orderId: order.id,
                            mealId: item.meal.id,
                            mealName: item.meal.title,
                            price,
                            quantity: item.quantity,
                        },
                    });
                }
            }

            const updatedItems = await tx.orderItem.findMany({
                where: { orderId: order.id },
            });

            await tx.order.update({
                where: { id: order.id },
                data: {
                    total: getOrderTotal(updatedItems),
                },
            });
        }

        return getCartOrders(req.user.id, tx);
    });

    res.status(201).json({
        status: 'success',
        results: cartOrders.length,
        cartTotal: getOrdersTotal(cartOrders),
        data: cartOrders,
    });
});

export const getAllCartOrders = catchAsync(async (req, res, next) =>
{
    const orders = await getCartOrders(req.user.id);

    res.status(200).json({
        status: 'success',
        results: orders.length,
        cartTotal: getOrdersTotal(orders),
        data: orders,
    });
});

export const getCheckoutSummary = catchAsync(async (req, res, next) =>
{
    const orders = await getCartOrders(req.user.id);

    res.status(200).json({
        status: 'success',
        results: orders.length,
        checkoutTotal: getOrdersTotal(orders, true),
        data: orders,
    });
});

export const checkout = catchAsync(async (req, res, next) =>
{
    const note = req.body?.note === undefined ? undefined : String(req.body.note).trim();
    if (note !== undefined && note.length > 2000)
        return next(new appError('Order note is too long.', 400));

    const checkedOutOrders = await prisma.$transaction(async (tx) =>
    {
        const cartOrders = await getCartOrders(req.user.id, tx);

        if (cartOrders.length === 0)
            throw new appError('Your cart is empty.', 400);

        const orders = [];

        for (const order of cartOrders)
        {
            for (const item of order.items)
            {
                const currentPrice = toMoney(item.meal.price.toString());

                await tx.orderItem.update({
                    where: { id: item.id },
                    data: {
                        mealName: item.meal.title,
                        price: currentPrice,
                    },
                });
            }

            orders.push(await tx.order.update({
                where: { id: order.id },
                data: {
                    total: getCurrentOrderTotal(order.items),
                    note: note || null,
                    paymentStatus: 'paid',
                    status: 'pending',
                },
                include: orderInclude,
            }));
        }

        return orders;
    });

    res.status(200).json({
        status: 'success',
        results: checkedOutOrders.length,
        checkoutTotal: getOrdersTotal(checkedOutOrders),
        data: checkedOutOrders,
    });
});

export const getAllOrders = catchAsync(async (req, res, next) =>
{
    const where = req.user?.role === 'ADMIN' ? {} : { userId: req.user.id };
    const pagination = getPagination(req);
    const { orders, total } = await getPaidOrders(where, pagination);

    const response = {
        status: 'success',
        results: orders.length,
        data: orders,
    };
    if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
    res.status(200).json(response);
});

export const getMyOrders = catchAsync(async (req, res, next) =>
{
    const pagination = getPagination(req);
    const { orders, total } = await getPaidOrders({ userId: req.user.id }, pagination);

    const response = {
        status: 'success',
        results: orders.length,
        data: orders,
    };
    if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
    res.status(200).json(response);
});

export const getMyCurrentOrders = catchAsync(async (req, res, next) =>
{
    const pagination = getPagination(req);
    const { orders, total } = await getPaidOrders({
        userId: req.user.id,
        status: { in: ACTIVE_ORDER_STATUSES },
    }, pagination);

    const response = {
        status: 'success',
        results: orders.length,
        data: orders,
    };
    if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
    res.status(200).json(response);
});

export const getMyPreviousOrders = catchAsync(async (req, res, next) =>
{
    const pagination = getPagination(req);
    const { orders, total } = await getPaidOrders({
        userId: req.user.id,
        status: { in: PREVIOUS_ORDER_STATUSES },
    }, pagination);

    const response = {
        status: 'success',
        results: orders.length,
        data: orders,
    };
    if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
    res.status(200).json(response);
});

export const getChefOrders = catchAsync(async (req, res, next) =>
{
    if (req.user.role !== 'CHEF')
        return next(new appError('Only chefs can access this route.', 403));

    const pagination = getPagination(req);
    const { orders, total } = await getPaidOrders({ chefId: req.user.id }, pagination);

    const response = {
        status: 'success',
        results: orders.length,
        data: orders,
    };
    if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
    res.status(200).json(response);
});

export const getChefCurrentOrders = catchAsync(async (req, res, next) =>
{
    if (req.user.role !== 'CHEF')
        return next(new appError('Only chefs can access this route.', 403));

    const pagination = getPagination(req);
    const { orders, total } = await getPaidOrders({
        chefId: req.user.id,
        status: { in: ACTIVE_ORDER_STATUSES },
    }, pagination);

    const response = {
        status: 'success',
        results: orders.length,
        data: orders,
    };
    if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
    res.status(200).json(response);
});

export const getChefPreviousOrders = catchAsync(async (req, res, next) =>
{
    if (req.user.role !== 'CHEF')
        return next(new appError('Only chefs can access this route.', 403));

    const pagination = getPagination(req);
    const { orders, total } = await getPaidOrders({
        chefId: req.user.id,
        status: { in: PREVIOUS_ORDER_STATUSES },
    }, pagination);

    const response = {
        status: 'success',
        results: orders.length,
        data: orders,
    };
    if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
    res.status(200).json(response);
});

export const getOrder = catchAsync(async (req, res, next) =>
{
    const { id } = req.params;

    if (!id)
        return next(new appError('Please provide an order id!', 400));

    const order = await prisma.order.findUnique({
        where: { id },
        include: orderInclude,
    });

    if (!order)
        return next(new appError('Order not found!', 404));

    const canAccess =
        req.user.role === 'ADMIN' ||
        order.userId === req.user.id ||
        (order.paymentStatus === 'paid' && order.chefId === req.user.id);

    if (!canAccess)
        return next(new appError('You are not allowed to access this order.', 403));

    res.status(200).json({
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

    const allowedStatuses = [...ACTIVE_ORDER_STATUSES, ...PREVIOUS_ORDER_STATUSES];
    if (!allowedStatuses.includes(status))
        return next(new appError('Invalid order status.', 400));

    const order = await prisma.order.update({
        where: { id },
        data: {
            status,
            paymentStatus: 'paid',
        },
        include: orderInclude,
    });

    res.status(200).json({
        status: 'success',
        data: order,
    });
});

const updateChefOrderStatus = (action) => catchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const transition = CHEF_ALLOWED_ACTIONS[action];

    if (!id)
        return next(new appError('Please provide an order id!', 400));

    const order = await ensureChefOwnsPaidOrder(req, id, next);
    if (!order)
        return;

    if (order.status !== transition.from)
        return next(new appError(`Order must be ${transition.from} before it can be ${transition.to}.`, 400));

    const rejectionReason = action === 'reject' ? String(req.body?.rejectionReason || '').trim() : undefined;
    if (action === 'reject' && !rejectionReason)
        return next(new appError('يرجى إضافة سبب الرفض', 400));

    const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
            status: transition.to,
            ...(action === 'reject' ? { rejectionReason } : {}),
        },
        include: orderInclude,
    });

    res.status(200).json({
        status: 'success',
        data: updatedOrder,
    });
});

export const acceptOrder = updateChefOrderStatus('accept');
export const rejectOrder = updateChefOrderStatus('reject');
export const deliverOrder = updateChefOrderStatus('deliver');

const assertOrderItemEditable = async (req, id, itemId) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
    });
    if (!order) throw new appError('Order not found!', 404);
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN')
        throw new appError('You are not allowed to modify this order.', 403);
    if (['rejected', 'delivered'].includes(order.status))
        throw new appError('This order can no longer be modified.', 400);
    const item = order.items.find((entry) => entry.id === itemId);
    if (!item) throw new appError('Order item not found!', 404);
    return { order, item };
};

export const updateOrderItemQuantity = catchAsync(async (req, res, next) => {
    const quantity = Number(req.body?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1)
        return next(new appError('quantity must be an integer greater than or equal to 1.', 400));

    const { id, itemId } = req.params;
    await assertOrderItemEditable(req, id, itemId);
    const updatedOrder = await prisma.$transaction(async (tx) => {
        await tx.orderItem.update({ where: { id: itemId }, data: { quantity } });
        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        return tx.order.update({
            where: { id },
            data: { total: getOrderTotal(items) },
            include: orderInclude,
        });
    });
    res.status(200).json({ status: 'success', data: updatedOrder });
});

export const deleteOrderItem = catchAsync(async (req, res, next) => {
    const { id, itemId } = req.params;
    const { order } = await assertOrderItemEditable(req, id, itemId);
    if (order.items.length === 1)
        return next(new appError('An order must contain at least one item.', 400));

    const updatedOrder = await prisma.$transaction(async (tx) => {
        await tx.orderItem.delete({ where: { id: itemId } });
        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        return tx.order.update({
            where: { id },
            data: { total: getOrderTotal(items) },
            include: orderInclude,
        });
    });
    res.status(200).json({ status: 'success', data: updatedOrder });
});

export const createOrder = addToCart;
