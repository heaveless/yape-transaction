import { updateSchema } from '@/functions/update/schema';

describe('updateSchema', () => {
    const valid = {
        id: 'b58d69f1-f2c9-4a51-8a53-83d314c3d024',
        statusId: 1
    };

    it('should pass with valid input', () => {
        const result = updateSchema.safeParse(valid);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(valid);
        }
    });

    it('should fail if id is not a UUID', () => {
        const result = updateSchema.safeParse({ ...valid, id: 'not-a-uuid' });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().id?._errors[0]).toMatch(/Invalid uuid/i);
        }
    });

    it('should fail if statusId is missing', () => {
        const { statusId, ...partial } = valid;
        const result = updateSchema.safeParse(partial);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().statusId?._errors[0]).toMatch(/Required/i);
        }
    });

    it('should fail if statusId is negative', () => {
        const result = updateSchema.safeParse({ ...valid, statusId: -1 });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().statusId?._errors[0]).toMatch(/greater than 0/i);
        }
    });

    it('should fail if statusId is not a number', () => {
        const result = updateSchema.safeParse({ ...valid, statusId: 'active' as any });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().statusId?._errors[0]).toMatch(/Expected number/i);
        }
    });
});