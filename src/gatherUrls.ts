import {readUrls, readRejectedUrls, readAlreadyAddedAutomationUrls} from './readUrls';
import {searchSite} from './searchSite';
import {getNewUrlsFromManySources} from './getNewUrls';
import {writeURL} from './writeUrl';
import {writeLog} from './LogUtil';

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

    domains.forEach((domain) => {
      const searchTerm = `site:${domain} Chandigarh`;
      writeLog(`Starting search for [${domain}]`);
      searchSite(searchTerm).then((urls) =>{
        const newUrls : URL[] = getNewUrlsFromManySources(urls, existingData, rejectedUrls, alreadyAddedUrls);
        writeLog(`Found [${newUrls.length}] for [${domain}]`);
        writeURL(newUrls);
      }, (error) => {
        writeLog(`Error when processing [${domain}]. Error: [${error}]`);
      });
    });
  } catch (error) {
    writeLog(`Error when processing. Error: [${error}]`);
  }

  writeLog('Finished Crawling');
};

export {gatherUrls};