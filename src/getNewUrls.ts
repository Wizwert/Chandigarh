import {find, every} from 'lodash';

const isNewURL = (existingUrls: Map<string, URL[]>, potentialNewUrl: URL): boolean => {
  const hostName = potentialNewUrl.hostname;
  if (!existingUrls.has(hostName)) {
    return true;
  }

  const urlsForHost = existingUrls.get(hostName) || [];

  const matchingURL = find(urlsForHost, (u) => u.host === potentialNewUrl.host && u.pathname == potentialNewUrl.pathname);

  return !matchingURL;
};

const getNewUrls = (existingUrls: Map<string, URL[]>, foundUrls: URL[]): URL[] => {
  return getNewUrlsFromManySources(foundUrls, existingUrls);
};

const isNewURLAcrossManySources = (potentialNewUrl: URL, existingUrls: Map<string, URL[]>[]) : boolean => {
  return every(existingUrls, (urlMap) => isNewURL(urlMap, potentialNewUrl));
};

const getNewUrlsFromManySources = (foundUrls: URL[], ...existingUrls: Map<string, URL[]>[]): URL[] => {
  return foundUrls.filter((u) => isNewURLAcrossManySources(u, existingUrls));
};

export {getNewUrls, getNewUrlsFromManySources};
