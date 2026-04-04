import { Priority, Prisma, ProductStatus } from '@prisma/client';
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

        if (
            payload.stockQuantity !== undefined &&
            payload.stockQuantity !== product.stockQuantity
        ) {
            const newStock = payload.stockQuantity;

            // 1. Update Product Status
            if (newStock === 0) {
                await tx.product.update({
                    where: { id },
                    data: { status: "OUT_OF_STOCK" },
                });
            } else if (product.status === "OUT_OF_STOCK") {
                await tx.product.update({
                    where: { id },
                    data: { status: "ACTIVE" },
                });
            }

            // 2. Restock Queue Logic
            if (newStock <= product.minStockThreshold) {
                let priority: Priority = "LOW";

                const halfThreshold = Math.ceil(product.minStockThreshold / 2);

                if (newStock === 0) {
                    priority = "HIGH";
                } else if (newStock <= halfThreshold) {
                    priority = "MEDIUM";
                }

                await tx.restockQueue.upsert({
                    where: { productId: product.id },
                    update: { priority },
                    create: {
                        productId: product.id,
                        priority,
                    },
                });

                // Activity Log (Restock Warning)
                await tx.activityLog.create({
                    data: {
                        message: `Restock warning for product "${product.name}" with "${priority.toLowerCase()}" priority`,
                        activityType: "RESTOCK_WARNING",
                        userId,
                    },
                });
            } else {
                await tx.restockQueue.deleteMany({
                    where: { productId: product.id },
                });
            }
        }

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