import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import pick from '../../helpers/pick';
import sendResponse from '../../utils/sendResponse';
import { RestockServices } from './restock.service';

const getAllFromQueue = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['searchTerm', 'priority']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await RestockServices.getAllRestockQueue(filter, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Restock queue fetched successfully',
        meta: result.meta,
        data: result.data,
    });
});

const restockProduct = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const result = await RestockServices.restockProduct(userId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product restocked and queue updated successfully',
        data: result,
    });
});

const deleteFromQueue = catchAsync(async (req: Request, res: Response) => {
    const result = await RestockServices.removeFromQueueManually(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Item removed from restock queue',
        data: result,
    });
});

export const RestockControllers = {
    getAllFromQueue,
    restockProduct,
    deleteFromQueue,
};