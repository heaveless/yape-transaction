import { z } from 'zod';
import { validate } from '@/shared/utils/validate';
import { BadRequestException } from '@/shared/types/exception';
import { HttpContext } from '@/shared/types/http';

const createCtx = (body: any = {}): HttpContext => ({
    request: {
        body,
        params: {},
        query: {},
        headers: {},
        context: {} as any
    },
    response: {
        statusCode: 200
    }
});

describe('validate middleware', () => {
    const schema = z.object({
        name: z.string().min(3),
        age: z.number().min(18)
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should validate body successfully and call next', async () => {
        const ctx = createCtx({ name: 'Alice', age: 25 });
        const next = jest.fn();

        const middleware = validate(schema);
        await middleware(ctx, next);

        expect(next).toHaveBeenCalled();
    });

    it('should throw BadRequestException on invalid body', async () => {
        const ctx = createCtx({ name: 'Al', age: 12 });
        const next = jest.fn();

        const middleware = validate(schema);

        await expect(middleware(ctx, next)).rejects.toThrow(BadRequestException);
        expect(next).not.toHaveBeenCalled();
    });

    it('should use executor to extract custom data and validate it', async () => {
        const ctx = createCtx({});
        const next = jest.fn();

        const executor = (req: any) => ({ name: 'John', age: 30 });

        const middleware = validate(schema, executor);
        await middleware(ctx, next);

        expect(next).toHaveBeenCalled();
    });

    it('should throw if executor returns invalid data', async () => {
        const ctx = createCtx();
        const next = jest.fn();

        const executor = (req: any) => ({ name: 'X', age: 15 });

        const middleware = validate(schema, executor);

        await expect(middleware(ctx, next)).rejects.toThrow(BadRequestException);
        expect(next).not.toHaveBeenCalled();
    });
});