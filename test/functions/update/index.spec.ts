import { handler } from '@/functions/update';
import { APIGatewayEvent } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import dynamoDb from '@/config/dynamo';

jest.mock('@/config/dynamo', () => ({
    send: jest.fn()
}));

describe('update handler', () => {
    const VALID_BODY = {
        id: 'b58d69f1-f2c9-4a51-8a53-83d314c3d024',
        statusId: 1
    };

    const createEvent = (body = VALID_BODY): APIGatewayEvent => ({
        body: JSON.stringify(body),
        headers: {},
        pathParameters: {},
        queryStringParameters: {},
        requestContext: {} as any,
        multiValueHeaders: {},
        multiValueQueryStringParameters: {},
        httpMethod: 'PUT',
        isBase64Encoded: false,
        resource: '/',
        stageVariables: null
    } as any);

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.DYNAMO_TABLE_TRANSACTION = 'TransactionTable';
    });

    it('should return 200 when update is successful', async () => {
        (dynamoDb.send as jest.Mock).mockResolvedValue({});

        const result = await handler(createEvent(), {} as any);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toBe(200);
        expect(body.message).toBe('Successfully updated.');
        expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(UpdateCommand));
    });

    it('should return 400 when validation fails (invalid id)', async () => {
        const invalidBody = { ...VALID_BODY, id: 'not-a-uuid' };

        const result = await handler(createEvent(invalidBody), {} as any);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toBe(400);
        expect(body.message).toMatch(/id/i);
    });

    it('should return 400 when validation fails (missing statusId)', async () => {
        const { statusId, ...invalidBody } = VALID_BODY as any;

        const result = await handler(createEvent(invalidBody), {} as any);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toBe(400);
        expect(body.message).toMatch(/statusId/i);
    });

    it('should return 500 when dynamoDb.send throws', async () => {
        (dynamoDb.send as jest.Mock).mockRejectedValue(new Error('Dynamo error'));

        const result = await handler(createEvent(), {} as any);
        const body = JSON.parse(result.body);

        expect(result.statusCode).toBe(500);
        expect(body.message).toBe('Something went wrong. Contact your provider.');
    });
});