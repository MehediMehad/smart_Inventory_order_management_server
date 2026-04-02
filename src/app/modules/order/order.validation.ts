import { OrderStatus } from "@prisma/client";
import { z } from "zod";

const createOrderSchema = z.object({
    customerName: z.string(),
    items: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number().int().positive("Quantity must be at least 1"),
        })
    ).min(1, "At least one product is required"),
});

const updateStatusSchema = z.object({
    status: z.nativeEnum(OrderStatus),
});

export const OrderValidations = {
    createOrderSchema,
    updateStatusSchema,
};