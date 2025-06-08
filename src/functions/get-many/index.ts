import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createHandler } from "@/shared/utils/create-handler";
import { validate } from "@/shared/utils/validate";
import { HttpContext } from "@/shared/types/http";
import { GetManyRequest, getManySchema } from "./schema";
import { exception, externalException } from "@/shared/utils/exception";
import dynamoDb from "@/config/dynamo";

export const handler = createHandler(
    validate<GetManyRequest>(getManySchema, req => req.query),
    exception(externalException),
    async (ctx: HttpContext<GetManyRequest>): Promise<void> => {
        const { account, limit = 10, cursor = 0 } = ctx.request.query;

        const command = new QueryCommand({
            TableName: process.env.DYNAMO_TABLE_TRANSACTION,
            IndexName: "gsiSourceAccountCreatedAt",
            KeyConditionExpression: "#accountId = :accountId  AND #createdAt > :cursor",
            ExpressionAttributeNames: {
                '#accountId': 'sourceAccountId',
                '#createdAt': "createdAt"
            },
            ExpressionAttributeValues: {
                ':accountId': account,
                ':cursor': new Date(Number(cursor)).toISOString()
            },
            Limit: Number(limit),
            ScanIndexForward: false
        });

        const { Items = [] } = await dynamoDb.send(command);

        let next = 0;

        if (Items.length) {
            next = Items[Items.length - 1].createdAt;
        }

        ctx.response.body = {
            items: Items,
            next: new Date(next).getTime()
        }
        ctx.response.message = "Records requested correctly.";
    }
);
