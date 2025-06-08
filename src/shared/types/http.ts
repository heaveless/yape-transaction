import type { APIGatewayEventDefaultAuthorizerContext, APIGatewayEventRequestContextWithAuthorizer, APIGatewayProxyEventHeaders, APIGatewayProxyEventPathParameters, APIGatewayProxyEventQueryStringParameters } from "aws-lambda";

export type APIGatewayEventReponse = {
    statusCode: number;
    body: string;
};

export type HttpRequest<APIGatewayProxyEventPayload> = {
    body: APIGatewayProxyEventPayload,
    params: APIGatewayProxyEventPayload,
    query: APIGatewayProxyEventPayload,
    headers: APIGatewayProxyEventHeaders,
    context: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>
};
export type HttpResponse<TBody> = {
    statusCode: number;
    message?: string;
    body?: TBody
};

export type HttpContext<TRequest = any, TResponse = any> = {
    request: HttpRequest<TRequest>
    response: HttpResponse<TResponse>;
};

export type HttpNext = () => Promise<void>;
export type HttpMiddleware = (
    context: HttpContext,
    next: HttpNext,
) => Promise<void>;