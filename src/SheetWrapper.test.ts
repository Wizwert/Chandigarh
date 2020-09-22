import SheetWrapper from './SheetWrapper';
import {OAuth2Client} from 'google-auth-library';
import {sheets_v4 as sheetsV4} from 'googleapis/build/src/apis/sheets/v4';

type mockSheet = sheetsV4.Sheets & { setMockValue: (value: any) => void}

describe('SheetWrapper', () => {
  jest.mock('googleapis');
  describe('read', () => {
    test('no auth - throws', async () =>{
      const sheet = new SheetWrapper('test', new OAuth2Client());

      expect(sheet.read('A1')).rejects.toThrow();
    });

    test('api returns error - throws', async () =>{
      const err = 'new error';

      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({err});

      expect(sheetWrapper.read('A1')).rejects.toThrow('The API returned an error: ' + err);
    });

    test('api returns no response object - throws', async () =>{
      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({});

      expect(sheetWrapper.read('A1')).rejects.toThrow('The API returned nothing');
    });

    test('api returns null rows - throws', async () =>{
      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({res: {
        data: {
        },
      }});

      expect(sheetWrapper.read('A1')).rejects.toThrow('there are no rows!');
    });

    test('api returns null rows - throws', async () =>{
      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({res: {
        data: {
          values: [],
        },
      }});

      expect(sheetWrapper.read('A1')).rejects.toThrow('No Rows Returned');
    });

    test('api returns data - return data', async () =>{
      const rows = [
        ['A2', 'A3'],
        ['B2', 'B3'],
      ];

      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({res: {
        data: {
          values: rows,
        },
      }});
      expect(sheetWrapper.read('A1')).resolves.toBe(rows);
    });
  });
  describe('getHeaderLookup', () => {
    test('get header lookup', async () => {
      const columns = [
        ['A2'],
        ['B2'],
        ['C2'],
        ['D2'],
      ];

      const expectedResult = new Map<string, number>();
      expectedResult.set('A2', 0);
      expectedResult.set('B2', 1);
      expectedResult.set('C2', 2);
      expectedResult.set('D2', 3);

      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({res: {
        data: {
          values: columns,
        },
      }});

      expect(sheetWrapper.getHeaderLookup('N', '')).resolves.toBe<Map<string, number>>(expectedResult);
    });
  });
});