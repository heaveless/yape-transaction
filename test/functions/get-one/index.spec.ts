import { handler } from '@/functions/get-one';
import { APIGatewayEvent } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import dynamoDb from '@/config/dynamo';

jest.mock('@/config/dynamo', () => ({
    send: jest.fn()
}));

describe('getOne handler', () => {
    const VALID_ID = 'b58d69f1-f2c9-4a51-8a53-83d314c3d024';

    const createEvent = (params = { id: VALID_ID }): APIGatewayEvent => ({
        body: null,
        headers: {},
        pathParameters: params,
        queryStringParameters: {},
        requestContext: {} as any,
        multiValueHeaders: {},
        multiValueQueryStringParameters: {},
        httpMethod: 'GET',
        isBase64Encoded: false,
        resource: '/',
        stageVariables: null
    } as any);

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.DYNAMO_TABLE_TRANSACTION = 'TransactionTable';
    });

    it('should return 200 with item if found', async () => {
        const mockItem = { id: VALID_ID, amount: 100 };
        (dynamoDb.send as jest.Mock).mockResolvedValue({ Item: mockItem });

        const result = await handler(createEvent(), {} as any);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toBe(200);
        expect(body.message).toBe('Records requested correctly.');
        expect(body.data).toEqual(mockItem);
        expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(GetCommand));
    });

    it('should return 404 if item not found', async () => {
        (dynamoDb.send as jest.Mock).mockResolvedValue({ Item: undefined });

        const result = await handler(createEvent(), {} as any);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toBe(404);
        expect(body.message).toBe('Not found');
    });

    it('should return 400 if id param is invalid', async () => {
        const invalidParams = { id: 'not-a-uuid' };

        const result = await handler(createEvent(invalidParams), {} as any);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toBe(400);
        expect(body.message).toMatch(/id/i);
    });

    it('should return 500 if DynamoDB throws error', async () => {
        (dynamoDb.send as jest.Mock).mockRejectedValue(new Error('Dynamo error'));

        const result = await handler(createEvent(), {} as any);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toBe(500);
        expect(body.message).toBe('Something went wrong. Contact your provider.');
    });
});