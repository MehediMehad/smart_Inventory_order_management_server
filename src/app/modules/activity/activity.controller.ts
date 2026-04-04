import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import pick from '../../helpers/pick';
import sendResponse from '../../utils/sendResponse';
import { ActivityLogServices } from './activity.service';

const getAllActivityLogs = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['searchTerm', 'activityType', 'userId']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

    const result = await ActivityLogServices.getAllActivityLogs(filter, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Activity logs retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

export const ActivityLogControllers = {
    getAllActivityLogs,
};