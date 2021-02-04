import scraper, {ISearchResult} from 'puppeteer-google-scraper';
const searchSite = async (searchTerm: string, limit: number = Number.MAX_VALUE) : Promise<URL[]> => {
  const searchResults = await scraper(searchTerm, {limit, headless: true});
  return searchResults.map((value: ISearchResult) =>
    new URL(value.url),
  );
};

export {searchSite};
