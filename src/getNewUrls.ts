import {find, every} from 'lodash';
import { IUrlLookup, mergeUrlLookups } from './crawl/readUrls';

const isNewURL = (existingUrls: IUrlLookup, potentialNewUrl: URL): boolean => {
  const hostName = potentialNewUrl.hostname;
  if (!existingUrls.has(hostName)) {
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

const isNewURL = (existingUrls: Map<string, URL[]>, potentialNewUrl: URL): IUrlCompareResult => {
  const hostName = getCleanHost(potentialNewUrl.hostname);
  if (!existingUrls.has(hostName)) {
    return {
      url: potentialNewUrl,
      isNew: false,
      urlsConsidered: [],
    };
  }

  const urlsForHost = existingUrls.get(hostName) || [];

  const isNew = !isUrlContainedInList(potentialNewUrl, urlsForHost);

  const result = {
    url: potentialNewUrl,
    isNew,
    urlsConsidered: urlsForHost,
  };

  return result;
};

const getNewUrls = (existingUrls: Map<string, URL[]>, foundUrls: URL[]): URL[] => {
  return getNewUrlsFromManySources(foundUrls, existingUrls);
};

const isNewURLAcrossManySources = (potentialNewUrl: URL, existingUrls: IUrlLookup) : boolean => {

  return every(existingUrls, (urlMap) => isNewURL(urlMap, potentialNewUrl));
};

const getNewUrlsFromManySources = (foundUrls: URL[], ...existingUrls: IUrlLookup[]): URL[] => {
  const lookup = mergeUrlLookups(...existingUrls);
  return foundUrls.filter((u) => isNewURLAcrossManySources(u, lookup));
};

export {getNewUrls, getNewUrlsFromManySources, isUrlContainedInList, areUrlsMatchy, getCleanHost};
