import { Schema } from "zod";
import { HttpContext, HttpNext, HttpRequest } from "../types/http";
import { BadRequestException } from "../types/exception";
import { formatError } from "./format-error";

export const validate = <T>(
    schema: Schema,
    executor?: (res: HttpRequest<T>) => T
) => async (
    ctx: HttpContext,
    next: HttpNext
): Promise<void> => {
        let result = null;

        if (executor) {
            const payload = executor(ctx.request);
            result = schema.safeParse(payload);
        } else {
            result = schema.safeParse(ctx.request.body);
        }

        if (result.error) {
            const message = formatError(result.error)
            throw new BadRequestException(message);
        }

        await next();
    }