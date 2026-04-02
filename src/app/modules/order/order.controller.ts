import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import pick from '../../helpers/pick';
import sendResponse from '../../utils/sendResponse';
import { OrderServices } from './order.service';

const createOrderIntoDB = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await OrderServices.createOrder(user.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Order placed successfully',
        data: result,
    });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['searchTerm', 'status', 'startDate', 'endDate']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await OrderServices.getAllOrders(filter, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Orders retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await OrderServices.getSingleOrder(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order fetched successfully',
        data: result,
    });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await OrderServices.updateOrderStatus(id, status);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order status updated',
        data: result,
    });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await OrderServices.cancelOrder(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order cancelled successfully',
        data: result,
    });
});

export const OrderControllers = {
    createOrderIntoDB,
    getAllOrders,
    getSingleOrder,
    updateStatus,
    cancelOrder,
};