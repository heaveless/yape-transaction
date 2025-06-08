import validator from "validator"
import { z } from "zod";

export const getManySchema = z.object({
    account: z.string().uuid(),
    limit: z.string()
        .refine(validator.isNumeric)
        .optional(),
    cursor: z.string()
        .refine(validator.isNumeric)
        .optional()
});

export type GetManyRequest = z.infer<typeof getManySchema>;