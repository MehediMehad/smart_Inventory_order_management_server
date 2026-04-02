type IOptions = {
  page?: number;
  limit?: number;
  sortOrder?: string;
  sortBy?: string;
};

type IOptionsResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

const calculatePagination = (options: IOptions): IOptionsResult => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 25;
  const skip: number = (Number(page) - 1) * limit;

  const sortBy: string = options.sortBy || 'createdAt';
  const sortOrder: string = options.sortOrder || 'desc';

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

// Pagination meta
// const meta = {
//   page,
//   limit,
//   total,
//   totalPages: Math.ceil(total / limit),
//   hasNextPage: page < Math.ceil(total / limit),
//   hasPrevPage: page > 1,
// };

export const paginationHelper = {
  calculatePagination,
};
