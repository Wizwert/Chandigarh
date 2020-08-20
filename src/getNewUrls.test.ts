import {getNewUrls, getNewUrlsFromManySources} from './getNewUrls';

const assertUrls = (actual: URL[], expected: URL[]) => {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((e) => {
    expect(actual).toContainEqual<URL>(e);
  });
};

describe('getNewUrls', () =>{
  test('Url Already Exists - Returns Nothing', () =>{
    const existingUrls = new Map<string, URL[]>();
    existingUrls.set('bleacherreport.com', [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')]);

    const newUrls = [new URL('https://bleacherreport.com/dallas-cowboys')];

    const expected : URL[] = [];

    const actual = getNewUrls(existingUrls, newUrls);

    assertUrls(actual, expected);
  });

  test('New Host - Returns New URL', () =>{
    const existingUrls = new Map<string, URL[]>();
    existingUrls.set('bleacherreport.com', [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')]);

    const newUrls = [new URL('https://us.cnn.com/')];

    const expected : URL[] = [new URL('https://us.cnn.com/')];

    const actual = getNewUrls(existingUrls, newUrls);

    assertUrls(actual, expected);
  });

  test('Same Host, New URL - Returns New URL', () =>{
    const existingUrls = new Map<string, URL[]>();
    existingUrls.set('bleacherreport.com', [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')]);

    const newUrls = [new URL('https://bleacherreport.com/rugby')];

    const expected : URL[] = [new URL('https://bleacherreport.com/rugby')];

    const actual = getNewUrls(existingUrls, newUrls);

    assertUrls(actual, expected);
  });
});

describe('Get New Urls From Many', () => {
  test('Url Already Exists - Returns Nothing', () =>{
    const existingUrls = new Map<string, URL[]>();
    existingUrls.set('bleacherreport.com', [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')]);

    const otherExistingUrls = new Map<string, URL[]>();
    otherExistingUrls.set('www.metoffice.gov.uk', [new URL('https://www.metoffice.gov.uk/weather/forecast/gcpv7fnqu'), new URL('https://www.metoffice.gov.uk/weather/forecast/gcrwgdr98')]);

    const newUrls = [new URL('https://bleacherreport.com/dallas-cowboys')];

    const expected : URL[] = [];

    const actual = getNewUrlsFromManySources(newUrls, existingUrls, otherExistingUrls);

    assertUrls(actual, expected);
  });

  test('New Host - Returns New URL', () =>{
    const existingUrls = new Map<string, URL[]>();
    existingUrls.set('bleacherreport.com', [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')]);

    const otherExistingUrls = new Map<string, URL[]>();
    otherExistingUrls.set('www.metoffice.gov.uk', [new URL('https://www.metoffice.gov.uk/weather/forecast/gcpv7fnqu'), new URL('https://www.metoffice.gov.uk/weather/forecast/gcrwgdr98')]);

    const newUrls = [new URL('https://us.cnn.com/')];

    const expected : URL[] = [new URL('https://us.cnn.com/')];

    const actual = getNewUrlsFromManySources(newUrls, existingUrls, otherExistingUrls);

    assertUrls(actual, expected);
  });

  test('Same Host, New URL - Returns New URL', () =>{
    const existingUrls = new Map<string, URL[]>();
    existingUrls.set('bleacherreport.com', [new URL('https://bleacherreport.com/dallas-cowboys'), new URL('https://bleacherreport.com/nfl')]);

    const otherExistingUrls = new Map<string, URL[]>();
    otherExistingUrls.set('www.metoffice.gov.uk', [new URL('https://www.metoffice.gov.uk/weather/forecast/gcpv7fnqu'), new URL('https://www.metoffice.gov.uk/weather/forecast/gcrwgdr98')]);

    const newUrls = [new URL('https://bleacherreport.com/rugby')];

    const expected : URL[] = [new URL('https://bleacherreport.com/rugby')];

    const actual = getNewUrlsFromManySources(newUrls, existingUrls, otherExistingUrls);

    assertUrls(actual, expected);
  });
});