import { z } from "zod";

export const getOneSchema = z.object({
    id: z.string().uuid()
});

export type GetOneRequest = z.infer<typeof getOneSchema>;
