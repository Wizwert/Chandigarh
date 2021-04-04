import {getClient} from './tokenUtil';
import {automationSheetID} from './constants';
import SheetWrapper from './SheetWrapper';

interface ILog {
  DateTime: string;
  Message: string;
}

export type logWriter = (sheetId: string, message: string) => Promise<void>;

const writeLog = async (sheetId: string, message: string) => {
  const now = new Date();
  const log: ILog = {
    DateTime: `${now.getFullYear()}-${now.getMonth()}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`,
    Message: message,
  };

  try {
    const client = await getClient();

    const logSheetWrapper = new SheetWrapper(sheetId, client);

    logSheetWrapper.write([log], 'B', 'Logs');
    console.log(`[${log.DateTime}] ${log.Message}`);
  } catch (error) {
    console.error('Encountered error while logging', error);
  }
};

export {writeLog};