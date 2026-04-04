import { z } from "zod";

const restockProductSchema = z.object({
    productId: z.string().min(1),
    addedQuantity: z.number().int().positive(),
});

export const RestockValidations = {
    restockProductSchema,
};