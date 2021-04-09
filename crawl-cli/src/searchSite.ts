import { google } from 'googleapis';
import { customsearch_v1 } from 'googleapis/build/src/apis/customsearch/v1';
import { IImageCell } from './SheetWrapper';

export interface ISearchResult {
  snippet: string,
  url: URL,
  image: IImageCell
}

const searchSite = async (query: string, timeframe: string = '6m', writeLog: (message: string) => void = (msg) => console.log(msg)): Promise<ISearchResult[]> => {
  const search = google.customsearch("v1");

  const urls: ISearchResult[] = [];
  let result: customsearch_v1.Schema$Search;
  let start = 1;
  let total = 0;

  do {
    if(start >= 100) {
      break;
    }
    writeLog(`Running Query. Start At: [${start}] Total: [${total}]`)
    result = await runSearch(search, start, query, timeframe);
    
    total = result.searchInformation?.totalResults && parseInt(result.searchInformation?.totalResults || "0") || 0;

    const resultUrls = getResults(result);
    
    resultUrls.forEach(x => urls.push(x));
    start += 10
    
    await sleep(650);

  } while (start + 10 <= Math.min(total, 100))

  return urls;
};

const getResults = (result: customsearch_v1.Schema$Search): ISearchResult[] => {
  const searchResults: ISearchResult[] = [];

  if(!result.items){
    return searchResults;
  }

  result.items.forEach(x => {
    if(!x.link){
      return;
    }

    const item : ISearchResult = {
      url: new URL(x.link),
      snippet: x.snippet || '',
      image: x.pagemap?.cse_thumbnail ? x.pagemap.cse_thumbnail[0] : x.pagemap?.cse_image ?  x.pagemap.cse_image[0] : {
        src: '',
        height: '',
        width: '',
      }
    }

    searchResults.push(item);
  });

  return searchResults;
}

const runSearch = async (search: customsearch_v1.Customsearch, start: number = 0, query: string, timeframe: string): Promise<customsearch_v1.Schema$Search> => {
  return new Promise<customsearch_v1.Schema$Search>((resolve, reject) => {
    search.cse.siterestrict.list({
      access_token: process.env.CSE_Token,
      cx: process.env.CSE_Search_ID,
      num: 10,
      lr: 'lang_en',
      start: start,
      q: query,
      key: process.env.CSE_api_key,
    }).then(x => resolve(x.data)).catch(x => console.log(x));
  })
}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export { searchSite };
