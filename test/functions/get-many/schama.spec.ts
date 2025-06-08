import { getManySchema } from '@/functions/get-many/schema';

describe('getManySchema', () => {
    it('should pass with valid data', () => {
        const result = getManySchema.safeParse({
            account: 'b58d69f1-f2c9-4a51-8a53-83d314c3d024',
            limit: '10',
            cursor: '0'
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.account).toBeDefined();
        }
    });

    it('should fail if account is not a UUID', () => {
        const result = getManySchema.safeParse({
            account: 'invalid-uuid',
            limit: '10',
            cursor: '0'
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().account?._errors[0]).toMatch(/Invalid uuid/i);
        }
    });

    it('should fail if limit is not numeric', () => {
        const result = getManySchema.safeParse({
            account: 'b58d69f1-f2c9-4a51-8a53-83d314c3d024',
            limit: 'ten'
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().limit?._errors[0]).toMatch(/Invalid input/i);
        }
    });

    it('should fail if cursor is not numeric', () => {
        const result = getManySchema.safeParse({
            account: 'b58d69f1-f2c9-4a51-8a53-83d314c3d024',
            cursor: 'next'
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().cursor?._errors[0]).toMatch(/Invalid input/i);
        }
    });

    it('should allow limit and cursor to be undefined (optional)', () => {
        const result = getManySchema.safeParse({
            account: 'b58d69f1-f2c9-4a51-8a53-83d314c3d024'
        });

        expect(result.success).toBe(true);
    });
});