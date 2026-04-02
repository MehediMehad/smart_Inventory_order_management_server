import { ProductStatus } from "@prisma/client";
import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(2),
    categoryId: z.string(),
    price: z.number().positive(),
    stockQuantity: z.number().int().nonnegative(),
    minStockThreshold: z.number().int().nonnegative(),
    status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
});

export const updateProductSchema = z.object({
    name: z.string().optional(),
    categoryId: z.string().optional(),
    price: z.number().positive().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    minStockThreshold: z.number().int().nonnegative().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
});

export const ProductValidations = {
    createProductSchema,
    updateProductSchema,
};