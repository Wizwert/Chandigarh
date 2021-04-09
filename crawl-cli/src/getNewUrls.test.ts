// import { UrlLookup } from './crawl/readUrls';
// import {getNewUrls, getNewUrlsFromManySources, areUrlsMatchy, getCleanHost} from './getNewUrls';

// const assertUrls = (actual: URL[], expected: URL[]) => {
//   expect(actual).toHaveLength(expected.length);
//   expected.forEach((e) => {
//     expect(actual).toContainEqual<URL>(e);
//   });
// };

// describe('getNewUrls', () =>{
//   test('Url Already Exists - Returns Nothing', () =>{
//     const existingUrls = new UrlLookup();
//     existingUrls['bleacherreport.com'] = [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')];

//     const newUrls = [new URL('https://bleacherreport.com/dallas-cowboys')];

//     const expected : URL[] = [];

//     const actual = getNewUrls(existingUrls, newUrls);

//     assertUrls(actual, expected);
//   });

//   test('New Host - Returns New URL', () =>{
//     const existingUrls = new UrlLookup();
//     existingUrls['bleacherreport.com'] = [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')];

//     const newUrls = [new URL('https://us.cnn.com/')];

//     const expected : URL[] = [new URL('https://us.cnn.com/')];

//     const actual = getNewUrls(existingUrls, newUrls);

//     assertUrls(actual, expected);
//   });

//   test('Same Host, New URL - Returns New URL', () =>{
//     const existingUrls = new UrlLookup();
//     existingUrls['bleacherreport.com'] = [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')];

//     const newUrls = [new URL('https://bleacherreport.com/rugby')];

//     const expected : URL[] = [new URL('https://bleacherreport.com/rugby')];

//     const actual = getNewUrls(existingUrls, newUrls);

//     assertUrls(actual, expected);
//   });

//   test('GetCleanHost', () => {
//     const testString = 'www.ragoarts.com';
//     const expected = 'ragoarts.com';

//     const actual = getCleanHost(testString);

//     expect(actual).toBe(expected);
//   });
// });

// describe('Get New Urls From Many', () => {
//   test('Url Already Exists - Returns Nothing', () =>{
//     const existingUrls = new UrlLookup();
//     existingUrls['bleacherreport.com'] = [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')];

//     const otherExistingUrls = new UrlLookup();
//     otherExistingUrls['www.metoffice.gov.uk'] = [new URL('https://www.metoffice.gov.uk/weather/forecast/gcpv7fnqu'), new URL('https://www.metoffice.gov.uk/weather/forecast/gcrwgdr98')];

//     const newUrls = [new URL('https://bleacherreport.com/dallas-cowboys')];

//     const expected : URL[] = [];

//     const actual = getNewUrlsFromManySources(newUrls, existingUrls, otherExistingUrls);

//     assertUrls(actual, expected);
//   });

//   test('New Host - Returns New URL', () =>{
//     const existingUrls = new UrlLookup();
//     existingUrls['bleacherreport.com'] = [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')];

//     const otherExistingUrls = new UrlLookup();
//     otherExistingUrls['www.metoffice.gov.uk'] = [new URL('https://www.metoffice.gov.uk/weather/forecast/gcpv7fnqu'), new URL('https://www.metoffice.gov.uk/weather/forecast/gcrwgdr98')];

//     const newUrls = [new URL('https://us.cnn.com/')];

//     const expected : URL[] = [new URL('https://us.cnn.com/')];

//     const actual = getNewUrlsFromManySources(newUrls, existingUrls, otherExistingUrls);

//     assertUrls(actual, expected);
//   });

//   test('Same Host, New URL - Returns New URL', () =>{
//     const existingUrls = new UrlLookup();
//     existingUrls['bleacherreport.com'] = [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')];

//     const otherExistingUrls = new UrlLookup();
//     otherExistingUrls['www.metoffice.gov.uk'] = [new URL('https://www.metoffice.gov.uk/weather/forecast/gcpv7fnqu'), new URL('https://www.metoffice.gov.uk/weather/forecast/gcrwgdr98')];

//     const newUrls = [new URL('https://bleacherreport.com/rugby')];

//     const expected : URL[] = [new URL('https://bleacherreport.com/rugby')];

//     const actual = getNewUrlsFromManySources(newUrls, existingUrls, otherExistingUrls);

//     assertUrls(actual, expected);
//   });
// });

// describe('IDs in URL', () => {
//   test('Lot ID in Left URL', () =>{
//     const leftUrl = new URL('https://www.christies.com/lotfinder/lot/pierre-jeanneret-a-pair-of-teak-and-4928016-details.aspx?from=searchresults&intObjectID=4928016&sid=041a38d3-aee3-4a44-972c-637309fd5b74');
//     const rightUrl = new URL('https://www.christies.com/lotfinder/lot_details.aspx?from=salesummery&intobjectid=4928016&lid=4');

//     expect(areUrlsMatchy(leftUrl, rightUrl)).toBeTruthy();
//   });

//   test('Lot ID in Left URL', () =>{
//     const leftUrl = new URL('https://www.christies.com/lotfinder/Lot/pierre-jeanneret-1896-1967-a-pair-of-4928050-details.aspx');
//     const rightUrl = new URL('https://www.christies.com/lotfinder/lot/pierre-jeanneret-a-pair-of-teak-stools-4928050-details.aspx?from=searchresults&intObjectID=4928050&sid=041a38d3-aee3-4a44-972c-637309fd5b74');

//     expect(areUrlsMatchy(leftUrl, rightUrl)).toBeTruthy();
//   });

//   test('Lot ID in both - saffronart', () =>{
//     const leftUrl = new URL('https://www.saffronart.com/auctions/PostWork.aspx?l=23878');
//     const rightUrl = new URL('https://www.saffronart.com/auctions/PostWork.aspx?l=23878');

//     expect(areUrlsMatchy(leftUrl, rightUrl)).toBeTruthy();
//   });
// });

// describe('Url Localization', () => {
//   test('Localization Test - no match', () =>{
//     const leftUrl = new URL('https://www.sothebys.com/en/buy/auction/2020/important-design/pierre-jeanneret-a-set-of-four-chairs-pj-si-25-a');
//     const rightUrl = new URL('https://www.sothebys.com/en/auctions/ecatalogue/2018/art-and-design-from-the-homes-of-delphine-and-reed-krakoff-n09881/lot.151.html');

//     expect(areUrlsMatchy(leftUrl, rightUrl)).toBeFalsy();
//   });

//   test('Localization Test - match', () =>{
//     const leftUrl = new URL('http://www.sothebys.com/fr/auctions/ecatalogue/lot.151.html/2018/art-and-design-from-the-homes-of-delphine-and-reed-krakoff-n09881');
//     const rightUrl = new URL('https://www.sothebys.com/en/auctions/ecatalogue/2018/art-and-design-from-the-homes-of-delphine-and-reed-krakoff-n09881/lot.151.html');

//     expect(areUrlsMatchy(leftUrl, rightUrl)).toBeTruthy();
//   });

//   test('Localization Test - Aguttes', () =>{
//     const leftUrl = new URL('https://www.aguttes.com/en/lot/90667/8744133');
//     const rightUrl = new URL('https://www.aguttes.com/lot/90667/8744133?refurl=Fauteuil+dit+Senate+chair%3Cbr+%2F%3ETeck%2C+cuir%3Cbr+%2F%3E92.5+x+57.5+x+61+cm.%3Cbr+%2F%3ECirca+1955%3Cbr+%2F%3E%3Cbr+%2F%3ESenat');

//     expect(areUrlsMatchy(leftUrl, rightUrl)).toBeTruthy();
//   });
// });

// describe('Find Lot ID in last part of URL', () => {
//   test('Match Found', () => {
//     const leftUrl = new URL('https://www.sothebys.com/zh/auctions/ecatalogue/2019/contemporary-art-hk0889/lot.572.B8DP6.html');
//     const rightUrl = new URL('https://www.sothebys.com/zh/auctions/ecatalogue/2019/contemporary-art-hk0889/lot.572.html');

//     expect(areUrlsMatchy(leftUrl, rightUrl)).toBeTruthy();
//   });
// });

// describe('getNewUrlsFromManySources', () => {
//   test('happy path', () => {
//     const urls = [
//       new URL('https://www.christies.com/lotfinder/lot_details.aspx?from=salesummery&intobjectid=4928016&lid=4'),
//       new URL('https://www.christies.com/lotfinder/Lot/pierre-jeanneret-1896-1967-a-pair-of-4928050-details.aspx'),
//       new URL('http://www.sothebys.com/fr/auctions/ecatalogue/lot.151.html/2018/art-and-design-from-the-homes-of-delphine-and-reed-krakoff-n09881'),
//       new URL('https://www.sothebys.com/en/buy/auction/2020/important-design/pierre-jeanneret-a-set-of-four-chairs-pj-si-25-a'),
//       new URL('https://www.artcurial.com/en/lot-le-corbusier-1887-1965-luminaire-lc-vii-1954-1796-66'),
//       new URL('https://www.aguttes.com/en/lot/90667/8744169?offset=40&'),
//       new URL('https://www.phillips.com/detail/PIERRE-JEANNERET/HK010117/55'),
//       new URL('https://www.saffronart.com/auctions/PostWork.aspx?l=23878'),
//       new URL('https://www.ragoarts.com/auctions/2019/01/modern-design/1065'),
//       new URL('https://www.aguttes.com/en/lot/90667/8744133'),
//       new URL('https://www.sothebys.com/zh/auctions/ecatalogue/2019/contemporary-art-hk0889/lot.572.B8DP6.html'),
//     ];

//     const existingUrls = new UrlLookup();
//     const christiesURls = [
//       new URL('https://www.christies.com/lotfinder/lot/pierre-jeanneret-a-pair-of-teak-and-4928016-details.aspx?from=searchresults&intObjectID=4928016&sid=041a38d3-aee3-4a44-972c-637309fd5b74'),
//       new URL('https://www.christies.com/lotfinder/lot/pierre-jeanneret-a-pair-of-teak-stools-4928050-details.aspx?from=searchresults&intObjectID=4928050&sid=041a38d3-aee3-4a44-972c-637309fd5b74'),
//     ];
//     const sothebysUrls = [
//       new URL('https://www.sothebys.com/en/auctions/ecatalogue/2018/art-and-design-from-the-homes-of-delphine-and-reed-krakoff-n09881/lot.151.html'),
//       new URL('https://www.sothebys.com/zh/auctions/ecatalogue/2019/contemporary-art-hk0889/lot.572.html'),
//     ];
//     const artcurialUrls = [
//       new URL('https://www.artcurial.com/en/lot-pierre-jeanneret-1896-1967-table-de-travail-pour-sculpteur-circa-1955-1796-86'),
//     ];
//     const aguttesUrls = [
//       new URL('https://www.aguttes.com/lot/90667/8744169?refurl=Table%3Cbr+%2F%3ETeck%3Cbr+%2F%3E40+x+59+x+55+cm.%3Cbr+%2F%3ECirca+1960%3Cbr+%2F%3E%3Cbr+%2F%3ECoffee+table%3Cbr+%2F%3ETeak-veneered+woo'),
//       new URL('https://www.aguttes.com/lot/90667/8744133?refurl=Fauteuil+dit+Senate+chair%3Cbr+%2F%3ETeck%2C+cuir%3Cbr+%2F%3E92.5+x+57.5+x+61+cm.%3Cbr+%2F%3ECirca+1955%3Cbr+%2F%3E%3Cbr+%2F%3ESenat'),
//     ];
//     const phillipsUrls = [
//       new URL('https://www.phillips.com/detail/pierre-jeanneret/HK010117/55?fromSearch=pierre%20jeanneret&searchPage=1'),
//     ];
//     const saffronartUrls = [
//       new URL('https://www.saffronart.com/auctions/PostWork.aspx?l=23878'),
//     ];
//     const ragoartsUrls = [
//       new URL('https://archive.ragoarts.com/auctions/2019/01/20/modern-design/1065'),
//     ];
//     existingUrls['www.christies.com'] = christiesURls;
//     existingUrls['www.sothebys.com'] = sothebysUrls;
//     existingUrls['www.artcurial.com'] = artcurialUrls;
//     existingUrls['www.aguttes.com'] = aguttesUrls;
//     existingUrls['www.phillips.com'] = phillipsUrls;
//     existingUrls['www.saffronart.com'] = saffronartUrls;
//     existingUrls['www.ragoarts.com'] = ragoartsUrls;

//     const dedupedUrls = getNewUrlsFromManySources(urls, existingUrls);

//     expect(dedupedUrls.length).toBe(2);
//   });
// });
