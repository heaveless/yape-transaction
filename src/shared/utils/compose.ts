import { HttpContext, HttpMiddleware } from "../types/http";

export const compose = (
    ctx: HttpContext,
    handlers: HttpMiddleware[]
) => handlers.reduceRight((next, handler) => {
    return () => handler(ctx, next)
}, () => Promise.resolve<any>(undefined));