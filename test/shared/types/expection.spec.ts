import { BaseException, BadRequestException, NotFoundException, UnauthorizedException } from '@/shared/types/exception';

describe('Custom Exceptions', () => {
    it('should create a BaseException with correct message and status', () => {
        const err = new BaseException('Base error', 500);
        expect(err).toBeInstanceOf(BaseException);
        expect(err.message).toBe('Base error');
        expect(err.status).toBe(500);
    });

    it('should create a BadRequestException with default values', () => {
        const err = new BadRequestException();
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err).toBeInstanceOf(BaseException);
        expect(err.message).toBe('Bad request');
        expect(err.status).toBe(400);
    });

    it('should create a BadRequestException with custom message and status', () => {
        const err = new BadRequestException('Custom bad request', 422);
        expect(err.message).toBe('Custom bad request');
        expect(err.status).toBe(422);
    });

    it('should create a NotFoundException with default values', () => {
        const err = new NotFoundException();
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toBe('Not found');
        expect(err.status).toBe(404);
    });

    it('should create a UnauthorizedException with default values', () => {
        const err = new UnauthorizedException();
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.message).toBe('Unauthorized');
        expect(err.status).toBe(401);
    });
});