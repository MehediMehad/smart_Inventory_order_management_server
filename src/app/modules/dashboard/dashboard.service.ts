import { OrderStatus, Prisma } from '@prisma/client';
import prisma from '../../libs/prisma';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

const getDashboardStats = async () => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const last7DaysStart = startOfDay(subDays(new Date(), 6));

    // 1. Basic Insights
    const [totalOrdersToday, pendingOrders, lowStockCount, revenueToday] = await Promise.all([
        prisma.order.count({
            where: { createdAt: { gte: todayStart, lte: todayEnd } },
        }),
        prisma.order.count({
            where: { status: OrderStatus.PENDING },
        }),
        prisma.restockQueue.count(),
        prisma.order.aggregate({
            where: {
                createdAt: { gte: todayStart, lte: todayEnd },
                status: { not: OrderStatus.CANCELLED },
            },
            _sum: { totalPrice: true },
        }),
    ]);

    // 2. Simple Analytics Chart Data (Last 7 Days)
    const last7DaysOrders = await prisma.order.findMany({
        where: {
            createdAt: { gte: last7DaysStart },
            status: { not: OrderStatus.CANCELLED },
        },
        select: {
            totalPrice: true,
            createdAt: true,
        },
    });

    // Grouping data by date for Chart
    const chartDataMap = new Map();
    for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        chartDataMap.set(date, { date, revenue: 0, orderCount: 0 });
    }

    last7DaysOrders.forEach((order) => {
        const date = format(order.createdAt, 'yyyy-MM-dd');
        if (chartDataMap.has(date)) {
            const existing = chartDataMap.get(date);
            chartDataMap.set(date, {
                ...existing,
                revenue: existing.revenue + order.totalPrice,
                orderCount: existing.orderCount + 1,
            });
        }
    });

    const weeklyAnalytics = Array.from(chartDataMap.values());

    // 3. Product Stock Summary
    const products = await prisma.product.findMany({
        take: 5,
        orderBy: { stockQuantity: 'asc' },
        select: { name: true, stockQuantity: true, minStockThreshold: true },
    });

    const productSummary = products.map((p) => ({
        name: p.name,
        stock: p.stockQuantity,
        status: p.stockQuantity <= p.minStockThreshold ? 'Low Stock' : 'OK',
    }));

    const activityLogs = await prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            message: true,
            activityType: true,
            createdAt: true,
        },
    })

    return {
        insights: {
            totalOrdersToday,
            pendingOrders,
            lowStockCount,
            revenueToday: revenueToday._sum.totalPrice || 0,
        },
        weeklyAnalytics,
        productSummary,
        activityLogs
    };
};

export const DashboardServices = {
    getDashboardStats,
};