type Options = {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: string;
};

type ReturnTypes = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

const paginationAndSortingHelper = (inputs: Options): ReturnTypes => {
  const page = Number(inputs.page || 1);
  const limit = Number(inputs.limit || 10);
  const skip = (page - 1) * limit;
  const sortBy = inputs.sortBy || "createdAt";
  const sortOrder = inputs.sortOrder || "asc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export default paginationAndSortingHelper;
