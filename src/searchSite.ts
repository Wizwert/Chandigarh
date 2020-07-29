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

  const links = await page.$$eval('a', (as) => as.map((a) => (a as HTMLAnchorElement).href));
  const pageLinks = links.filter((l) => l.startsWith(domain));
  console.log(pageLinks);
  page.pdf({path: './search.pdf'});

  const urls: URL[] = [];
  return urls;
};

export {searchSite};
