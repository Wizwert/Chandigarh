import scraper, {IPuppeteerGoogleScraperOptions, ISearchResult} from 'puppeteer-google-scraper';
import puppeteer from 'puppeteer';
import fs from 'fs';

interface ILinkData {
  title: string,
  url: string
}

const searchSite = async (searchTerm: string, limit: number = Number.MAX_VALUE) : Promise<URL[]> => {
  const searchResults = await searchForTerm(searchTerm, {limit, headless: true});
  return searchResults.map((value: ISearchResult) =>
    new URL(value.url),
  );
};

const searchForTerm = async (term: string, inputOptions?: IPuppeteerGoogleScraperOptions) => {
  const options = {
    limit: 100,
    headless: true,
    debugDir: '',
    searchUrl: 'https://google.com',
    ...inputOptions,
  };

  console.log('Loading the browser', options);

  const browser = await puppeteer.launch({
    headless: options.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log('Launching the page');

  const page = await browser.newPage();
  await page.goto(options.searchUrl);

  console.log('Waiting for the input');
  const searchInputSelector = 'form[action=\'/search\'] input[type=\'text\']';
  await page.waitFor(2000);

  await page.waitForFunction(searchInputSelector);
  console.log('Typing the search term');
  await page.type(searchInputSelector, term, {delay: 100}); // Types slower, like a user

  await Promise.all([page.waitForNavigation({
    waitUntil: 'networkidle0',
  }), await page.keyboard.press('Enter')]);
  console.log('Waiting for the response');
  // await page.waitForResponse(res => {
  //    return res.url().includes("/search")
  // })


  let allLinks: ILinkData[] = [];
  const doSync = async function doSync() {
    console.log('Random timeout');
    await page.waitFor(Math.floor(1000 + Math.random() * 2000));

    console.log('Waiting for the page results');
    const resultSelector = '#search a[onmousedown], #search a[ping]';
    try {
      await page.waitForFunction(resultSelector);
    } catch (error) {
      await page.screenshot({path: `./url-${page.url.toString().replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`});
      console.error('Error waiting for button', error);
      return allLinks;
    }
    console.log('Parsing the page results');

    const newLinks = await page.evaluate((resultSelector) => {
      const selectorResults = [...document.querySelectorAll(resultSelector)];

      const urlData = selectorResults.map((c) => {
        const url: ILinkData = {title: (c.querySelector('h3') || {textContent: null}).textContent as string, url: c.href as string};

        return url;
      }).filter((c) => c.title !== null);

      return urlData;
    }, resultSelector);

    allLinks = [...allLinks, ...newLinks];
    if (allLinks.length > options.limit) {
      return allLinks;
    }

    const existsNext = await page.$('#pnnext');
    if (!existsNext) {
      return allLinks;
    }

    console.log('Random timeout');
    await page.waitFor(Math.floor(1000 + Math.random() * 2000));
    console.log('Going to the next page');
    await Promise.all([page.waitForNavigation({
      waitUntil: 'networkidle0',
    }), await page.click('#pnnext', {delay: 20})]);
    await doSync();
  };

  await doSync();

  await page.waitFor(100);
  // await page.waitFor("html[itemtype=http://schema.org/SearchResultsPage]");

  console.log('Closing the browser');
  await browser.close();
  return allLinks.slice(0, options.limit);
};

export {searchSite};
