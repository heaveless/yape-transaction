import { z } from "zod";

export const createSchema = z.object({
    sourceAccountId: z.string().uuid(),
    destinationAccountId: z.string().uuid(),
    typeId: z.number().positive(),
    amount: z.number(),
});

export type CreateRequest = z.infer<typeof createSchema>;
