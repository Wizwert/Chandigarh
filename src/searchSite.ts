import puppeteer from 'puppeteer';

const searchSite = async (domain: string, searchTerm: string) : Promise<URL[]> => {
  const browser = await puppeteer.launch({
    defaultViewport: {
      height: 1080,
      width: 1920,
    },
  });

  const page = await browser.newPage();

  await page.goto('https://www.google.com');
  console.log('navigated to google');
  const searchPhrase = `site:${domain} ${searchTerm}`;
  await page.type('input[title="Search"]', searchPhrase);
  console.log('searched');

  await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
    page.keyboard.press('Enter'),
  ]);

  // TODO: Navigate all the pages not just first.
  const links = await page.$$eval('a', (as) => as.map((a) => (a as HTMLAnchorElement).href));
  const pageLinks = links.filter((link) => link !== '' && (new URL(link)).hostname == domain).map((l) => new URL(l));

  let urls: URL[] = [];
  const scraper = require('puppeteer-google-scraper');
  scraper(searchTerm, {limit: Number.MAX_VALUE, headless: true}).then((d: any) => {
    urls.push(new URL(d.url));
  });

  // page.pdf({path: './search.pdf'});
  return urls;
};

export {searchSite};
