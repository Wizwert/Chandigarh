import { OAuth2Client } from 'google-auth-library';
import { chandigarhSheetID } from '../constants';
import { mergeExistingUrls } from '../getNewUrls';
import SheetWrapper from '../SheetWrapper';
import { getClient } from '../tokenUtil';

export interface IUrlLookup {
  [T: string]: URL[],
  [Symbol.iterator](): IterableIterator<URL[]>;
}

export class UrlLookup implements IUrlLookup {
  [T: string]: URL[];
  *[Symbol.iterator](): IterableIterator<URL[]> {
    for (let i of Object.keys(this)) {
      yield this[i];
    }
  }
}

const mergeUrlLookups = (...lookups: IUrlLookup[]): IUrlLookup => {
  if (lookups.length === 0) {
    return new UrlLookup();
  }

  const startingPoint: IUrlLookup = { ...lookups[0] };

  for (let i = 1; i < lookups.length; i++) {
    const lookup = lookups[i];
    Object.keys(lookups).forEach((key) => {
      startingPoint[key] = [...startingPoint[key], ...lookup[key]];
    });
  }

  return startingPoint;
};

const readUrlsFromWorkingSheet = async (): Promise<IUrlLookup> => {
  const client = await getClient();

  const chandigarhSheet = new SheetWrapper(chandigarhSheetID, client);

  /**
   * Get all the sheets from the Working spreadsheet.
   */
  const titles = await chandigarhSheet.getSheetNames();

  /**
   * Parse the urls from each sheet and append them to the existingData map.
   */
  const existingData: IUrlLookup = new UrlLookup();
  if (!titles) {
    return existingData;
  };

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    if (!title) {
      continue;
    }
    const readData: IUrlLookup = await readSheet(client, chandigarhSheetID, title, 'Link');
    
    Object.keys(readData).forEach((key) => {
      existingData[key] = [...(existingData[key] || []), ...readData[key]];
    });
  };
  return existingData;
};

const readRejectedUrls = async (sheetId: string): Promise<IUrlLookup> => {
  const client = await getClient();

  const existingData = await readSheet(client, sheetId, 'Rejected Urls', 'href');

  return existingData;
};

const readAlreadyAddedAutomationUrls = async (sheetId: string): Promise<IUrlLookup> => {
  const client = await getClient();

  const existingData = await readSheet(client, sheetId, 'New Urls', 'href');

  const existingData2 = await readSheet(client, sheetId, 'Url Automation', 'href');

  return mergeExistingUrls(existingData, existingData2);
};

const readSheet = async (auth: OAuth2Client, sheetId: string, tabName: string, linkcolumnName: string): Promise<IUrlLookup> => {
  const urls = await getUrlsFromSheet(auth, sheetId, tabName, linkcolumnName);
  // console.log('urls', urls)
  const urlLookup = new UrlLookup();

  urls.forEach(url => {
    const key = url.hostname;
    if (urlLookup[key]) {
      urlLookup[key].push(url)
    } else {
      urlLookup[key] = [url];
    }
  })
  return urlLookup;
};

const getUrlsFromSheet = async (auth: OAuth2Client, sheetId: string, tabName: string, urlColumnName: string): Promise<URL[]> => {
  const chandigarhSheet = new SheetWrapper(sheetId, auth);
  const headerMap = await chandigarhSheet.getHeaderLookup(`P`, tabName);

  const linkColumnOrdinal = headerMap[urlColumnName];

  if (linkColumnOrdinal === null || linkColumnOrdinal === undefined) throw new Error(`Cannot find ${urlColumnName} column, did the name change?`);

  const rows = await chandigarhSheet.read(`'${tabName}'!A2:P`);

  const urls = getCleanUrls(rows, linkColumnOrdinal);

  return urls;
};

const getCleanUrls = (rows: any[][], linkColumnOrdinal: number): URL[] => {
  const urls = rows.map((r) => {
    try {
      return new URL(r[linkColumnOrdinal].toString());
    } catch {
      return null;
    }
  });
  return urls.filter((u) => u) as URL[];
};


export { readUrlsFromWorkingSheet as readUrls, getCleanUrls, readRejectedUrls, readAlreadyAddedAutomationUrls, mergeUrlLookups };
