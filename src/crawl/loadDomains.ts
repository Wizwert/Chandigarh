import {logWriter} from '../logUtil';

export default async (sheetId: string, logger: logWriter) => {
  logger(sheetId, 'Loading Urls from master file');
  const existingData = await readUrls();
  logger(sheetId, 'Loading Urls from Rejected Tab');
  const rejectedUrls = await readRejectedUrls(sheetId);
  logger(sheetId, 'Loading Urls from Automation Sheet');
  const alreadyAddedUrls = await readAlreadyAddedAutomationUrls(sheetId);
};