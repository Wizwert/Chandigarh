import { readUrls, readRejectedUrls, readAlreadyAddedAutomationUrls, UrlLookup } from './readUrls';
import { searchSite } from '../searchSite';
import { getNewUrlsFromManySources, mergeExistingUrls } from '../getNewUrls';
import { writeURL } from '../writeUrl';
import { writeLog } from '../LogUtil';
import SheetWrapper from '../SheetWrapper';
import { getClient } from '../tokenUtil';
import getSheetId from './getSheetId';
import { IUrlLookup } from './readUrls';
import { ISearchResult } from '../searchSite';

const crawl = async (isTest: boolean = false, timeframe: string) => {
  console.log('Is running in test mode: ', isTest);
  const sheetId = await getSheetId(writeLog, isTest);
  try {
    const tabName = 'URL Automation' //await createTabForResults(sheetId);
    writeLog(sheetId, `Created tab for results. Tab Name: [${tabName}]`);
    writeLog(sheetId, 'Loading Urls from master file');
    const validatedUrls = await readUrls();
    writeLog(sheetId, 'Loading Urls from Rejected Tab');
    const rejectedUrls = await readRejectedUrls(sheetId);
    writeLog(sheetId, 'Loading Urls from Automation Sheet');
    const alreadyAddedUrls = await readAlreadyAddedAutomationUrls(sheetId);

    const allExisting = mergeExistingUrls(validatedUrls, rejectedUrls, alreadyAddedUrls);
    const formattedDate = getFormattedDate();

    await findNewUrlsForDomains(validatedUrls, sheetId, tabName, allExisting, formattedDate, timeframe);
  } catch (error) {
    writeLog(sheetId, `Error when processing. Error: [${error}]`);
  }

  writeLog(sheetId, 'Finished Crawling');
};

const findNewUrlsForDomains = async (validatedUrls: IUrlLookup, sheetId: string, tabName: string, existingUrls: IUrlLookup, formattedDate: string, timeframe: string): Promise<ISearchResult[]> => {
  const urls: ISearchResult[] = [];
  for (let domain in validatedUrls) {
    try {
      const searchTerm = `site:${domain} Chandigarh`;
      await writeLog(sheetId, `Starting search for [${domain}]`);

      const urls = await searchSite(searchTerm, timeframe, (msg) => writeLog(sheetId, msg));
      
      const newUrls = getNewUrlsFromManySources(urls, existingUrls);
      urls.push(...newUrls);
      await writeLog(sheetId, `Found [${newUrls.length}] for [${domain}]`);

      if(newUrls.length === 0){ 
        continue;
      }

      await writeURL(newUrls, sheetId, formattedDate, tabName);

      await writeLog(sheetId, `Wrote URLS for [${domain}]`);

    } catch (error) {
      writeLog(sheetId, `Error when processing [${domain}]. Error: [${error}]`);
    }
  }

  return urls;
};

const createTabForResults = async (sheetId: string): Promise<string> => {
  const tabName = getFormattedDate();
  const client = await getClient();
  const sheetWrapper = new SheetWrapper(sheetId, client);
  sheetWrapper.createSheet(tabName);
  return tabName;
};

const getFormattedDate = (): string => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  const yyyy = today.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

const sleep = async (milliseconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

export { crawl };