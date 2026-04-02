/* eslint-disable @typescript-eslint/no-explicit-any */

export interface QueryObject {
  searchTerm?: string;
  sort?: string;
  limit?: string | number;
  page?: string | number;
  include?: string;
  [key: string]: unknown;
}

export class QueryBuilder<T extends { [key: string]: any }> {
  private model: any;
  private query: QueryObject;
  private prismaQuery: any = {};
  private prismaSelect?: T; // will use Prisma select type

  constructor(model: any, query: QueryObject) {
    this.model = model;
    this.query = query;
  }

  selectFields(select: T): this {
    this.prismaSelect = select;
    return this;
  }

  fields(): this {
    if (this.prismaSelect) this.prismaQuery.select = this.prismaSelect;
    return this;
  }

  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm;
    if (searchTerm) {
      this.prismaQuery.where = {
        ...this.prismaQuery.where,
        OR: searchableFields.map((field) => ({
          [field]: { contains: searchTerm, mode: 'insensitive' },
        })),
      };
    }
    return this;
  }

  filter(): this {
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'include'];
    const filters = Object.keys(this.query)
      .filter((key) => !excludeFields.includes(key))
      .reduce(
        (acc, key) => {
          const value = this.query[key];
          if (typeof value === 'string' && value.includes('-')) {
            const [min, max] = value.split('-').map(Number);
            acc[key] = { gte: min, lte: max };
          } else if (typeof value === 'string' && value.includes(',')) {
            acc[key] = { hasSome: value.split(',') };
          } else {
            acc[key] =
              value === 'true'
                ? true
                : value === 'false'
                  ? false
                  : isNaN(Number(value))
                    ? value
                    : Number(value);
          }
          return acc;
        },
        {} as Record<string, any>,
      );
    this.prismaQuery.where = { ...this.prismaQuery.where, ...filters };
    return this;
  }

  sort(): this {
    const sort = (this.query.sort as string) || '-createdAt';
    const fields = sort.split(',').map((f) => f.trim());
    const orderBy: any[] = fields.map((f) => {
      const field = f.startsWith('-') ? f.slice(1) : f;
      const direction = f.startsWith('-') ? 'desc' : 'asc';
      return { [field]: direction };
    });
    this.prismaQuery.orderBy = orderBy;
    return this;
  }

  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    this.prismaQuery.skip = (page - 1) * limit;
    this.prismaQuery.take = limit;
    return this;
  }

  include(): this {
    if (!this.query.include) return this;
    const includes = (this.query.include as string).split(',').map((f) => f.trim());
    this.prismaQuery.include = includes.reduce(
      (acc, relation) => ({ ...acc, [relation]: true }),
      {},
    );
    return this;
  }

  async countTotal(): Promise<{
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  }> {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const total = await this.model.count({
      where: this.prismaQuery.where || {},
    });
    return {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    };
  }

  async execute(): Promise<any[]> {
    return await this.model.findMany(this.prismaQuery);
  }
}

export default QueryBuilder;
