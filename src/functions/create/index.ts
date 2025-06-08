import { v4 as uuid } from "uuid"
import { createHandler } from "@/shared/utils/create-handler";
import { validate } from "@/shared/utils/validate";
import { HttpContext } from "@/shared/types/http";
import { CreateRequest, createSchema } from "./schema";
import { exception, externalException } from "@/shared/utils/exception";
import dynamoDb from "@/config/dynamo";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { Status } from "./type";

export const handler = createHandler(
    validate(createSchema),
    exception(externalException),
    async (ctx: HttpContext<CreateRequest>): Promise<void> => {
        const {
            typeId,
            sourceAccountId,
            destinationAccountId,
            amount
        } = ctx.request.body;

        const payload = {
            id: uuid(),
            typeId,
            statusId: Status.PENDING,
            sourceAccountId,
            destinationAccountId,
            amount,
            createdAt: new Date().toISOString()
        };

        const command = new PutCommand({
            TableName: process.env.DYNAMO_TABLE_TRANSACTION,
            Item: payload
        });
        await dynamoDb.send(command);

        ctx.response.body = {
            id: payload.id,
            typeId: payload.typeId,
            statusId: payload.statusId,
            amount: payload.amount,
            createdAt: payload.createdAt
        };
        ctx.response.message = "Successfully created.";
        ctx.response.statusCode = 201;
    }
);
