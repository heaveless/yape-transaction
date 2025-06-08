import { z, ZodError } from 'zod';
import { formatError } from '@/shared/utils/format-error';

describe('formatError', () => {
    it('should format a single field error', () => {
        const schema = z.object({
            name: z.string().min(3, "Too short")
        });

        try {
            schema.parse({ name: 'Al' });
        } catch (err) {
            const zodErr = err as ZodError;
            const message = formatError(zodErr);
            expect(message).toBe('name: Too short');
        }
    });

    it('should format multiple field errors separated by |', () => {
        const schema = z.object({
            name: z.string().min(3, "Too short"),
            age: z.number().min(18, "Too young"),
        });

        try {
            schema.parse({ name: '', age: 12 });
        } catch (err) {
            const zodErr = err as ZodError;
            const message = formatError(zodErr);
            expect(message).toContain('name');
            expect(message).toContain('age');
            expect(message).toContain('|');
        }
    });

    it('should handle nested errors with full paths', () => {
        const schema = z.object({
            user: z.object({
                email: z.string().email("Invalid email")
            })
        });

        try {
            schema.parse({ user: { email: 'not-an-email' } });
        } catch (err) {
            const zodErr = err as ZodError;
            const message = formatError(zodErr);
            expect(message).toBe('user.email: Invalid email');
        }
    });
});