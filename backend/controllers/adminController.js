import { prisma } from "../lib/prisma"
import catchAsync from './../utils/catchAsync.js'
import appError from './../utils/appError.js';

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
  const requests = await prisma.user.findMany({
    where: {
      chefRequestStatus: {
        in: ["PENDING", "APPROVED", "REJECTED"],
      },
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
      bio: true,
      role: true,
      chefRequestStatus: true,
      chefRequestRejectReason: true,
      createdAt: true,
      location:true,
      profile: {
        select: {
          about_me: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: requests,
  });
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