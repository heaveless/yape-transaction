import { createHandler } from '@/shared/utils/create-handler';
import { BaseException } from '@/shared/types/exception';
import { APIGatewayEvent } from 'aws-lambda';

import logger from '@/config/logger';
import * as composer from '@/shared/utils/compose';
import * as utils from '@/shared/utils/string-to-object';
import * as serializer from '@/shared/utils/object-to-string';

jest.mock('@/config/logger', () => ({
    info: jest.fn(),
    error: jest.fn()
}));

jest.mock('@/shared/utils/compose', () => ({
    compose: jest.fn()
}));

jest.mock('@/shared/utils/string-to-object', () => ({
    stringToObject: jest.fn()
}));

jest.mock('@/shared/utils/object-to-string', () => ({
    objectToString: jest.fn()
}));

describe('createHandler', () => {
    const fakeEvent = {
        body: '{"name":"Alice"}',
        headers: { 'x-api-key': '123' },
        pathParameters: { id: 'abc' },
        queryStringParameters: { search: 'xyz' },
        requestContext: {} as any
    } as unknown as APIGatewayEvent;

    const fakeContext = {} as any;

    beforeEach(() => {
        jest.clearAllMocks();

        (utils.stringToObject as jest.Mock).mockReturnValue({ name: 'Alice' });
        (serializer.objectToString as jest.Mock).mockImplementation(obj => JSON.stringify(obj));
        (composer.compose as jest.Mock).mockImplementation((ctx, middlewares) => async () => {
            ctx.response.statusCode = 200;
            ctx.response.message = 'OK';
            ctx.response.body = { success: true };
        });
    });

    it('should handle request successfully and return formatted response', async () => {
        const handler = createHandler();
        const result = await handler(fakeEvent, fakeContext);

        expect(utils.stringToObject).toHaveBeenCalledWith(fakeEvent.body);
        expect(serializer.objectToString).toHaveBeenCalledWith({
            message: 'OK',
            data: { success: true }
        });

        expect(result).toEqual({
            statusCode: 200,
            body: JSON.stringify({ message: 'OK', data: { success: true } })
        });

        expect(logger.info).toHaveBeenCalledWith(expect.any(Object), 'REQUEST');
        expect(logger.info).toHaveBeenCalledWith(expect.any(Object), 'RESPONSE');
    });

    it('should handle unexpected errors and return 500 response', async () => {
        (composer.compose as jest.Mock).mockImplementation(() => async () => {
            throw new Error('Unexpected fail');
        });

        const handler = createHandler();
        const result = await handler(fakeEvent, fakeContext);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({
            message: 'Something went wrong. Contact your provider.'
        });

        expect(logger.error).toHaveBeenCalledWith(expect.any(Error), 'EXCEPTION GLOBAL');
        expect(logger.info).toHaveBeenCalledWith(expect.any(Object), 'ERROR');
    });

    it('should handle BaseException and return proper status and message', async () => {
        const baseError = new BaseException('Not allowed', 403);

        (composer.compose as jest.Mock).mockImplementation(() => async () => {
            throw baseError;
        });

        const handler = createHandler();
        const result = await handler(fakeEvent, fakeContext);

        expect(result.statusCode).toBe(403);
        expect(JSON.parse(result.body)).toEqual({ message: 'Not allowed' });
    });
});