import { Priority, Prisma, ProductStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import { paginationHelper } from '../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.type';
import prisma from '../../libs/prisma';
import { TRestockProductPayload } from './restock.interface';

const getAllRestockQueue = async (
    filter: { searchTerm?: string; priority?: Priority },
    options: IPaginationOptions
) => {
    const { searchTerm, priority } = filter;
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    const whereClause: Prisma.RestockQueueWhereInput = {};

    if (priority) {
        whereClause.priority = priority;
    }

    if (searchTerm) {
        whereClause.product = {
            name: {
                contains: searchTerm,
                mode: 'insensitive',
            },
        };
    }

    const result = await prisma.restockQueue.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: sortBy === 'stockQuantity'
            ? { product: { stockQuantity: sortOrder as Prisma.SortOrder } }
            : { [sortBy]: sortOrder },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    stockQuantity: true,
                    minStockThreshold: true,
                    status: true,
                    price: true,
                    category: {
                        select: {
                            name: true,
                        }
                    }
                },
            },
        },
    });

    const total = await prisma.restockQueue.count({ where: whereClause });

    const meta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
    };
    const stack = {
        total: await prisma.restockQueue.count({
            where: {},
        }),
        high: await prisma.restockQueue.count({
            where: { priority: Priority.HIGH },
        }),
        medium: await prisma.restockQueue.count({
            where: { priority: Priority.MEDIUM },
        }),
        low: await prisma.restockQueue.count({
            where: { priority: Priority.LOW },
        }),

    }

    return {
        meta: meta,
        data: {
            data: result,
            stack,
        },
    };
};

const restockProduct = async (userId: string, payload: TRestockProductPayload) => {
    const { productId, addedQuantity } = payload;

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    return await prisma.$transaction(async (tx) => {
        // 1. Update Product Stock and Status
        const updatedProduct = await tx.product.update({
            where: { id: productId },
            data: {
                stockQuantity: { increment: addedQuantity },
                status: ProductStatus.ACTIVE, // Ensure it's active after restocking
            },
        });

        // 2. Remove from Restock Queue if stock is now above threshold
        // Rule: If stock > threshold, remove. Otherwise, update priority if needed.
        if (updatedProduct.stockQuantity > updatedProduct.minStockThreshold) {
            await tx.restockQueue.deleteMany({
                where: { productId },
            });
        } else {
            // Re-calculate priority if still below threshold
            let priority: Priority = 'LOW';
            const currentStock = updatedProduct.stockQuantity;
            const halfThreshold = Math.ceil(product.minStockThreshold / 2);

            if (currentStock === 0) {
                priority = 'HIGH';
            } else if (currentStock <= halfThreshold) {
                priority = 'MEDIUM';
            }

            await tx.restockQueue.update({
                where: { productId },
                data: { priority },
            });

            // Activity Log
            await tx.activityLog.create({
                data: {
                    message: `Product "${updatedProduct.name}" has been added to Restock Queue`,
                    activityType: "RESTOCK_PRODUCT",
                    userId: userId,
                },
            });
        }

        return updatedProduct;
    });
};

const removeFromQueueManually = async (id: string) => {
    return await prisma.restockQueue.delete({
        where: { id },
    })
};

export const RestockServices = {
    getAllRestockQueue,
    restockProduct,
    removeFromQueueManually,
};