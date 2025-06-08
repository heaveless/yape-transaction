import { createSchema } from '@/functions/create/schema';

describe('createSchema', () => {
    const validInput = {
        sourceAccountId: 'b58d69f1-f2c9-4a51-8a53-83d314c3d024',
        destinationAccountId: 'beab49d5-4e8f-4e09-9cb8-c8c95de7e0b1',
        typeId: 1,
        amount: 100
    };

    it('should pass with valid input', () => {
        const result = createSchema.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validInput);
        }
    });

    it('should fail if UUIDs are invalid', () => {
        const input = {
            ...validInput,
            sourceAccountId: 'invalid',
            destinationAccountId: 'not-a-uuid'
        };
        const result = createSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            const messages = result.error.errors.map(e => e.path.join('.') + ': ' + e.message);
            expect(messages).toContain('sourceAccountId: Invalid uuid');
            expect(messages).toContain('destinationAccountId: Invalid uuid');
        }
    });

    it('should fail if typeId is not positive', () => {
        const input = {
            ...validInput,
            typeId: -3
        };
        const result = createSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().typeId?._errors).toContain('Number must be greater than 0');
        }
    });

    it('should fail if amount is not a number', () => {
        const input = {
            ...validInput,
            amount: "fifty" as any
        };
        const result = createSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().amount?._errors).toContain('Expected number, received string');
        }
    });
});