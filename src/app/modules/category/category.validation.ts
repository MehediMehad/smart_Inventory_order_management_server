import { z } from "zod";

const createCategorySchema = z.object({
    name: z.string().min(2),
});

const updateCategorySchema = z.object({
    name: z.string().min(2).optional(),
});

export const CategoryValidations = {
    createCategorySchema,
    updateCategorySchema,
};