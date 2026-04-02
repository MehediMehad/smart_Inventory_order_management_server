import type { z } from 'zod';
import { CategoryValidations } from './category.validation';

export type TCreateCategoryPayload = z.infer<typeof CategoryValidations.createCategorySchema>;
export type TUpdateCategoryPayload = z.infer<typeof CategoryValidations.updateCategorySchema>;