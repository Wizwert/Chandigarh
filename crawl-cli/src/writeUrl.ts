import {getClient} from './tokenUtil';
import SheetWrapper from './SheetWrapper';
import { ISearchResult } from './searchSite';

const writeURL = async (data: ISearchResult[], sheetId: string, dateString: string, tabName?: string, isDebug: boolean = false) : Promise<void> => {
  if(data.length === 0){
    return;
  }

  const client = await getClient();

  const sheet = new SheetWrapper(sheetId, client);
  const urls = data.map((result) => ({ date: dateString, href: result.url.href, snippet: result.snippet, image: result.image}));
  sheet.write(urls, 'N', tabName, isDebug);
};

export {writeURL};