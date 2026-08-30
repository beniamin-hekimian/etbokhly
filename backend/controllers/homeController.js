import { prisma } from "../lib/prisma.js";
import catchAsync from "../utils/catchAsync.js";
import { decorateMealLikes } from "../utils/mealLikes.js";

export const getHomeData = catchAsync(async (req, res, next) => {
  const [meals, chefs] = await Promise.all([
    prisma.meal.findMany({
      where: {
        mealRequestStatus: "APPROVED",
      },
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
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

        ...(req.user?.id
          ? { likes: { where: { user_id: req.user.id }, select: { meal_id: true }, take: 1 } }
          : {}),
      },
    }),
    prisma.user.findMany({
      where: {
        role: "CHEF",
      },
      take: 4,
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        full_name: true,
        profile_image: true,
        bio: true,
        location: true,
        createdAt: true,
      },
    }),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      meals: decorateMealLikes(meals),
      chefs,
    },
  });
});
