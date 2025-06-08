import { getOneSchema } from '@/functions/get-one/schema';

describe('getOneSchema', () => {
    it('should pass with valid UUID', () => {
        const result = getOneSchema.safeParse({
            id: 'b58d69f1-f2c9-4a51-8a53-83d314c3d024'
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.id).toBeDefined();
        }
    });

    it('should fail if id is not a UUID', () => {
        const result = getOneSchema.safeParse({
            id: 'not-a-uuid'
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().id?._errors[0]).toMatch(/Invalid uuid/i);
        }
    });

    it('should fail if id is missing', () => {
        const result = getOneSchema.safeParse({});

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().id?._errors[0]).toMatch(/Required/i);
        }
    });
});