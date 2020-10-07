import {getClient} from './tokenUtil';
import SheetWrapper from './SheetWrapper';

const writeURL = async (data: URL[], sheetId: string, tabName?: string, isDebug: boolean = false) : Promise<void> => {
  const client = await getClient();

  const sheet = new SheetWrapper(sheetId, client);
  const urls = data.map((url) => url.href);
  sheet.write(urls, 'N', tabName, isDebug);
};

export {writeURL};