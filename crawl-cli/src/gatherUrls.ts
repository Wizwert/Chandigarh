import {readUrls, readRejectedUrls, readAlreadyAddedAutomationUrls} from './readUrls';
import {searchSite} from './searchSite';
import {getNewUrlsFromManySources} from './getNewUrls';
import {writeURL} from './writeUrl';
import {writeLog} from './LogUtil';
import {difference} from 'lodash';

const gatherUrls = async () => {
  writeLog('Starting to Crawl');

  try {
    writeLog('Loading Urls from master file');
    const existingData = await readUrls();
    writeLog('Loading Urls from Rejected Tab');
    const rejectedUrls = await readRejectedUrls();
    writeLog('Loading Urls from Automation Sheet');
    const alreadyAddedUrls = await readAlreadyAddedAutomationUrls();

    const domains = [...existingData.keys()];
    const newDomains = difference(domains, ...alreadyAddedUrls.keys());
    const olderDomains = difference(domains, newDomains);

    // Start with domains that have never been in the sheet, so if processing errors we get the
    // most bang for our buck
    await findNewUrlsForDomains(newDomains, existingData, rejectedUrls, alreadyAddedUrls);
    await findNewUrlsForDomains(olderDomains, existingData, rejectedUrls, alreadyAddedUrls);
  } catch (error) {
    writeLog(`Error when processing. Error: [${error}]`);
  }

  writeLog('Finished Crawling');
};

const findNewUrlsForDomains = async (domains: string[], ...existingUrls: Map<string, URL[]>[]) =>{
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    try {
      const searchTerm = `site:${domain} Chandigarh`;
      writeLog(`Starting search for [${domain}]`);

      const urls = await searchSite(searchTerm);

      const newUrls : URL[] = getNewUrlsFromManySources(urls, ...existingUrls);

      writeLog(`Found [${newUrls.length}] for [${domain}]`);

      writeURL(newUrls);

      if (i !== domains.length - 1) {
        await sleep(Math.floor(10000 + Math.random() * 20000));
      }
    } catch (error) {
      writeLog(`Error when processing [${domain}]. Error: [${error}]`);
    }
  }
};

const sleep = async (milliseconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

export {gatherUrls};