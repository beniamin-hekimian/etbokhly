import { prisma } from "../lib/prisma"
import catchAsync from './../utils/catchAsync.js'
import appError from './../utils/appError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const hasPendingMealEdit = (meal) =>
  [
    meal.pendingTitle,
    meal.pendingPhoto,
    meal.pendingPrice,
    meal.pendingContent,
    meal.pendingTagIds,
  ].some((value) => value !== null && value !== undefined);

const isPendingMealEdit = (meal) =>
  (meal.mealRequestStatus === "APPROVED" && meal.editRequestStatus === "PENDING") ||
  (meal.mealRequestStatus === "PENDING" && hasPendingMealEdit(meal));

/*
export const getChefRequests = catchAsync(async (req, res) => {
  const requests = await prisma.user.findMany({
    where: {
      chefRequestStatus: "PENDING",
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      profile_image: true,
      createdAt: true,
    },
  });

  res.status(200).json({
    status: "success",
    data: requests,
  });
});*/
export const getChefRequests = catchAsync(async (req, res) => {
  const pagination = getPagination(req);
  const where = { chefRequestStatus: { in: ["PENDING", "APPROVED", "REJECTED"] } };
  const query = { where, orderBy: { createdAt: "desc" } };
  if (pagination) { query.skip = pagination.skip; query.take = pagination.limit; }
  const [requests, total] = await Promise.all([
    prisma.user.findMany({ ...query, select: {
      id: true, full_name: true, email: true, phone: true, profile_image: true, bio: true,
      role: true, chefRequestStatus: true, chefRequestRejectReason: true, createdAt: true,
      location: true, profile: { select: { about_me: true } },
    }}),
    pagination ? prisma.user.count({ where }) : Promise.resolve(null),
  ]);
  const response = {
    status: "success",
    results: requests.length,
    data: requests,
  };
  if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
  res.status(200).json(response);
});
export const approveChefRequest = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!user)
    return next(new appError("User not found", 404));

  const updatedUser = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      role: "CHEF",
      chefRequestStatus: "APPROVED",
      chefRequestRejectReason: null,
    },
  });

  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});
export const rejectChefRequest = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason)
    return next(new appError("Reject reason is required", 400));

  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!user)
    return next(new appError("User not found", 404));

  const updatedUser = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      chefRequestStatus: "REJECTED",
      chefRequestRejectReason: reason,
    },
  });

  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});
////////
export const getAllMealRequests = catchAsync(async (req, res, next) => {
  const pagination = getPagination(req);
  const where = { mealRequestStatus: { in: ["PENDING", "APPROVED", "REJECTED"] } };
  const query = { where, orderBy: { createdAt: "desc" } };
  if (pagination) { query.skip = pagination.skip; query.take = pagination.limit; }
  const [meals, total] = await Promise.all([prisma.meal.findMany({ ...query,

    select: {
      id: true,
      title: true,
      photo: true,
      price: true,
      content: true,

      mealRequestStatus: true,
      mealRequestRejectReason: true,
      editRequestStatus: true,
      editRequestRejectReason: true,
      pendingTitle: true,
      pendingPhoto: true,
      pendingPrice: true,
      pendingContent: true,
      pendingTagIds: true,

      createdAt: true,
      updatedAt: true,

     
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          profile_image: true,
        },
      },

      tags: {
        include: {
          tag: true,
        },
      },
    },

  }), pagination ? prisma.meal.count({ where }) : Promise.resolve(null)]);

  const response = {
    status: "success",
    results: meals.length,
    data: meals,
  };
  if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
  res.status(200).json(response);
});

export const approveMeal = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(
      new appError("Please provide meal id!", 400)
    );
  }

  const meal = await prisma.meal.findUnique({
    where: {
      id,
    },
  });

  if (!meal) {
    return next(
      new appError("Meal not found!", 404)
    );
  }

  const isEditRequest = isPendingMealEdit(meal);
  const isCreateRequest = meal.mealRequestStatus === "PENDING" && !isEditRequest;

  if (!isCreateRequest && !isEditRequest) {
    return next(
      new appError(
        "There is no pending meal request to approve.",
        400
      )
    );
  }

  const updatedMeal = await prisma.$transaction(async (tx) => {
    const pendingTags = isEditRequest && Array.isArray(meal.pendingTagIds) ? meal.pendingTagIds : null;
    if (pendingTags !== null) {
      await tx.mealTag.deleteMany({ where: { meal_id: id } });
      if (pendingTags.length) await tx.mealTag.createMany({ data: pendingTags.map((tag_id) => ({ meal_id: id, tag_id })) });
    }
    return tx.meal.update({ where: { id }, data: isEditRequest
      ? {
          title: meal.pendingTitle ?? meal.title,
          photo: meal.pendingPhoto ?? meal.photo,
          price: meal.pendingPrice ?? meal.price,
          content: meal.pendingContent ?? meal.content,
          mealRequestStatus: "APPROVED",
          mealRequestRejectReason: null,
          editRequestStatus: "APPROVED",
          editRequestRejectReason: null,
          pendingTitle: null,
          pendingPhoto: null,
          pendingPrice: null,
          pendingContent: null,
          pendingTagIds: null,
        }
      : {
          mealRequestStatus: "APPROVED",
          mealRequestRejectReason: null,
          editRequestStatus: null,
          editRequestRejectReason: null,
          pendingTitle: null,
          pendingPhoto: null,
          pendingPrice: null,
          pendingContent: null,
          pendingTagIds: null,
        },

    select: {
      id: true,
      title: true,
      photo: true,
      price: true,
      content: true,
      mealRequestStatus: true,
      mealRequestRejectReason: true,
      editRequestStatus: true,
      editRequestRejectReason: true,

      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          profile_image: true,
        },
      },

      tags: {
        include: {
          tag: true,
        },
      },

      createdAt: true,
      updatedAt: true,
    },
    });
  });

  res.status(200).json({
    status: "success",
    message: "Meal request approved successfully.",
    data: updatedMeal,
  });
});

//////
export const rejectMeal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!id) {
    return next(
      new appError("Please provide meal id!", 400)
    );
  }

  if (!reason) {
    return next(
      new appError(
        "Reject reason is required!",
        400
      )
    );
  }

  const meal = await prisma.meal.findUnique({
    where: {
      id,
    },
  });

  if (!meal) {
    return next(
      new appError("Meal not found!", 404)
    );
  }

  const isEditRequest = isPendingMealEdit(meal);
  const isCreateRequest = meal.mealRequestStatus === "PENDING" && !isEditRequest;

  if (!isCreateRequest && !isEditRequest) {
    return next(
      new appError(
        "There is no pending meal request to reject.",
        400
      )
    );
  }

  const updatedMeal = await prisma.meal.update({
    where: {
      id,
    },

    data: isEditRequest
      ? {
          mealRequestStatus: "APPROVED",
          mealRequestRejectReason: null,
          editRequestStatus: "REJECTED",
          editRequestRejectReason: reason,
          pendingTitle: null,
          pendingPhoto: null,
          pendingPrice: null,
          pendingContent: null,
          pendingTagIds: null,
        }
      : {
          mealRequestStatus: "REJECTED",
          mealRequestRejectReason: reason,
          editRequestStatus: null,
          editRequestRejectReason: null,
          pendingTitle: null,
          pendingPhoto: null,
          pendingPrice: null,
          pendingContent: null,
          pendingTagIds: null,
        },

    select: {
      id: true,
      title: true,
      photo: true,
      price: true,
      content: true,
      mealRequestStatus: true,
      mealRequestRejectReason: true,
      editRequestStatus: true,
      editRequestRejectReason: true,

      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          profile_image: true,
        },
      },

      tags: {
        include: {
          tag: true,
        },
      },

      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Meal request rejected successfully.",
    data: updatedMeal,
  });
});
