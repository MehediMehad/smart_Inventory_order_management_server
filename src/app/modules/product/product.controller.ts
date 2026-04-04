import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import pick from '../../helpers/pick';
import sendResponse from '../../utils/sendResponse';
import { ProductServices } from './product.service';

const createProductIntoDB = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const result = await ProductServices.createProduct(userId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Product created successfully',
        data: result,
    });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['searchTerm', 'status', 'categoryId']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await ProductServices.getAllProducts(filter, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Products fetched successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductServices.getSingleProduct(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product fetched successfully',
        data: result,
    });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const result = await ProductServices.updateProduct(userId, req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product updated successfully',
        data: result,
    });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const result = await ProductServices.deleteProduct(userId, req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product deleted successfully',
        data: result,
    });
});

export const ProductControllers = {
    createProductIntoDB,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};