import type {logWriter} from './logUtil';
import {automationSheetID, testSheetID} from './constants';

export default async (logWriter: logWriter, isTest: boolean = false): Promise<string> => {
  const sheetId = isTest ? testSheetID : automationSheetID;
  await logWriter(sheetId, 'Starting to Crawl');
  return sheetId;
};