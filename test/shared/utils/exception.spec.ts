import { exception, externalException } from '@/shared/utils/exception';
import { BaseException } from '@/shared/types/exception';
import { HttpContext } from '@/shared/types/http';
import logger from '@/config/logger';

jest.mock('@/config/logger', () => ({
    error: jest.fn()
}));

describe('exception middleware', () => {
    const createCtx = (): HttpContext => ({
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call next if no error is thrown', async () => {
        const next = jest.fn().mockResolvedValue(undefined);
        const middleware = exception(() => ({ message: '', status: 500 }));
        const ctx = createCtx();

        await expect(middleware(ctx, next)).resolves.toBeUndefined();
        expect(next).toHaveBeenCalled();
    });

    it('should catch errors and throw BaseException', async () => {
        const error = new Error('Boom!');
        const next = jest.fn().mockRejectedValue(error);
        const onRejected = jest.fn().mockReturnValue({ message: 'Custom Error', status: 400 });
        const middleware = exception(onRejected);
        const ctx = createCtx();

        await expect(middleware(ctx, next)).rejects.toThrow(BaseException);
        expect(onRejected).toHaveBeenCalledWith(error);
        expect(logger.error).toHaveBeenCalledWith(error, 'EXCEPTION MIDDLEWARE');
    });
});

describe('externalException', () => {
    it('should extract message and status from error object', () => {
        const result = externalException({
            message: 'Something went wrong',
            $metadata: { httpStatusCode: 404 }
        });

        expect(result).toEqual({
            message: 'Something went wrong',
            status: 404
        });
    });

    it('should prefer error.status over metadata', () => {
        const result = externalException({
            message: 'Auth failed',
            status: 401,
            $metadata: { httpStatusCode: 500 }
        });

        expect(result.status).toBe(401);
    });
});