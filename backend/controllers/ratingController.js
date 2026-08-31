import { prisma } from "../lib/prisma";
import catchAsync from "../utils/catchAsync.js";
import appError from "../utils/appError.js";

const SCORE_RANGE = [1, 2, 3, 4, 5];

async function getChefRatingStats(chefId) {
  const ratingAgg = await prisma.rating.aggregate({
    where: { chefId },
    _avg: { score: true },
    _count: true,
  });

  return {
    avgRating:
      ratingAgg?._avg?.score != null
        ? Math.round(ratingAgg._avg.score * 10) / 10
        : 0,
    ratingCount: ratingAgg?._count ?? 0,
  };
}

// =========================
// Set (add or update) a Rating for a Chef
// =========================

export const setChefRating = catchAsync(async (req, res, next) => {
  const { chefId } = req.params;
  const score = Number(req.body.score);

  if (!chefId) {
    return next(new appError("Please provide a chef id!", 400));
  }

  if (!Number.isInteger(score) || !SCORE_RANGE.includes(score)) {
    return next(new appError("Rating score must be an integer between 1 and 5!", 400));
  }

  if (chefId === req.user.id) {
    return next(new appError("You cannot rate yourself!", 400));
  }

  const chef = await prisma.user.findUnique({
    where: { id: chefId },
    select: { id: true, role: true },
  });

  if (!chef || chef.role !== "CHEF") {
    return next(new appError("Chef not found!", 404));
  }

  const rating = await prisma.rating.upsert({
    where: {
      raterId_chefId: {
        raterId: req.user.id,
        chefId,
      },
    },
    create: {
      raterId: req.user.id,
      chefId,
      score,
    },
    update: {
      score,
    },
  });

  const stats = await getChefRatingStats(chefId);

  res.status(200).json({
    status: "success",
    data: {
      rating: {
        score: rating.score,
      },
      ...stats,
    },
  });
});

// =========================
// Remove a Rating for a Chef
// =========================

export const deleteChefRating = catchAsync(async (req, res, next) => {
  const { chefId } = req.params;

  if (!chefId) {
    return next(new appError("Please provide a chef id!", 400));
  }

  if (chefId === req.user.id) {
    return next(new appError("You cannot rate yourself!", 400));
  }

  const chef = await prisma.user.findUnique({
    where: { id: chefId },
    select: { id: true, role: true },
  });

  if (!chef || chef.role !== "CHEF") {
    return next(new appError("Chef not found!", 404));
  }

  await prisma.rating.deleteMany({
    where: {
      raterId: req.user.id,
      chefId,
    },
  });

  const stats = await getChefRatingStats(chefId);

  res.status(200).json({
    status: "success",
    data: {
      rating: null,
      ...stats,
    },
  });
});
