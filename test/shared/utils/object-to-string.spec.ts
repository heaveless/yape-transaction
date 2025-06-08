import { objectToString } from '@/shared/utils/object-to-string';

describe('objectToString', () => {
  it('should stringify a simple object', () => {
    const obj = { name: 'Alice', age: 30 };
    const result = objectToString(obj);

    expect(result).toBe(JSON.stringify(obj));
  });

  it('should stringify a nested object', () => {
    const obj = { user: { id: 1, profile: { email: 'a@example.com' } } };
    const result = objectToString(obj);

    expect(result).toBe(JSON.stringify(obj));
  });

  it('should throw when given a circular reference', () => {
    const obj: any = {};
    obj.self = obj;

    expect(() => objectToString(obj)).toThrow(TypeError);
  });

  it('should stringify arrays as objects', () => {
    const arr = [1, 2, 3];
    const result = objectToString(arr);

    expect(result).toBe('[1,2,3]');
  });
});