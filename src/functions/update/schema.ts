import { z } from "zod";

export const updateSchema = z.object({
    id: z.string().uuid(),
    statusId: z.number().positive(),
});

export type UpdateRequest = z.infer<typeof updateSchema>;