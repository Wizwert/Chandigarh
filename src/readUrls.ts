import {OAuth2Client} from 'google-auth-library';
import {ChandigarhSheetID} from './constants';
import SheetWrapper from './SheetWrapper';
import {getClient} from './tokenUtil';

const readUrls = async () => {
  const client = await getClient();

  const existingData = await readSheet(client);

  return existingData;
};

const readSheet = async (auth: OAuth2Client) : Promise<Map<string, URL[]>> => {
  const chandigarhSheet = new SheetWrapper(ChandigarhSheetID, auth);
  const headerMap = await chandigarhSheet.getHeaderLookup('P');

  const linkColumnOrdinal = headerMap.get('Link');
  if (!linkColumnOrdinal) throw new Error('Cannot find link column, did the name change?');

  const rows = await chandigarhSheet.read('A2:P');

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


export {readUrls, getCleanUrls};
