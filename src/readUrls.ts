import {OAuth2Client} from 'google-auth-library';
import {ChandigarhSheetID, AutomationSheetID} from './constants';
import SheetWrapper from './SheetWrapper';
import {getClient} from './tokenUtil';

const readUrlsFromWorkingSheet = async (sheetID: string = ChandigarhSheetID) => {
  const client = await getClient();

  const existingData = await readSheet(client, sheetID, 'Masterlist', 'Link');

  return existingData;
};

const readRejectedUrls = async (sheetID: string = AutomationSheetID) => {
  const client = await getClient();

  const existingData = await readSheet(client, sheetID, 'Rejected Urls', 'href');

  return existingData;
};

const readAlreadyAddedAutomationUrls = async (sheetID: string = AutomationSheetID) => {
  const client = await getClient();

  const existingData = await readSheet(client, sheetID, 'New Urls', 'href');

  return existingData;
};

const getUrlIndexMap = async (auth: OAuth2Client, sheetId: string, tabName: string) => {
  const chandigarhSheet = new SheetWrapper(sheetId, auth);
  const rows = await chandigarhSheet.read(`'${tabName}'!A:A`);
  const urlMap = new Map<URL, number>();

  rows.forEach((row, index) =>{
    try {
      const url = new URL(row[0].toString());
      urlMap.set(url, index);
    } catch {
    }
  });

  return urlMap;
};

const readSheet = async (auth: OAuth2Client, sheetId: string, tabName: string, urlColumnName: string) : Promise<Map<string, URL[]>> => {
  const urls = await getUrlsFromSheet(auth, sheetId, tabName, urlColumnName);

  const groupedByDomain = groupBy(urls, (x) => x.hostname);

  return groupedByDomain;
};

const getUrlsFromSheet = async (auth: OAuth2Client, sheetId: string, tabName: string, urlColumnName: string) : Promise<URL[]> => {
  const chandigarhSheet = new SheetWrapper(sheetId, auth);
  const headerMap = await chandigarhSheet.getHeaderLookup(`P`, tabName);

  const linkColumnOrdinal = headerMap.get(urlColumnName);

  if (linkColumnOrdinal === null || linkColumnOrdinal === undefined) throw new Error(`Cannot find ${urlColumnName} column, did the name change?`);

  const rows = await chandigarhSheet.read(`'${tabName}'!A2:P`);

  const urls = getCleanUrls(rows, linkColumnOrdinal);

  return urls;
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


export {readUrlsFromWorkingSheet as readUrls, getCleanUrls, readRejectedUrls, readAlreadyAddedAutomationUrls, getUrlIndexMap};
