import { prisma } from "../lib/prisma";
import catchAsync from "../utils/catchAsync.js";
import appError from "../utils/appError.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

const USER_CARD_SELECT = {
  id: true,
  full_name: true,
  profile_image: true,
  bio: true,
  location: true,
  role: true,
  createdAt: true,

  _count: {
    select: { following: true, followers: true },
  },
};

// =========================
// Follow a Chef
// =========================

export const addFollow = catchAsync(async (req, res, next) => {
  const { chefId } = req.params;

  if (!chefId) {
    return next(new appError("Please provide a chef id!", 400));
  }

  if (chefId === req.user.id) {
    return next(new appError("You cannot follow yourself!", 400));
  }

  const chef = await prisma.user.findUnique({
    where: { id: chefId },
    select: { id: true, role: true },
  });

  if (!chef || chef.role !== "CHEF") {
    return next(new appError("Chef not found!", 404));
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: req.user.id,
        followingId: chefId,
      },
    },
  });

  if (existingFollow) {
    return next(new appError("You already follow this chef!", 400));
  }

  await prisma.follow.create({
    data: {
      followerId: req.user.id,
      followingId: chefId,
    },
  });

  const followersCount = await prisma.follow.count({
    where: { followingId: chefId },
  });

  res.status(201).json({
    status: "success",
    data: {
      followed: true,
      followersCount,
    },
  });
});

// =========================
// Unfollow a Chef
// =========================

export const removeFollow = catchAsync(async (req, res, next) => {
  const { chefId } = req.params;

  if (!chefId) {
    return next(new appError("Please provide a chef id!", 400));
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: req.user.id,
        followingId: chefId,
      },
    },
  });

  if (!existingFollow) {
    return next(new appError("You are not following this chef!", 404));
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: req.user.id,
        followingId: chefId,
      },
    },
  });

  const followersCount = await prisma.follow.count({
    where: { followingId: chefId },
  });

  res.status(200).json({
    status: "success",
    data: {
      followed: false,
      followersCount,
    },
  });
});

// =========================
// Get Users I Follow (private)
// =========================

export const getMyFollowing = catchAsync(async (req, res, next) => {
  const pagination = getPagination(req);
  const where = { followerId: req.user.id };
  const query = { where, orderBy: { createdAt: "desc" } };
  if (pagination) {
    query.skip = pagination.skip;
    query.take = pagination.limit;
  }

  const [rows, total] = await Promise.all([
    prisma.follow.findMany({
      ...query,
      select: {
        following: {
          select: USER_CARD_SELECT,
        },
      },
    }),
    pagination ? prisma.follow.count({ where }) : Promise.resolve(null),
  ]);

  const data = rows.map((row) => ({
    ...row.following,
    followingCount: row.following._count?.following ?? 0,
    followersCount: row.following._count?.followers ?? 0,
    isFollowing: true,
  }));

  const response = {
    status: "success",
    data,
  };
  if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
  res.status(200).json(response);
});

// =========================
// Get Chef's Followers (public)
// =========================

export const getChefFollowers = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const pagination = getPagination(req);

  const chef = await prisma.user.findUnique({
    where: { id, role: "CHEF" },
    select: { id: true },
  });

  if (!chef) {
    return next(new appError("Chef not found!", 404));
  }

  const where = { followingId: id };
  const query = { where, orderBy: { createdAt: "desc" } };
  if (pagination) {
    query.skip = pagination.skip;
    query.take = pagination.limit;
  }

  const [rows, total] = await Promise.all([
    prisma.follow.findMany({
      ...query,
      select: {
        follower: {
          select: {
            ...USER_CARD_SELECT,
            ...(req.user?.id
              ? {
                  followers: {
                    where: { followerId: req.user.id },
                    select: { followerId: true },
                    take: 1,
                  },
                }
              : {}),
          },
        },
      },
    }),
    pagination ? prisma.follow.count({ where }) : Promise.resolve(null),
  ]);

  const viewerId = req.user?.id || null;

  const data = rows.map((row) => {
    const { _count, followers, ...rest } = row.follower;

    return {
      ...rest,
      followingCount: _count?.following ?? 0,
      followersCount: _count?.followers ?? 0,
      isFollowing: Boolean(followers && followers.length > 0),
      isViewer: viewerId ? rest.id === viewerId : false,
    };
  });

  const response = {
    status: "success",
    data,
  };
  if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
  res.status(200).json(response);
});

// =========================
// Get Chef's Following (public)
// =========================

export const getChefFollowing = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const pagination = getPagination(req);

  const chef = await prisma.user.findUnique({
    where: { id, role: "CHEF" },
    select: { id: true },
  });

  if (!chef) {
    return next(new appError("Chef not found!", 404));
  }

  const where = { followerId: id };
  const query = { where, orderBy: { createdAt: "desc" } };
  if (pagination) {
    query.skip = pagination.skip;
    query.take = pagination.limit;
  }

  const [rows, total] = await Promise.all([
    prisma.follow.findMany({
      ...query,
      select: {
        following: {
          select: {
            ...USER_CARD_SELECT,
            ...(req.user?.id
              ? {
                  followers: {
                    where: { followerId: req.user.id },
                    select: { followerId: true },
                    take: 1,
                  },
                }
              : {}),
          },
        },
      },
    }),
    pagination ? prisma.follow.count({ where }) : Promise.resolve(null),
  ]);

  const viewerId = req.user?.id || null;

  const data = rows.map((row) => {
    const { _count, followers, ...rest } = row.following;

    return {
      ...rest,
      followingCount: _count?.following ?? 0,
      followersCount: _count?.followers ?? 0,
      isFollowing: Boolean(followers && followers.length > 0),
      isViewer: viewerId ? rest.id === viewerId : false,
    };
  });

  const response = {
    status: "success",
    data,
  };
  if (pagination) response.meta = paginationMeta(pagination.page, pagination.limit, total);
  res.status(200).json(response);
});