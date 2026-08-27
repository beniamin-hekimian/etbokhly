import appError from './appError.js';

export const getPagination = (req) => {
  const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
  if (!hasPagination) return null;

  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);

  if (!Number.isInteger(page) || page < 1)
    throw new appError('page must be greater than or equal to 1.', 400);
  if (!Number.isInteger(limit) || limit < 1)
    throw new appError('limit must be greater than or equal to 1.', 400);

  return { page, limit, skip: (page - 1) * limit };
};

export const paginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
