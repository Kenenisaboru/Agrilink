const parsePagination = (query, defaultLimit = 50, maxLimit = 100) => {
  const requestedPage = Number.parseInt(query.page, 10);
  const requestedLimit = Number.parseInt(query.limit, 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 && requestedPage <= 1000000
    ? requestedPage
    : 1;
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, maxLimit)
    : defaultLimit;

  return { page, limit, skip: (page - 1) * limit };
};

const setPaginationHeaders = (res, { page, limit }, total) => {
  res.set({
    'X-Total-Count': String(total),
    'X-Page': String(page),
    'X-Page-Size': String(limit),
    'X-Total-Pages': String(Math.ceil(total / limit)),
  });
};

module.exports = { parsePagination, setPaginationHeaders };
