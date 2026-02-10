import { z } from 'zod';

export const CreateProcessSchema = z.object({
name: z.string().min(3).max(100),
  organizationId: z.string().uuid(), // En el futuro esto vendrá del token
steps: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    order: z.number().int().min(0)
})).min(1, "Un proceso debe tener al menos un paso")
});