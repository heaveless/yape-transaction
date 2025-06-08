import { handler } from '@/functions/get-many';
import { APIGatewayEvent } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import dynamoDb from '@/config/dynamo';

jest.mock('@/config/dynamo', () => ({
  send: jest.fn()
}));

describe('getMany handler', () => {
  const VALID_QUERY = {
    account: 'b58d69f1-f2c9-4a51-8a53-83d314c3d024',
    limit: '2',
    cursor: '0'
  };

  const createEvent = (query = VALID_QUERY): APIGatewayEvent => ({
    body: null,
    headers: {},
    pathParameters: {},
    queryStringParameters: query,
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

  it('should return 200 with items and next cursor', async () => {
    const items = [
      { id: '1', createdAt: new Date('2025-01-01T00:00:00Z').toISOString() },
      { id: '2', createdAt: new Date('2025-01-02T00:00:00Z').toISOString() }
    ];

    (dynamoDb.send as jest.Mock).mockResolvedValue({ Items: items });

    const result = await handler(createEvent(), {} as any);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.message).toBe('Records requested correctly.');
    expect(body.data.items).toEqual(items);
    expect(body.data.next).toBe(new Date(items[1].createdAt).getTime());
    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(QueryCommand));
  });

  it('should return 200 with empty items and next = 0', async () => {
    (dynamoDb.send as jest.Mock).mockResolvedValue({ Items: [] });

    const result = await handler(createEvent(), {} as any);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.data.items).toEqual([]);
    expect(body.data.next).toBe(0);
  });

  it('should return 400 if query is invalid (non-numeric limit)', async () => {
    const invalidQuery = { ...VALID_QUERY, limit: 'not-a-number' };

    const result = await handler(createEvent(invalidQuery), {} as any);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(body.message).toMatch(/limit/i);
  });

  it('should return 500 if dynamoDb throws an error', async () => {
    const error = new Error('Simulated DynamoDB failure');
    (dynamoDb.send as jest.Mock).mockRejectedValue(error);

    const result = await handler(createEvent(), {} as any);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(500);
    expect(body.message).toBe('Something went wrong. Contact your provider.');
  });
});