import prisma from '../../libs/prisma';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../helpers/paginationHelper';
import { TCreateCategoryPayload, TUpdateCategoryPayload } from './category.interface';

const createCategory = async (payload: TCreateCategoryPayload) => {
    const isExist = await prisma.category.findUnique({
        where: { name: payload.name },
    });

    if (isExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Category already exists');
    }

    const result = await prisma.category.create({ data: payload });
    return result;
};

interface ICategoryFilter {
    searchTerm?: string;
}

const getAllCategories = async (filter: ICategoryFilter, options: IPaginationOptions) => {
    const { searchTerm } = filter;
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    const whereClause: Prisma.CategoryWhereInput = {};

    if (searchTerm) {
        whereClause.OR = [
            {
                name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            },
        ];
    }

    const result = await prisma.category.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });

    const total = await prisma.category.count({
        where: whereClause,
    });

    const meta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
    };

    return {
        meta,
        data: result,
    };
};

const getSingleCategory = async (id: string) => {
    const result = await prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }

    return result;
};

const updateCategory = async (id: string, payload: TUpdateCategoryPayload) => {
    await getSingleCategory(id);

    const result = await prisma.category.update({
        where: { id },
        data: payload,
    });
    return result;
};

const deleteCategory = async (id: string) => {
    await getSingleCategory(id);

    const result = await prisma.category.delete({
        where: { id },
    });
    return result;
};

export const CategoryServices = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};