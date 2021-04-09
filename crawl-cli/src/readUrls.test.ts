import {getCleanUrls} from './readUrls';

describe('readUrls', () => {
  describe('getCleanUrls', () => {
    test('happy path', () => {
      const rows = [
        ['test', 'http://wwww.google.com', 'A1'],
        ['foo', 'http://wwww.github.com', 'B1'],
        ['bar', 'http://wwww.netflix.com', 'C1'],
        ['fee', 'http://wwww.espn.com', 'D1'],
        ['foe', 'http://wwww.cnn.com', 'E1'],
      ];

      const urlIndex = 1;

      const expected: URL[] = [
        new URL('http://wwww.google.com'),
        new URL('http://wwww.github.com'),
        new URL('http://wwww.netflix.com'),
        new URL('http://wwww.espn.com'),
        new URL('http://wwww.cnn.com'),
      ];

      const actual = getCleanUrls(rows, urlIndex);

      expected.forEach((e) => expect(actual).toContainEqual(e));
    });
  });
});