import type { z } from 'zod';
import { RestockValidations } from './restock.validation';

export type TRestockProductPayload = z.infer<typeof RestockValidations.restockProductSchema>;