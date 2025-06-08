import { stringToObject } from '@/shared/utils//string-to-object';

describe('stringToObject', () => {
    it('should parse a valid JSON string into an object', () => {
        const json = '{"name":"Alice","age":30}';
        const result = stringToObject<{ name: string; age: number }>(json);

        expect(result).toEqual({ name: 'Alice', age: 30 });
    });

    it('should throw an error if the JSON is invalid', () => {
        const invalidJson = '{name:"Alice"}';

        expect(() => stringToObject(invalidJson)).toThrow(SyntaxError);
    });

    it('should parse a JSON array string', () => {
        const jsonArray = '[1, 2, 3]';
        const result = stringToObject<number[]>(jsonArray);

        expect(result).toEqual([1, 2, 3]);
    });
});