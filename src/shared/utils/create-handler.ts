import { APIGatewayEvent, APIGatewayEventRequestContext } from "aws-lambda";
import logger from "@/config/logger";
import { compose } from "./compose";
import { APIGatewayEventReponse, HttpContext, HttpMiddleware } from "../types/http";
import { stringToObject } from "./string-to-object";
import { objectToString } from "./object-to-string";
import { BaseException } from "../types/exception";

export const createHandler = (...middlewares: HttpMiddleware[]) =>
    async (event: APIGatewayEvent, _: APIGatewayEventRequestContext): Promise<APIGatewayEventReponse> => {
        try {
            const ctx: HttpContext = {
                request: {
                    body: stringToObject(event.body ?? '{}'),
                    params: event.pathParameters ?? {},
                    query: event.queryStringParameters ?? {},
                    headers: event.headers,
                    context: event.requestContext
                },
                response: {
                    statusCode: 200,
                }
            };

            logger.info(ctx.request, "REQUEST");

            await compose(ctx, middlewares)();

            const response = {
                statusCode: ctx.response.statusCode,
                body: objectToString({
                    message: ctx.response.message,
                    data: ctx.response.body
                })
            };

            logger.info(response, "RESPONSE");

            return response;
        } catch (err) {
            logger.error(err, "EXCEPTION GLOBAL");

            const response = {
                statusCode: 500,
                body: objectToString({
                    message: "Something went wrong. Contact your provider."
                })
            };

            if (err instanceof BaseException) {
                response.statusCode = err.status;
                response.body = objectToString({
                    message: err.message
                });
            }

            logger.info(response, "ERROR");

            return response;
        }
    }