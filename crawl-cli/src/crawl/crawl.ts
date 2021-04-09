import { readUrls, readRejectedUrls, readAlreadyAddedAutomationUrls, UrlLookup } from './readUrls';
import { searchSite } from '../searchSite';
import { getNewUrlsFromManySources, mergeExistingUrls } from '../getNewUrls';
import { writeURL } from '../writeUrl';
import { writeLog, announce } from '../LogUtil';
import SheetWrapper from '../SheetWrapper';
import { getClient } from '../tokenUtil';
import getSheetId from './getSheetId';
import { IUrlLookup } from './readUrls';
import { ISearchResult } from '../searchSite';
import AsciiTable from "ascii-table";

const crawl = async (isTest: boolean = false, timeframe: string) => {  
  console.log('Is running in test mode: ', isTest);
  const sheetId = await getSheetId(writeLog, isTest);
  try {
    const tabName = 'URL Automation' //await createTabForResults(sheetId);
    writeLog(`Created tab for results. Tab Name: [${tabName}]`);
    writeLog('Loading Urls from master file');
    const validatedUrls = await readUrls();
    writeLog('Loading Urls from Rejected Tab');
    const rejectedUrls = await readRejectedUrls(sheetId);
    writeLog('Loading Urls from Automation Sheet');
    const alreadyAddedUrls = await readAlreadyAddedAutomationUrls(sheetId);

    const allExisting = mergeExistingUrls(validatedUrls, rejectedUrls, alreadyAddedUrls);
    const formattedDate = getFormattedDate();

    const result = await findNewUrlsForDomains(validatedUrls, sheetId, tabName, allExisting, formattedDate, timeframe);

    const table = new AsciiTable();
    table.setHeading('Site', 'New Links Found');
    for(let d in alreadyAddedUrls){
      table.addRow(d, result.filter(x => x.url.hostname === d).length);
    }
    
    announce("```" + table.toString() + "```");
    
  } catch (error) {
    writeLog(`Error when processing. Error: [${error}]`);
  }

  writeLog('Finished Crawling');
};

const findNewUrlsForDomains = async (validatedUrls: IUrlLookup, sheetId: string, tabName: string, existingUrls: IUrlLookup, formattedDate: string, timeframe: string): Promise<ISearchResult[]> => {
  const urls: ISearchResult[] = [];
  for (let domain in validatedUrls) {
    try {
      const searchTerm = `site:${domain} Chandigarh`;
      await writeLog(`Starting search for [${domain}]`);

      const urls = await searchSite(searchTerm, timeframe, writeLog);

      const newUrls = getNewUrlsFromManySources(urls, existingUrls);
      urls.push(...newUrls);
      await writeLog(`Found [${newUrls.length}] for [${domain}]`);

      if (newUrls.length === 0) {
        continue;
      }

      await writeURL(newUrls, sheetId, formattedDate, tabName);

      await writeLog( `Wrote URLS for [${domain}]`);

    } catch (error) {
      writeLog(`Error when processing [${domain}]. Error: [${error}]`);
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