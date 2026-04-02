import { OrderStatus, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import { paginationHelper } from '../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.type';
import prisma from '../../libs/prisma';
import type { TCreateOrderPayload } from './order.interface';

const createOrder = async (userId: string, payload: TCreateOrderPayload) => {
    return await prisma.$transaction(async (tx) => {
        let calculatedTotalPrice = 0;

        // 🔹 Get last order to generate next serial
        const lastCreatedOrder = await tx.order.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { orderId: true },
        });

        // Extract number from last orderId and increment
        let nextOrderNumber = 1;
        if (lastCreatedOrder?.orderId) {
            const lastNumber = parseInt(lastCreatedOrder.orderId.split('-')[1], 10);
            nextOrderNumber = lastNumber + 1;
        }

        // Format orderId with leading zeros
        const orderId = `ORD-${nextOrderNumber.toString().padStart(3, '0')}`;

        // 1. Validate products and calculate total price
        const itemsWithPrices = await Promise.all(
            payload.items.map(async (item) => {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new ApiError(httpStatus.NOT_FOUND, `Product with ID ${item.productId} not found`);
                }

                if (product.stockQuantity < item.quantity) {
                    throw new ApiError(httpStatus.BAD_REQUEST, `Insufficient stock for product: ${product.name}`);
                }

                const itemTotal = product.price * item.quantity;
                calculatedTotalPrice += itemTotal;

                // 2. Update Product Stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQuantity: { decrement: item.quantity },
                        status: product.stockQuantity - item.quantity === 0 ? 'OUT_OF_STOCK' : product.status
                    }
                });

                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price, // Store price at time of purchase
                };
            })
        );

        // 3. Create Order
        const result = await tx.order.create({
            data: {
                orderId: orderId,
                customerName: payload.customerName,
                address: payload.address,
                contact: payload.contact,
                totalPrice: calculatedTotalPrice,
                status: OrderStatus.PENDING,
                items: {
                    create: itemsWithPrices,
                },
                user: { connect: { id: userId } }
            },
            include: {
                items: true,
            },
        });

        return result;
    });
};

interface IOrderFilter {
    searchTerm?: string;
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
}

const getAllOrders = async (filter: IOrderFilter, options: IPaginationOptions) => {
    const { searchTerm, status, startDate, endDate } = filter;
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    const whereClause: Prisma.OrderWhereInput = {};

    if (searchTerm) {
        whereClause.customerName = {
            contains: searchTerm,
            mode: 'insensitive',
        };
    }

    if (status) {
        whereClause.status = status;
    }

    if (startDate && endDate) {
        whereClause.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }

    const result = await prisma.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            items: {
                include: { product: true }
            },
        },
    });

    const total = await prisma.order.count({ where: whereClause });

    // Meta data
    const meta = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
    };

    return {
        meta: meta,
        data: result,
    };
};

const getSingleOrder = async (id: string) => {
    const result = await prisma.order.findUnique({
        where: {
            id
        },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            status: true,
                            categoryId: true,
                        }
                    }
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        }
    });

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }

    return result;
};

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [], // final state
    [OrderStatus.CANCELLED]: [], // final state
};

const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const order = await prisma.order.findUnique({
        where: { id },
    });

    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }

    const currentStatus = order.status;

    // same status update block
    if (currentStatus === status) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Order already in ${status} state`
        );
    }

    // invalid transition block
    const allowedNextStatuses = allowedTransitions[currentStatus];

    if (!allowedNextStatuses.includes(status)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Cannot change status from ${currentStatus} to ${status}`
        );
    }

    // update
    return await prisma.order.update({
        where: { id },
        data: { status },
    });
};

const cancelOrder = async (id: string) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true }
    });

    if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    if (order.status === OrderStatus.CANCELLED) throw new ApiError(httpStatus.BAD_REQUEST, 'Order already cancelled');

    return await prisma.$transaction(async (tx) => {
        // Restore stock
        for (const item of order.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stockQuantity: { increment: item.quantity } }
            });
        }

        return await tx.order.update({
            where: { id },
            data: { status: OrderStatus.CANCELLED }
        });
    });
};

export const OrderServices = {
    createOrder,
    getAllOrders,
    getSingleOrder,
    updateOrderStatus,
    cancelOrder,
};