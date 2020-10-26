import {readUrls, getUrlIndexMap} from './readUrls';
import {getNewUrlsFromManySources} from './getNewUrls';
import {AutomationSheetID} from './constants';
import SheetWrapper from './SheetWrapper';
import {getClient} from './tokenUtil';
import {findIndex} from 'lodash';

const dedupe = async (isTest: boolean) => {
  const workingUrls = await readUrls();

  const auth = await getClient();

  const urlMap = await getUrlIndexMap(auth, AutomationSheetID, 'New Urls');

  const urls: URL[] = [...urlMap.keys()];

  const deduped = getNewUrlsFromManySources(urls, workingUrls);

  const rangesToClear: string[] = [];

  urls.filter((u) => findIndex(deduped, (d) => d.href === u.href) === -1)
      .forEach((u) => {
        const urlIndex = (urlMap.get(u) || -2) + 1;
        rangesToClear.push(`A${urlIndex}:A${urlIndex}`);
      });

  console.log('Original Count: ', urls.length);
  console.log('Deduped Count: ', deduped.length);
  console.log('Expect: ', 66);

  const testSheet = new SheetWrapper(AutomationSheetID, auth);
  if (!isTest) {
    console.log('committing changes');
    await testSheet.clear(rangesToClear);
  }
};

export {dedupe};