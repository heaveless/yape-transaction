import { handler } from '@/functions/create';
import { APIGatewayEvent } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import dynamoDb from '@/config/dynamo';
import * as uuidLib from 'uuid';

jest.mock('@/config/dynamo', () => ({
  send: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('create transaction handler', () => {
  const VALID_BODY = {
    typeId: 1,
    sourceAccountId: '11111111-1111-1111-1111-111111111111',
    destinationAccountId: '22222222-2222-2222-2222-222222222222',
    amount: 100
  };

  const createEvent = (body = VALID_BODY): APIGatewayEvent => ({
    body: JSON.stringify(body),
    headers: {},
    pathParameters: {},
    queryStringParameters: {},
    requestContext: {} as any,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    resource: '/',
    stageVariables: null
  } as unknown as any);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DYNAMO_TABLE_TRANSACTION = 'TransactionTable';
    (uuidLib.v4 as jest.Mock).mockReturnValue('mock-uuid');
    (dynamoDb.send as jest.Mock).mockResolvedValue({});
  });

  it('should return 201 on successful transaction creation', async () => {
    const result = await handler(createEvent(), {} as any);

    expect(result.statusCode).toBe(201);

    const body = JSON.parse(result.body);
    expect(body.message).toBe('Successfully created.');
    expect(body.data).toMatchObject({
      id: 'mock-uuid',
      typeId: 1,
      statusId: 0,
      amount: 100,
      createdAt: expect.any(String)
    });

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  it('should return 400 if validation fails', async () => {
    const invalidBody = { ...VALID_BODY, amount: 'invalid' } as any;

    const result = await handler(createEvent(invalidBody), {} as any);
    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body.message).toContain('amount');
  });

  it('should return 500 if DynamoDB throws unexpectedly', async () => {
    (dynamoDb.send as jest.Mock).mockRejectedValue(new Error('Dynamo crash'));

    const result = await handler(createEvent(), {} as any);
    expect(result.statusCode).toBe(500);

    const body = JSON.parse(result.body);
    expect(body.message).toContain('Something went wrong');
  });
});