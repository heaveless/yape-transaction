import { Status } from '@/functions/create/type';

describe('Status enum', () => {
    it('should have PENDING as 0', () => {
        expect(Status.PENDING).toBe(0);
    });

    it('should support reverse mapping from number to string', () => {
        expect(Status[0]).toBe('PENDING');
    });
});