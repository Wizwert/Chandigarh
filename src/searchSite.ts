import scraper, {ISearchResult} from 'puppeteer-google-scraper';
const searchSite = async (domain: string, searchTerm: string) : Promise<URL[]> => {
  const searchResults = await scraper(searchTerm, {limit: Number.MAX_VALUE, headless: true});
  return searchResults.map((value: ISearchResult) =>
    new URL(value.url),
  );
};

export {searchSite};
