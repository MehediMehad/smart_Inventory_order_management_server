import type { z } from 'zod';
import type { createProductSchema, updateProductSchema } from './product.validation';

export type TCreateProductPayload = z.infer<typeof createProductSchema>
export type TUpdateProductPayload = z.infer<typeof updateProductSchema>