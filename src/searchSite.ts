const searchSite = async (domain: string, searchTerm: string) : Promise<URL[]> => {
  const urls: URL[] = [];
  const scraper = require('puppeteer-google-scraper');

  await scraper(searchTerm, {limit: Number.MAX_VALUE, headless: true}).then((d: any) => {
    d.forEach(function(value: any) {
      urls.push(new URL(value.url));
    });
  }).catch((err: any) => {
    console.error(err);
  });

  return urls;
};

export {searchSite};
