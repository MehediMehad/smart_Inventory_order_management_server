import type { z } from 'zod';
import { OrderValidations } from './order.validation';

export type TCreateOrderPayload = z.infer<typeof OrderValidations.createOrderSchema>;