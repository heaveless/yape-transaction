import { createHandler } from "@/shared/utils/create-handler";
import { validate } from "@/shared/utils/validate";
import { HttpContext } from "@/shared/types/http";
import { UpdateRequest, updateSchema } from "./schema";
import { exception, externalException } from "@/shared/utils/exception";
import dynamoDb from "@/config/dynamo";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const handler = createHandler(
    validate(updateSchema),
    exception(externalException),
    async (ctx: HttpContext<UpdateRequest>): Promise<void> => {
        const { id, statusId } = ctx.request.body;

        const command = new UpdateCommand({
            Key: { id },
            TableName: process.env.DYNAMO_TABLE_TRANSACTION,
            UpdateExpression: "SET #statusId = :statusId, #updatedAt = :updatedAt",
            ExpressionAttributeNames: {
                '#statusId': "statusId",
                '#updatedAt': "updatedAt"
            },
            ExpressionAttributeValues: {
                ':statusId': statusId,
                ':updatedAt': new Date().toDateString()
            },
            ConditionExpression: 'attribute_exists(id)',
        });
        await dynamoDb.send(command);

        ctx.response.message = "Successfully updated.";
    }
);
