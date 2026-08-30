import { prisma } from "../lib/prisma";
import catchAsync from "../utils/catchAsync.js";
import appError from "../utils/appError.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

// =========================
// Like a Meal
// =========================

export const addLike = catchAsync(async (req, res, next) => {
  const { mealId } = req.params;

  if (!mealId) {
    return next(new appError("Please provide a meal id!", 400));
  }

  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
  });

  if (!meal) {
    return next(new appError("Meal not found!", 404));
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      user_id_meal_id: {
        user_id: req.user.id,
        meal_id: mealId,
      },
    },
  });

  if (existingLike) {
    return next(new appError("You already liked this meal!", 400));
  }

  await prisma.like.create({
    data: {
      user_id: req.user.id,
      meal_id: mealId,
    },
  });

  const likesCount = await prisma.like.count({
    where: { meal_id: mealId },
  });

  res.status(201).json({
    status: "success",
    data: {
      liked: true,
      likesCount,
    },
  });
});

// =========================
// Unlike a Meal
// =========================

export const removeLike = catchAsync(async (req, res, next) => {
  const { mealId } = req.params;

  if (!mealId) {
    return next(new appError("Please provide a meal id!", 400));
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      user_id_meal_id: {
        user_id: req.user.id,
        meal_id: mealId,
      },
    },
  });

  if (!existingLike) {
    return next(new appError("You have not liked this meal yet!", 404));
  }

  await prisma.like.delete({
    where: {
      user_id_meal_id: {
        user_id: req.user.id,
        meal_id: mealId,
      },
    },
  });

  const likesCount = await prisma.like.count({
    where: { meal_id: mealId },
  });

  res.status(200).json({
    status: "success",
    data: {
      liked: false,
      likesCount,
    },
  });
});

// =========================
// Get My Liked Meals
// =========================

export const getMyLikes = catchAsync(async (req, res, next) => {
  const pagination = getPagination(req);
  const where = { user_id: req.user.id };
  const query = { where, orderBy: { createdAt: "desc" } };
  if (pagination) {
    query.skip = pagination.skip;
    query.take = pagination.limit;
  }

  const [likes, total] = await Promise.all([
    prisma.like.findMany({
      ...query,
      select: {
        meal_id: true,
        createdAt: true,
        meal: {
          select: {
            id: true,
            title: true,
            photo: true,
            price: true,
            content: true,
            createdAt: true,
            updatedAt: true,

            user: {
              select: {
                id: true,
                full_name: true,
                profile_image: true,
              },
            },

            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },

            _count: {
              select: { likes: true },
            },
          },
        },
      },
    }),
    pagination ? prisma.like.count({ where }) : Promise.resolve(null),
  ]);

  const data = likes.map((like) => {
    const { _count, ...mealData } = like.meal;

    return {
      ...mealData,
      likesCount: _count.likes,
      likedByMe: true,
    };
  });

  const response = {
    status: "success",
    data,
  };
  if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
  res.status(200).json(response);
});