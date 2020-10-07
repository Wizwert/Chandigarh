import {readUrls, readRejectedUrls, readAlreadyAddedAutomationUrls} from './readUrls';
import {searchSite} from './searchSite';
import {getNewUrlsFromManySources} from './getNewUrls';
import {writeURL} from './writeUrl';
import {writeLog} from './LogUtil';
import {difference} from 'lodash';
import {domainsToInclude, automationSheetID, testSheetID} from './constants';
import SheetWrapper from './SheetWrapper';
import {getClient} from './tokenUtil';
import fs from 'fs';

const crawl = async (isTest: boolean = false) => {
  const sheetId = isTest ? testSheetID : automationSheetID;
  writeLog(sheetId, 'Starting to Crawl');
  try {
    console.log('Is running in test mode: ', isTest);
    const tabName = await createTabForResults(sheetId);
    writeLog(sheetId, `Created tab for results. Tab Name: [${tabName}]`);
    writeLog(sheetId, 'Loading Urls from master file');
    const existingData = await readUrls();
    writeLog(sheetId, 'Loading Urls from Rejected Tab');
    const rejectedUrls = await readRejectedUrls(sheetId);
    writeLog(sheetId, 'Loading Urls from Automation Sheet');
    const alreadyAddedUrls = await readAlreadyAddedAutomationUrls(sheetId);

    const domains = [...existingData.keys(), ...domainsToInclude];
    const newDomains = difference(domains, ...alreadyAddedUrls.keys());
    const olderDomains = difference(domains, newDomains);

    // Start with domains that have never been in the sheet, so if processing errors we get the
    // most bang for our buck
    const urlsFromNewDomains = await findNewUrlsForDomains(newDomains, sheetId, tabName, existingData, rejectedUrls, alreadyAddedUrls);
    const urlsFromOlderDomains = await findNewUrlsForDomains(olderDomains, sheetId, tabName, existingData, rejectedUrls, alreadyAddedUrls);
  } catch (error) {
    writeLog(sheetId, `Error when processing. Error: [${error}]`);
  }

  writeLog(sheetId, 'Finished Crawling');
};

const findNewUrlsForDomains = async (domains: string[], sheetId: string, tabName: string, ...existingUrls: Map<string, URL[]>[]) : Promise<URL[]> =>{
  const urls: URL[] = [];
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    try {
      const searchTerm = `site:${domain} Chandigarh`;
      await writeLog(sheetId, `Starting search for [${domain}]`);

      const urls = await searchSite(searchTerm);

      const newUrls : URL[] = getNewUrlsFromManySources(urls, ...existingUrls);
      urls.push(...newUrls);
      await writeLog(sheetId, `Found [${newUrls.length}] for [${domain}]`);

      await writeURL(newUrls, sheetId, tabName);

      if (i !== domains.length - 1) {
        await sleep(Math.floor(10000 + Math.random() * 20000));
      }
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

export {crawl};