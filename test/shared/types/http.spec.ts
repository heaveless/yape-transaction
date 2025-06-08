import { HttpContext, HttpMiddleware } from '@/shared/types/http';

describe('validateApiKey middleware', () => {
    const validateApiKey: HttpMiddleware = async (ctx, next) => {
        const apiKey = ctx.request.headers['x-api-key'];
        if (!apiKey || apiKey !== 'expected-key') {
            ctx.response.statusCode = 401;
            ctx.response.message = "Unauthorized";
            return;
        }

        await next();
    };

    const createContext = (apiKey?: string): HttpContext => ({
        request: {
            body: {},
            params: {},
            query: {},
            headers: apiKey ? { 'x-api-key': apiKey } : {},
            context: {} as any,
        },
        response: {
            statusCode: 200
        }
    });

    it('should block request with missing api key', async () => {
        const ctx = createContext();
        const next = jest.fn();
        await validateApiKey(ctx, next);

        expect(ctx.response.statusCode).toBe(401);
        expect(ctx.response.message).toBe('Unauthorized');
        expect(next).not.toHaveBeenCalled();
    });

    it('should block request with invalid api key', async () => {
        const ctx = createContext('invalid-key');
        const next = jest.fn();
        await validateApiKey(ctx, next);

        expect(ctx.response.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if api key is valid', async () => {
        const ctx = createContext('expected-key');
        const next = jest.fn();
        await validateApiKey(ctx, next);

        expect(ctx.response.statusCode).toBe(200);
        expect(next).toHaveBeenCalled();
    });
});