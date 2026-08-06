import { prisma } from "../lib/prisma"
import catchAsync from './../utils/catchAsync.js'
import appError from './../utils/appError.js';

const getUserId = body => body.user_id ?? body.userId;

export const getAllMeals = catchAsync(async (req, res, next) =>
{
    const meals = await prisma.meal.findMany({
        include: {
            user: true,
            tags: true,
        },
    });
    res.status(200).json({
        status: 'success',
        data: meals
    });
});

export const getMeal = catchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    if (!id)
        return next(new appError("please provide id!", 404))
    const meal = await prisma.meal.findUnique({
        where: { id: id },
        include: {
            user: true,
            tags: true,
        },
    })
    if (!meal)
        return next(new appError("Meal not found!", 404))
    res.status(200).json({
        status: 'success',
        data: meal
    });
});

export const createMeal = catchAsync(async (req, res, next) =>
{
    const { title, photo, quantity, calories, price, ingredients, content } = req.body;
    const userId = getUserId(req.body);

    if (!title || price == 0.0|| !ingredients || !content || !userId)
        return next(new appError("please provide title, price, ingredients, content and user id!", 400))

    const foundedUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!foundedUser)
        return next(new appError("User not found!", 404))

    const meal = await prisma.meal.create({
        data: {
            title,
            photo,
            price,
            quantity,
            calories,
            ingredients,
            content,
            user_id: userId,
        }
    })

    res.status(201).json({
        status: 'success',
        data: meal
    });
});

export const updateMeal = catchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const updatedData = { ...req.body };
    const userId = getUserId(updatedData);

    if (!id || !updatedData)
        return next(new appError("please provide id and data!", 400))
    const founded = await prisma.meal.findUnique({ where: { id: id } })
    if (!founded)
        return next(new appError("Meal not found!", 404))

    if (userId)
    {
        const foundedUser = await prisma.user.findUnique({ where: { id: userId } })
        if (!foundedUser)
            return next(new appError("User not found!", 404))
        updatedData.user_id = userId;
        delete updatedData.userId;
    }

    const meal = await prisma.meal.update({
        where: { id: id },
        data: updatedData
    })

    res.status(200).json({
        status: 'Meal was updated',
        data: meal
    });
});

export const deleteMeal = catchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    if (!id)
        return next(new appError("please provide id!", 400))
    const founded = await prisma.meal.findUnique({ where: { id: id } })
    if (!founded)
        return next(new appError("Meal not found!", 404))
    const deletedMeal = await prisma.meal.delete({ where: { id: id } })
    res.status(200).json({
        status: 'Meal was deleted',
        data: deletedMeal,
    });
})