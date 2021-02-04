export interface IPuppeteerGoogleScraperOptions {
  limit?: number;
  headless?: boolean;
  debugDir?: string;
  searchUrl?: string;
}

export interface ISearchResult {
  title: string;
  url: string;
}

export default function search(term: string, options?: IPuppeteerGoogleScraperOptions): Promise <ISearchResult[]>;