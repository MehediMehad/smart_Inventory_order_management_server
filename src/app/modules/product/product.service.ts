import { Prisma, ProductStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import { paginationHelper } from '../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.type';
import prisma from '../../libs/prisma';
import { TCreateProductPayload, TUpdateProductPayload } from './product.interface';

const createProduct = async (payload: TCreateProductPayload) => {
    const result = await prisma.product.create({
        data: payload,
        include: { category: true }
    });
    return result;
};

interface IProductFilter {
    searchTerm?: string;
    status?: ProductStatus;
    categoryId?: string;
}

const getAllProducts = async (filter: IProductFilter, options: IPaginationOptions) => {
    const { searchTerm, status, categoryId } = filter;
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    const whereClause: Prisma.ProductWhereInput = {};

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

    if (status) {
        whereClause.status = status;
    }

    if (categoryId) {
        whereClause.categoryId = categoryId;
    }

    const result = await prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            category: {
                select: {
                    name: true,
                },
            },
        },
    });

    const total = await prisma.product.count({
        where: whereClause,
    });

    const meta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
    }

    return {
        meta,
        data: result,
    };
};

const getSingleProduct = async (id: string) => {
    const result = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
    });

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    return result;
};

const updateProduct = async (id: string, payload: TUpdateProductPayload) => {
    await getSingleProduct(id);
    const result = await prisma.product.update({
        where: { id },
        data: payload,
    });
    return result;
};

const deleteProduct = async (id: string) => {
    await getSingleProduct(id);
    const result = await prisma.product.delete({
        where: { id },
    });
    return result;
};

export const ProductServices = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};