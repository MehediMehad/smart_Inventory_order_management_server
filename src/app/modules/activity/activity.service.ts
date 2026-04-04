import { ActivityTypeEnum, Prisma } from '@prisma/client';
import { paginationHelper } from '../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.type';
import prisma from '../../libs/prisma';

interface IActivityLogFilter {
    searchTerm?: string;
    activityType?: ActivityTypeEnum;
    userId?: string;
}

const getAllActivityLogs = async (filter: IActivityLogFilter, options: IPaginationOptions) => {
    const { searchTerm, activityType, userId } = filter;
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    const whereClause: Prisma.ActivityLogWhereInput = {};

    if (searchTerm) {
        whereClause.message = {
            contains: searchTerm,
            mode: 'insensitive',
        };
    }

    if (activityType) {
        whereClause.activityType = activityType;
    }

    if (userId) {
        whereClause.userId = userId;
    }

    const result = await prisma.activityLog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        select: {
            id: true,
            message: true,
            activityType: true,
            createdAt: true,
        },
    });

    const total = await prisma.activityLog.count({
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
        meta: meta,
        data: result,
    };
};

export const ActivityLogServices = {
    getAllActivityLogs,
};