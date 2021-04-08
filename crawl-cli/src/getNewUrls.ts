import {find, uniqBy, every} from 'lodash';
import { ISearchResult } from './searchSite';
import { IUrlLookup, UrlLookup } from './crawl/readUrls';
import fs from "fs";
import { stringify } from 'postcss';

const localizationRegex = /\/[A-z][A-z]\//;
interface IUrlCompareResult {
  searchData: ISearchResult,
  url: URL,
  isNew: boolean,
  urlsConsidered: URL[]
}

const areUrlsMatchy = (left: URL, right: URL) : boolean => {
  if (!areHostsMatchy(left, right)) {
    return false;
  }

  if (left.pathname === right.pathname) {
    return true;
  }

  const leftWithoutLocale = left.pathname.replace(localizationRegex, '').replace(/^\//, '');
  const rightWithoutLocale = right.pathname.replace(localizationRegex, '').replace(/^\//, '');

  if (leftWithoutLocale === rightWithoutLocale) {
    return true;
  }

  const splitLeft = leftWithoutLocale.split('/').map((x) => x.toUpperCase());
  const splitRight = rightWithoutLocale.split('/').map((x) => x.toUpperCase());

  const areUrlsMatching = every(splitLeft, (value) => splitRight.includes(value));

  if (areUrlsMatching) {
    return true;
  }

  if (left.host === 'www.christies.com') {
    return doUrlsShareID(left, right, 'intobjectid');
  }

  if (left.host === 'www.saffronart.com') {
    return doUrlsShareID(left, right, 'L');
  }

  if (left.host === 'www.aguttes.com') {
    return doUrlsShareID(left, right, 'id');
  }

  if (left.host === 'www.sothebys.com') {
    return compareTerminalPath(splitLeft, splitRight) ||
              findLotNumberInPath(splitLeft, splitRight);
  }

  if (left.host.indexOf('ragoarts') > -1) {
    if (left.host.indexOf('archive') > -1 || right.host.indexOf('archive') > -1) {
      return compareTerminalPath(splitLeft, splitRight);
    }
  }

  return false;
};

const findLotNumberInPath = (splitLeft: string[], splitRight: string[]) => {
  const leftLast = splitLeft[splitLeft.length - 1].toLowerCase();
  const rightLast = splitRight[splitRight.length - 1].toLowerCase();

  const splitLeftLast = leftLast.split('.');
  const splitRightLast = rightLast.split('.');

  if (splitLeftLast.length < 2 || splitRightLast.length < 2) {
    return false;
  }

  return splitLeftLast[1] === splitRightLast[1];
};

const compareTerminalPath = (splitLeft: string[], splitRight: string[]) => {
  const leftId = splitLeft[splitLeft.length - 1].toLowerCase();
  const rightID = splitRight[splitRight.length - 1].toLowerCase();

  return leftId === rightID;
};

const areHostsMatchy = (left: URL, right: URL): boolean => {
  const cleanLeftHost = getCleanHost(left.hostname);
  const cleanRightHost = getCleanHost(right.hostname);

  return cleanLeftHost === cleanRightHost;
};

const doUrlsShareID = (left: URL, right: URL, idName: string) : boolean => {
  if (!left || !right || !idName) {
    console.warn('empty params for [doUrlsShareID]');
    return false;
  }

  const leftId = getUrlSearchValue(left.searchParams, idName);
  const rightId = getUrlSearchValue(right.searchParams, idName);

  if (!leftId && !rightId) {
    return false;
  }

  if (leftId === rightId) {
    return true;
  }

  if (leftId) {
    return right.href.toUpperCase().indexOf(leftId.toUpperCase()) > -1;
  }

  if (rightId) {
    return left.href.toUpperCase().indexOf(rightId.toUpperCase()) > -1;
  }

  return false;
};

const getUrlSearchValue = (params: URLSearchParams, idKey: string) : string | null => {
  const keyToSearchFor = idKey.toUpperCase();

  const itr = params.keys();
  let result = itr.next();
  while (!result.done) {
    const key = result.value;

    if (key.toUpperCase() === keyToSearchFor) {
      return params.get(key);
    }

    result = itr.next();
  }

  return null;
};

const isUrlContainedInList = (searchUrl: URL, urls: URL[]) : boolean => {
  const matchingURL = find(urls, (u) => areUrlsMatchy(u, searchUrl));

  return matchingURL !== null && matchingURL !== undefined;
};

const isNewURL = (existingUrls: UrlLookup, potentialNewUrl: ISearchResult): IUrlCompareResult => {
  const hostName = getCleanHost(potentialNewUrl.url.hostname);
  if (!existingUrls[hostName]) {
    return {
      searchData: potentialNewUrl,
      url: potentialNewUrl.url,
      isNew: true,
      urlsConsidered: [],
    };
  }

  const urlsForHost = existingUrls[hostName] || [];

  const isNew = !isUrlContainedInList(potentialNewUrl.url, urlsForHost);

  const result = {
    searchData: potentialNewUrl,
    url: potentialNewUrl.url,
    isNew,
    urlsConsidered: urlsForHost,
  };

  return result;
};

const getNewUrls = (existingUrls: UrlLookup, foundUrls: ISearchResult[]): ISearchResult[] => {
  return getNewUrlsFromManySources(foundUrls, existingUrls);
};

const getCleanHost = (host: string) : string => {
  const split = host.toLowerCase().split('.');
  return `${split[split.length - 2]}.${split[split.length - 1]}`;
};

const mergeExistingUrls = (...existingUrls: IUrlLookup[]): IUrlLookup => {
  const mergedMap = new UrlLookup();
  existingUrls.forEach((map) => {
    for(let k in map){
      const cleanKey = getCleanHost(k);

      const urls = [
        ...(mergedMap[cleanKey] || []),
        ...(map[k] || []),
        ...(map[cleanKey] || []),
      ];

      const uniqUrls = uniqBy(urls, (u) => u.href);

      mergedMap[cleanKey] = uniqUrls;
    }
  });

  return mergedMap;
}

const getNewUrlsFromManySources = (foundUrls: ISearchResult[], mergedMap: IUrlLookup): ISearchResult[] => {
  if(foundUrls.length == 0){
    return [];
  }

  const filterResults = foundUrls.map((u) => isNewURL(mergedMap, u));

  const rejectedResults = filterResults.filter((r) => !r.isNew);

  const urlText = rejectedResults.map(x => x.url.href).join('\n');  

  fs.writeFileSync("C:\\chdg\\rejectedurls.txt", urlText, {flag: 'a'})

  const newResults = filterResults.filter((r) => r.isNew);

  return newResults.map((r) => r.searchData);
};

export {getNewUrls, getNewUrlsFromManySources, isUrlContainedInList, areUrlsMatchy, getCleanHost, mergeExistingUrls};
