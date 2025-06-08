import { createHandler } from "@/shared/utils/create-handler";
import { validate } from "@/shared/utils/validate";
import { HttpContext } from "@/shared/types/http";
import { GetOneRequest, getOneSchema } from "./schema";
import { exception, externalException } from "@/shared/utils/exception";
import dynamoDb from "@/config/dynamo";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { NotFoundException } from "@/shared/types/exception";

export const handler = createHandler(
    validate<GetOneRequest>(getOneSchema, req => req.params),
    exception(externalException),
    async (ctx: HttpContext<GetOneRequest>): Promise<void> => {
        const { id } = ctx.request.params;

        const command = new GetCommand({
            TableName: process.env.DYNAMO_TABLE_TRANSACTION,
            Key: { id }
        });
        const response = await dynamoDb.send(command);
        if (!response.Item) {
            throw new NotFoundException;
        }

        ctx.response.body = response.Item;
        ctx.response.message = "Records requested correctly.";
        ctx.response.statusCode = 200;
    }
);
