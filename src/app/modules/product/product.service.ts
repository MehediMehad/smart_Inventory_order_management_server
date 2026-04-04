import { Prisma, ProductStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import { paginationHelper } from '../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.type';
import prisma from '../../libs/prisma';
import { TCreateProductPayload, TUpdateProductPayload } from './product.interface';

const createProduct = async (
    userId: string,
    payload: TCreateProductPayload
) => {
    const result = await prisma.$transaction(async (tx) => {
        // Create Product
        const product = await tx.product.create({
            data: payload,
            include: { category: true },
        });

        // Create Activity Log
        await tx.activityLog.create({
            data: {
                message: `New product "${product.name}" has been added`,
                activityType: "PRODUCT_ADDED",
                userId,
            },
        });

        return product;
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

const updateProduct = async (
    userId: string,
    id: string,
    payload: TUpdateProductPayload
) => {
    return await prisma.$transaction(async (tx) => {
        // Check product exists
        const product = await tx.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
        }

        // Update product
        const updatedProduct = await tx.product.update({
            where: { id },
            data: payload,
        });

        // Activity Log
        await tx.activityLog.create({
            data: {
                message: `Product "${product.name}" has been updated`,
                activityType: "PRODUCT_UPDATED",
                userId,
            },
        });

        return updatedProduct;
    });
};

const deleteProduct = async (userId: string, id: string) => {
    return await prisma.$transaction(async (tx) => {
        // Check product exists
        const product = await tx.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
        }

        // Delete product
        const result = await tx.product.delete({
            where: { id },
        });

        // Activity Log
        await tx.activityLog.create({
            data: {
                message: `Product "${product.name}" has been deleted`,
                activityType: "PRODUCT_DELETED",
                userId,
            },
        });

        return result;
    });
};

export const ProductServices = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};