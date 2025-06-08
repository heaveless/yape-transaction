import { ZodError } from "zod";

export const formatError = (err: ZodError): string => err.errors
    .map(x => `${x.path.join('.')}: ${x.message}`)
    .join('|');