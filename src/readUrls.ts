import {OAuth2Client} from 'google-auth-library';
import {chandigarhSheetID, automationSheetID, domainsToInclude} from './constants';
import SheetWrapper from './SheetWrapper';
import {getClient} from './tokenUtil';
import {reject} from 'lodash';

const readUrlsFromWorkingSheet = async () => {
  const client = await getClient();

  const chandigarhSheet = new SheetWrapper(ChandigarhSheetID, client);

  /**
   * Get all the sheets from the Working spreadsheet.
   */
  const sheets = (await chandigarhSheet.googleApi.spreadsheets.get({
    spreadsheetId: chandigarhSheet.sheetID,
  }));

  /**
   * Grab the titles of all the sheets inside the Working spreadsheet.
   */
  const titles = sheets.data.sheets?.map((chandigarhSheet) => {
    const title = chandigarhSheet.properties?.title || '';
    if (title) {
      return title;
    }
  });

  /**
   * Parse the urls from each sheet and append them to the existingData map.
   */
  const existingData = new Map<string, URL[]>();
  if (!titles) {
    return existingData;
  };

  for (let i = 0; i < titles.length; i++ ) {
    const title = titles[i];
    if (!title) {
      continue;
    }
    const readData: Map<string, URL[]> = await readSheet(client, ChandigarhSheetID, title, 'Link');

    readData.forEach((value, key) => {
      if (existingData.has(key)) {
        existingData.set(key, [...value, ...(existingData.get(key) || [])]);
      } else {
        existingData.set(key, value);
      }
    });
  };

  return existingData;
};

const readRejectedUrls = async () => {
  const client = await getClient();

  const existingData = await readSheet(client, automationSheetID, 'Rejected Urls', 'href');

  return existingData;
};

const readAlreadyAddedAutomationUrls = async () => {
  const client = await getClient();

  const existingData = await readSheet(client, automationSheetID, 'New Urls', 'href');

  return existingData;
};

const readSheet = async (auth: OAuth2Client, sheetId: string, tabName: string, linkcolumnName: string) : Promise<Map<string, URL[]>> => {
  const chandigarhSheet = new SheetWrapper(sheetId, auth);
  const headerMap = await chandigarhSheet.getHeaderLookup(`P`, tabName);

  const linkColumnOrdinal = headerMap.get(linkcolumnName);

  if (linkColumnOrdinal === null || linkColumnOrdinal === undefined) throw new Error(`Cannot find ${linkcolumnName} column, did the name change?`);

  const rows = await chandigarhSheet.read(`'${tabName}'!A2:P`);

  const urls = getCleanUrls(rows, linkColumnOrdinal);

  const groupedByDomain = groupBy(urls, (x) => x.hostname);

  return groupedByDomain;
};

const groupBy = <TList, TKey>(list: TList[], keyGetter: (x: TList) => TKey) : Map<TKey, TList[]> => {
  const map = new Map<TKey, TList[]>();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
};

const getCleanUrls = (rows: any[][], linkColumnOrdinal: number) : URL[] => {
  const urls = rows.map((r) => {
    try {
      return new URL(r[linkColumnOrdinal].toString());
    } catch {
      return null;
    }
  });
  return urls.filter((u) => u) as URL[];
};


export {readUrlsFromWorkingSheet as readUrls, getCleanUrls, readRejectedUrls, readAlreadyAddedAutomationUrls};
