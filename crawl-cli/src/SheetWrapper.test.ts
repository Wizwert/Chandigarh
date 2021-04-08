import SheetWrapper, { isImageCell } from './SheetWrapper';
import { OAuth2Client } from 'google-auth-library';
import { sheets_v4 as sheetsV4 } from 'googleapis/build/src/apis/sheets/v4';
import 'jest-extended';

type mockSheet = sheetsV4.Sheets & { setMockValue: (value: any) => void }

describe('SheetWrapper', () => {
  jest.mock('googleapis');
  describe('read', () => {
    test('no auth - throws', async () => {
      const sheet = new SheetWrapper('test', new OAuth2Client());

      expect(sheet.read('A1')).rejects.toThrow();
    });

    test('api returns error - throws', async () => {
      const err = 'new error';

      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({ err });

      expect(sheetWrapper.read('A1')).rejects.toThrow('The API returned an error: ' + err);
    });

    test('api returns no response object - throws', async () => {
      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({});

      expect(sheetWrapper.read('A1')).rejects.toThrow('The API returned nothing');
    });

    test('api returns null rows - throws', async () => {
      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({
        res: {
          data: {
          },
        }
      });

      expect(sheetWrapper.read('A1')).rejects.toThrow('there are no rows!');
    });

    test('api returns null rows - throws', async () => {
      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({
        res: {
          data: {
            values: [],
          },
        }
      });

      expect(sheetWrapper.read('A1')).rejects.toThrow('No Rows Returned');
    });

    test('api returns data - return data', async () => {
      const rows = [
        ['A2', 'A3'],
        ['B2', 'B3'],
      ];

      const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
      const mockSheets = sheetWrapper.googleApi as mockSheet;

      mockSheets.setMockValue({
        res: {
          data: {
            values: rows,
          },
        }
      });
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

      mockSheets.setMockValue({
        res: {
          data: {
            values: columns,
          },
        }
      });

      expect(sheetWrapper.getHeaderLookup('N', '')).resolves.toBe<Map<string, number>>(expectedResult);
    });
  });
  test('transforms input', () => {
    // input
    const headerMap = { 'columnA': 0, 'columnB': 1 };

    const data = [
      'Just a string',
      ['This row has more values', 123, new Date()],
      { columnB: 123, columnA: 'ABC' },
      { columnB: 123, columnA: 'ABC', extraField: 'haha' },
    ];

    const expectedOutput = [
      ['Just a string'],
      ['This row has more values', 123, new Date()],
      ['ABC', 123],
      ['ABC', 123, 'haha'],
    ];

    const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
    const actualData = sheetWrapper.normalizeInput(data, headerMap);
    console.log(actualData);
    expect(actualData.length).toBe(expectedOutput.length);
    expect(actualData).toIncludeSameMembers(expectedOutput);
  });

  test('transform input with Image', () => {
    const wrapper = new SheetWrapper("", new OAuth2Client())
    const inputData: any[] = [{date: '08/04/2021', href: "", image: { src: '', height: '', width: '' }, snippet: ""}, { "date": "08-04-2021", "href": "https://www.sothebys.com/en/auctions/ecatalogue/2005/important-20th-century-design-n08139/lot.172.html", "snippet": "Dec 9, 2005 ... Much of Le Corbusier's decoration for the buildings in the Capitol Complex in \nChandigarh is based on the three basic realms in cosmology: the ...", "image": { "src": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRy3alOkHI_WIfCFHHFS1NeHxEIsXTCNtt3P2UOWHHfmY80JjU-nt09G9Q", "width": "225", "height": "225" } }, { "date": "08-04-2021", "href": "http://www.sothebys.com/ru/auctions/ecatalogue/2017/important-design-n09764/lot.10.html", "snippet": "13 дек 2017 ... THE COLLECTION OF HANA SOUKUPOVÁ     & DREW AARON. Pierre Jeanneret. \n\"OFFICE\" ARMCHAIR FROM CHANDIGARH, INDIA. Оценка.", "image": { "src": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTDynVQM7SYwRbPCQLSjO2oV0iyr9IdQOnEjavp3Ah-hxczVSCN6Q6VvDk", "width": "195", "height": "258" } }, { "date": "08-04-2021", "href": "https://www.sothebys.com/fr/auctions/ecatalogue/2019/20th-century-design-vo-n10083/lot.31.html", "snippet": "May 23, 2019 ... Galerie Patrick Seguin, Le Corbusier, Pierre Jeanneret: Chandigarh, India, Paris, \n2014, pp. 212-213 and 285 (for related models) ...", "image": { "src": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQmOJr6jUme08kdPe3UQaZV01f34hkN-NGgOpQr9pyEAW37TwDk4FsaF_6v", "width": "324", "height": "155" } }, { "date": "08-04-2021", "href": "https://www.sothebys.com/fr/auctions/ecatalogue/2015/important-20th-c-design-n09315/lot.178.html", "snippet": "Mar 4, 2015 ... MANHOLE COVER AND BASE FROM CHANDIGARH, INDIA. patinated cast iron \n5 3/4 in. (27.3 cm) high 30 in. (76.2 cm) diameter circa 1951- ...", "image": { "src": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRJewgrtF2PK5FYimyPzsWF3ZN4Moj-3yEmdGHxYC1mztNOjdH0_NO6DTI", "width": "227", "height": "222" } }, { "date": "08-04-2021", "href": "https://www.sothebys.com/fr/auctions/ecatalogue/2017/important-design-n09764/lot.45.html", "snippet": "Dec 13, 2017 ... Galerie Patrick Seguin, Le Corbusier, Pierre Jeanneret: Chandigarh, India, 1951-\n66, Paris, 2014, pp. 152, 153 and 282 (for the present lot ...", "image": { "src": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHzB6qZZ2bPWJBpcg-mQrxG8zFHgJuY7N7hDbcieZqWZgC0tNlNJKFljw", "width": "365", "height": "138" } }]
    const headerMap = { 'date': 0, 'href': 1, 'image': 2, 'snippet': 3 };

    const test = isImageCell({ src: '', height: '', width: '' });

    const actual = wrapper.normalizeInput(inputData, headerMap);
  });
  test('No extra columns', () => {
    // input
    const headerMap = { 'columnA': 0, 'columnB': 1 };

    const data = [
      { columnB: 123, columnA: 'ABC' },
    ];

    const expectedOutput = [
      ['ABC', 123],
    ];

    const sheetWrapper = new SheetWrapper('test', new OAuth2Client());
    const actualData = sheetWrapper.normalizeInput(data, headerMap);
    console.log(actualData);
    expect(actualData.length).toBe(expectedOutput.length);
    expect(actualData).toIncludeSameMembers(expectedOutput);
  });
});