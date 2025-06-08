export class BaseException extends Error {
    constructor(
        readonly message: string,
        readonly status: number
    ) {
        super(message);
    }
}

export class BadRequestException extends BaseException {
    constructor(message = "Bad request", status = 400) {
        super(message, status);
    }
}

export class NotFoundException extends BaseException {
    constructor(message = "Not found", status = 404) {
        super(message, status);
    }
}

export class UnauthorizedException extends BaseException {
    constructor(message = "Unauthorized", status = 401) {
        super(message, status)
    }
}
