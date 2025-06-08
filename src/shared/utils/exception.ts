import logger from "@/config/logger";
import { BaseException } from "../types/exception";
import { HttpContext, HttpNext } from "../types/http";

type ThrowArgs = Record<string, any>;
type ThrowReturn = {
    message: string;
    status: number;
};

export const externalException = (
    err: Record<string, any>
) => ({
    message: err.message,
    status: err.status || err.$metadata.httpStatusCode
});

export const exception = (
    onRejected: (err: ThrowArgs) => ThrowReturn
) => async (
    _: HttpContext,
    next: HttpNext
): Promise<void> => {
        try {
            await next();
        } catch (err: any) {
            logger.error(err, "EXCEPTION MIDDLEWARE");
            const response = onRejected(err);
            throw new BaseException(response.message, response.status)
        }
    }