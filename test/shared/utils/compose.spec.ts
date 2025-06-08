import { compose } from '@/shared/utils/compose';
import { HttpContext, HttpNext } from '@/shared/types/http';

describe('compose middleware', () => {
    const createMockContext = (): HttpContext => ({
        request: {
            body: {},
            params: {},
            query: {},
            headers: {},
            context: {} as any
        },
        response: {
            statusCode: 200
        }
    });

    it('should execute middlewares in order', async () => {
        const ctx = createMockContext();
        const order: string[] = [];

        const middleware1 = async (_ctx: HttpContext, next: HttpNext) => {
            order.push('1-start');
            await next();
            order.push('1-end');
        };

        const middleware2 = async (_ctx: HttpContext, next: HttpNext) => {
            order.push('2-start');
            await next();
            order.push('2-end');
        };

        await compose(ctx, [middleware1, middleware2])();

        expect(order).toEqual([
            '1-start',
            '2-start',
            '2-end',
            '1-end'
        ]);
    });

    it('should stop execution if middleware does not call next', async () => {
        const ctx = createMockContext();
        const calls: string[] = [];

        const middleware1 = async (_ctx: HttpContext, _next: HttpNext) => {
            calls.push('1');
            // no next()
        };

        const middleware2 = async () => {
            calls.push('2');
        };

        await compose(ctx, [middleware1, middleware2])();

        expect(calls).toEqual(['1']);
    });

    it('should allow context mutation between middlewares', async () => {
        const ctx = createMockContext();

        const middleware1 = async (ctx: HttpContext, next: HttpNext) => {
            ctx.response.statusCode = 401;
            await next();
        };

        const middleware2 = async (ctx: HttpContext, _next: HttpNext) => {
            ctx.response.message = 'Unauthorized';
        };

        await compose(ctx, [middleware1, middleware2])();

        expect(ctx.response.statusCode).toBe(401);
        expect(ctx.response.message).toBe('Unauthorized');
    });
});